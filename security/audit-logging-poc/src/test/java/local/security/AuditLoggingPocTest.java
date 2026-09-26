package local.security;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.OrderManagement.OrderManagement.OrderManagementApplication;
import com.OrderManagement.OrderManagement.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringBootVersion;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;

import java.net.*;
import java.net.http.*;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

/** Passing reproduces the original missing audit trail; it does not mean the application is fixed. */
class AuditLoggingPocTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private final Path evidence = Path.of("target/evidence").toAbsolutePath();
    private final List<Map<String, Object>> observations = new ArrayList<>();
    private HttpClient http;
    private URI base;

    @Test @Timeout(120)
    void recordsStateChangesWithoutApplicationAuditEvents() throws Exception {
        Files.createDirectories(evidence);
        System.setProperty("poc.logfile", evidence.resolve("application.log").toString());
        URI proxy = URI.create(System.getProperty("poc.zap.proxy", "http://127.0.0.1:8080"));
        if (!"http".equals(proxy.getScheme()) || !"127.0.0.1".equals(proxy.getHost()) || proxy.getPort() < 1) {
            throw new IllegalArgumentException("Use a loopback-only ZAP proxy");
        }
        http = HttpClient.newBuilder().proxy(ProxySelector.of(new InetSocketAddress(proxy.getHost(), proxy.getPort())))
                .connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build();
        try (var app = (ServletWebServerApplicationContext) new SpringApplicationBuilder(OrderManagementApplication.class).run(
                "--spring.config.location=optional:classpath:/isolated-poc.properties",
                "--server.address=127.0.0.1", "--server.port=0", "--spring.main.banner-mode=off",
                "--spring.datasource.url=jdbc:h2:mem:audit_" + UUID.randomUUID() + ";MODE=MySQL",
                "--spring.datasource.driver-class-name=org.h2.Driver", "--spring.datasource.username=sa", "--spring.datasource.password=",
                "--spring.jpa.hibernate.ddl-auto=create-drop", "--spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
                "--spring.jpa.show-sql=true", "--spring.sql.init.mode=never", "--spring.jmx.enabled=false",
                "--logging.config=classpath:logback-poc.xml", "--logging.level.root=INFO",
                "--logging.level.org.springframework.web=INFO", "--logging.level.com.OrderManagement=DEBUG")) {
            base = URI.create("http://127.0.0.1:" + app.getWebServer().getPort());
            Logger root = (Logger) LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
            ListAppender<ILoggingEvent> capture = new ListAppender<>();
            capture.setContext(root.getLoggerContext()); capture.start(); root.addAppender(capture);
            var probe = LoggerFactory.getLogger("local.security.HarnessControl");
            Instant started = Instant.now();
            try {
                // Harness-only markers verify capture works. They are NOT application audit events.
                probe.info("POC_CAPTURE_BEGIN: synthetic fixture requests; harness marker only");
                String fixture = """
                        {"userId":"POC-AUDIT-OWNER","restaurantId":"POC-AUDIT-RESTAURANT",
                         "deliveryAddress":"Local audit test fixture","contactPhone":"0000000000",
                         "deliveryFee":1,"tax":1,
                         "orderItems":[{"menuItemId":"POC-MENU-001","itemName":"Audit test meal",
                         "quantity":1,"unitPrice":10,"totalPrice":10}]}
                        """;
                var created = request("01-create", "POST", "/api/v1/orders", fixture, 201);
                long id = JSON.readTree(created.body()).path("orderId").asLong();
                assertTrue(id > 0);
                String path = "/api/v1/orders/" + id;
                var before = request("02-before", "GET", path, null, 200);
                assertEquals("PLACED", JSON.readTree(before.body()).path("status").asText());
                var updated = request("03-confirm", "PATCH", path + "/status", "{\"status\":\"CONFIRMED\"}", 200);
                assertEquals("CONFIRMED", JSON.readTree(updated.body()).path("status").asText());
                var rejected = request("04-rejected-transition", "PATCH", path + "/status", "{\"status\":\"DELIVERED\"}", 400);
                assertTrue(JSON.readTree(rejected.body()).path("message").asText().contains("CONFIRMED"));
                var cancelled = request("05-cancel", "PATCH", path + "/status", "{\"status\":\"CANCELLED\"}", 200);
                assertEquals("CANCELLED", JSON.readTree(cancelled.body()).path("status").asText());
                request("06-delete", "DELETE", path, null, 204);
                request("07-after", "GET", path, null, 404);
                assertFalse(app.getBean(OrderRepository.class).existsById(id));
                probe.info("POC_CAPTURE_END: synthetic fixture requests; harness marker only");

                var events = new ArrayList<>(capture.list);
                List<Map<String, Object>> records = new ArrayList<>();
                for (var event : events) {
                    var record = new LinkedHashMap<String, Object>();
                    record.put("timestampUtc", Instant.ofEpochMilli(event.getTimeStamp()).toString());
                    record.put("logger", event.getLoggerName()); record.put("level", event.getLevel().toString());
                    record.put("message", event.getFormattedMessage()); record.put("mdc", event.getMDCPropertyMap());
                    records.add(record);
                }
                long controlEvents = events.stream().filter(e -> e.getLoggerName().equals("local.security.HarnessControl")).count();
                var applicationEvents = events.stream().filter(e -> e.getLoggerName().startsWith("com.OrderManagement.")).toList();
                write("captured-logging-events.json", records);
                var summary = new LinkedHashMap<String, Object>();
                summary.put("finding", "Missing application security audit trail for order changes and deletion");
                summary.put("startedAtUtc", started.toString()); summary.put("endedAtUtc", Instant.now().toString());
                summary.put("springBootVersion", SpringBootVersion.getVersion()); summary.put("javaVersion", System.getProperty("java.version"));
                summary.put("baseUrl", base.toString()); summary.put("zapProxy", proxy.toString()); summary.put("orderId", id);
                summary.put("requestCount", observations.size()); summary.put("requests", observations);
                summary.put("orderExistsAfterDeletion", false); summary.put("loggingCaptureControlEvents", controlEvents);
                summary.put("capturedLogbackEvents", events.size()); summary.put("orderPackageLogEvents", applicationEvents.size());
                summary.put("loggingLevels", Map.of("root", "INFO", "org.springframework.web", "INFO", "com.OrderManagement", "DEBUG"));
                summary.put("sqlLoggingEnabled", true);
                summary.put("scope", "Actual original Order_Service HTTP/controller/service/repository. Disposable H2 replaces MySQL; direct loopback service through ZAP; no gateway or real user data.");
                summary.put("interpretation", "All seven expected HTTP outcomes and actual deletion verified. Zero log events from the order application package were captured; source review also found no dedicated audit logger or audit entity for these paths. Framework logs and SQL output still exist.");
                summary.put("limitations", "Bounded local observation, not proof that every deployment lacks external monitoring. The fixture userId is request data, not authenticated actor attribution. No logging fix has been implemented or tested.");
                write("summary.json", summary);
                assertEquals(2, controlEvents, "Capture must work at both ends of the observation window");
                assertEquals(0, applicationEvents.size(), "A passing PoC reproduces missing order application audit events");
                System.out.println("AUDIT POC: 7 ZAP-proxied requests; statuses 201,200,200,400,200,204,404");
                System.out.println("AUDIT POC: order removed; 2 capture-control events; 0 order-package audit/log events");
            } finally { root.detachAppender(capture); capture.stop(); }
        }
    }

    private HttpResponse<String> request(String label, String method, String path, String body, int expectedStatus) throws Exception {
        URI uri = base.resolve(path);
        String correlation = "AUDIT-POC-" + label;
        var builder = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(15)).header("X-Request-ID", correlation);
        if (body != null) builder.header("Content-Type", "application/json");
        var response = http.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
        Files.writeString(evidence.resolve(label + "-request.http"), method + " " + uri + " HTTP/1.1\nX-Request-ID: " + correlation
                + (body == null ? "\n\n" : "\nContent-Type: application/json\n\n" + body));
        Files.writeString(evidence.resolve(label + "-response.http"), "HTTP " + response.statusCode() + "\n"
                + response.headers().map() + "\n\n" + response.body());
        var observation = new LinkedHashMap<String, Object>();
        observation.put("step", label); observation.put("method", method); observation.put("url", uri.toString());
        observation.put("requestId", correlation); observation.put("status", response.statusCode()); observation.put("body", response.body());
        observations.add(observation);
        assertEquals(expectedStatus, response.statusCode(), label + ": " + response.body());
        return response;
    }

    private void write(String name, Object value) throws Exception {
        JSON.writerWithDefaultPrettyPrinter().writeValue(evidence.resolve(name).toFile(), value);
    }
}

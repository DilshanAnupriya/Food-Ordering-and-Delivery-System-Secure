package local.security;

import com.OrderManagement.OrderManagement.OrderManagementApplication;
import com.OrderManagement.OrderManagement.model.OrderItem;
import com.OrderManagement.OrderManagement.model.OrderModel;
import com.OrderManagement.OrderManagement.service.OrderService;
import com.example.Notification.NotificationApplication;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetup;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.boot.SpringBootVersion;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;

import java.math.BigDecimal;
import java.net.URI;
import java.net.ProxySelector;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Bounded reproduction tests: passing means the original weakness was reproduced. */
// Archived BEFORE test: its expected results intentionally describe the vulnerable repository.
// To reproduce the baseline, use the archived test against the original repository source.
@org.junit.jupiter.api.Disabled("Historical before-fix test; use ResourceConsumptionFixTest in the secure repository")
class ResourceConsumptionPocTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Path EVIDENCE = Path.of(System.getProperty("poc.evidence", "target/evidence"));
    private static final HttpClient HTTP = httpClient();

    private static HttpClient httpClient() {
        var builder = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NEVER);
        String zapProxy = System.getProperty("poc.zap.proxy");
        if (zapProxy != null) {
            URI proxy = URI.create(zapProxy);
            if (!"http".equals(proxy.getScheme()) || !"127.0.0.1".equals(proxy.getHost())
                    || proxy.getPort() < 1) {
                throw new IllegalArgumentException("The ZAP PoC proxy must use http://127.0.0.1:<port>");
            }
            builder.proxy(ProxySelector.of(new java.net.InetSocketAddress(proxy.getHost(), proxy.getPort())));
        }
        return builder.build();
    }

    @Test
    @Timeout(120)
    void pagination() throws Exception {
        Path directory = EVIDENCE.resolve("pagination");
        Files.createDirectories(directory);
        try (var app = start(OrderManagementApplication.class)) {
            // Use the real service and repository to seed an isolated, disposable H2 database.
            OrderService orders = app.getBean(OrderService.class);
            for (int i = 1; i <= 250; i++) {
                OrderItem item = OrderItem.builder()
                        .menuItemId("POC-MENU-001").itemName("PoC sample meal")
                        .quantity(1).unitPrice(new BigDecimal("10.00"))
                        .totalPrice(new BigDecimal("10.00")).build();
                orders.createOrder(OrderModel.builder()
                        .userId("POC-USER").restaurantId("POC-RESTAURANT")
                        .deliveryAddress("Local PoC fixture " + i).contactPhone("0000000000")
                        .deliveryFee(BigDecimal.ONE).tax(BigDecimal.ONE)
                        .orderItems(new ArrayList<>(List.of(item))).build());
            }

            var baseline = get(app, directory, "baseline", 10);
            var oversized = get(app, directory, "oversized", 200);
            var summary = metadata("Unbounded pagination", app);
            summary.put("seededOrders", 250);
            summary.put("baseline", baseline);
            summary.put("oversized", oversized);
            summary.put("scope", "Direct service HTTP with original controller/service/repository; H2 replaces MySQL; no gateway.");
            summary.put("limitation", "Demonstrates acceptance of size=200, not absence of every possible limit or a denial of service. Timing is descriptive, not a benchmark.");
            writeJson(directory.resolve("summary.json"), summary);

            assertEquals(200, baseline.get("status"));
            assertEquals(200, oversized.get("status"));
            assertEquals(10, baseline.get("returnedOrders"));
            assertEquals(200, oversized.get("returnedOrders"));
            assertEquals(250, oversized.get("totalItems"));
            System.out.printf("POC PAGINATION: size=10 -> %s orders (%s bytes); size=200 -> %s orders (%s bytes).%n",
                    baseline.get("returnedOrders"), baseline.get("responseBytes"),
                    oversized.get("returnedOrders"), oversized.get("responseBytes"));
        }
    }

    @Test
    @Timeout(120)
    void notifications() throws Exception {
        Path directory = EVIDENCE.resolve("notifications");
        Files.createDirectories(directory);
        // GreenMail captures messages locally and never forwards them to real recipients.
        GreenMail mail = new GreenMail(new ServerSetup(0, "127.0.0.1", ServerSetup.PROTOCOL_SMTP));
        mail.setUser("vidura-test@example.test", "poc", "poc");
        mail.start();
        try (var app = start(NotificationApplication.class,
                "--spring.mail.host=127.0.0.1",
                "--spring.mail.port=" + mail.getSmtp().getPort(),
                "--spring.mail.properties.mail.smtp.auth=false",
                "--spring.mail.properties.mail.smtp.starttls.enable=false",
                "--spring.mail.properties.mail.smtp.from=poc-sender@example.test",
                "--spring.mail.properties.mail.smtp.connectiontimeout=5000",
                "--spring.mail.properties.mail.smtp.timeout=5000",
                "--spring.mail.properties.mail.smtp.writetimeout=5000")) {
            String payload = """
                    {"email":"vidura-test@example.test","orderId":"TEST-ORDER-001","amount":25.00,"paymentStatus":"SUCCESS"}
                    """;
            URI uri = endpoint(app, "/api/notifications/payment-confirmation");
            Files.writeString(directory.resolve("request.http"),
                    "POST " + uri + "\nContent-Type: application/json\n\n" + payload);
            List<Map<String, Object>> responses = new ArrayList<>();
            long started = System.nanoTime();
            // Six sequential requests only: this is a functional PoC, not a load test.
            for (int i = 1; i <= 6; i++) {
                HttpRequest request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(10))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload)).build();
                var response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());
                var record = new LinkedHashMap<String, Object>();
                record.put("requestNumber", i);
                record.put("status", response.statusCode());
                record.put("headers", response.headers().map());
                record.put("body", response.body());
                responses.add(record);
            }
            long durationMs = (System.nanoTime() - started) / 1_000_000;
            mail.waitForIncomingEmail(5000, 6);
            var messages = mail.getReceivedMessages();
            for (int i = 0; i < messages.length; i++) {
                try (var output = Files.newOutputStream(directory.resolve("message-" + (i + 1) + ".eml"))) {
                    messages[i].writeTo(output);
                }
            }
            var summary = metadata("Repeated notification requests", app);
            summary.put("requestCount", 6);
            summary.put("durationMs", durationMs);
            summary.put("responses", responses);
            summary.put("capturedEmails", messages.length);
            summary.put("smtpHost", "127.0.0.1");
            summary.put("smtpPort", mail.getSmtp().getPort());
            summary.put("scope", "Direct service HTTP and actual JavaMailSender delivery to local GreenMail; no real SMTP provider.");
            summary.put("limitation", "Six accepted requests demonstrate repeated delivery without throttling in this sample; they do not establish absence of a higher threshold, quota exhaustion, or service outage.");
            writeJson(directory.resolve("summary.json"), summary);

            assertTrue(responses.stream().allMatch(r -> r.get("status").equals(200)),
                    "All six requests should succeed in the original vulnerable implementation");
            assertEquals(6, messages.length);
            for (var message : messages) {
                assertEquals("Payment Confirmation - Order #TEST-ORDER-001", message.getSubject());
                assertEquals("vidura-test@example.test", message.getAllRecipients()[0].toString());
            }
            System.out.printf("POC NOTIFICATIONS: 6 identical POSTs in %d ms -> 6 HTTP 200 responses, %d captured emails, 0 HTTP 429 responses.%n",
                    durationMs, messages.length);
        } finally {
            mail.stop();
        }
    }

    private static ServletWebServerApplicationContext start(Class<?> application, String... extra) {
        List<String> arguments = new ArrayList<>(List.of(
                // Ignore the production property files (including database and SMTP credentials).
                "--spring.config.location=optional:classpath:/poc-only.properties",
                "--server.address=127.0.0.1", "--server.port=0",
                "--spring.datasource.url=jdbc:h2:mem:poc_" + UUID.randomUUID() + ";MODE=MySQL",
                "--spring.datasource.driver-class-name=org.h2.Driver",
                "--spring.datasource.username=sa", "--spring.datasource.password=",
                "--spring.jpa.hibernate.ddl-auto=create-drop",
                "--spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
                "--spring.sql.init.mode=never", "--spring.jmx.enabled=false",
                "--spring.main.banner-mode=off", "--logging.level.root=WARN"));
        arguments.addAll(List.of(extra));
        return (ServletWebServerApplicationContext) new SpringApplicationBuilder(application)
                .run(arguments.toArray(String[]::new));
    }

    private static URI endpoint(ServletWebServerApplicationContext app, String path) {
        return URI.create("http://127.0.0.1:" + app.getWebServer().getPort() + path);
    }

    private static Map<String, Object> get(ServletWebServerApplicationContext app, Path directory,
                                            String name, int size) throws Exception {
        URI uri = endpoint(app, "/api/v1/orders?page=0&size=" + size);
        Files.writeString(directory.resolve(name + "-request.http"), "GET " + uri + "\n");
        long started = System.nanoTime();
        var response = HTTP.send(HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(15)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        long durationMs = (System.nanoTime() - started) / 1_000_000;
        Files.writeString(directory.resolve(name + "-response.json"), response.body());
        JsonNode body = JSON.readTree(response.body());
        var result = new LinkedHashMap<String, Object>();
        result.put("url", uri.toString());
        result.put("requestedSize", size);
        result.put("status", response.statusCode());
        result.put("headers", response.headers().map());
        result.put("returnedOrders", body.path("orders").size());
        result.put("totalItems", body.path("totalItems").asInt());
        result.put("responseBytes", response.body().getBytes(StandardCharsets.UTF_8).length);
        result.put("durationMs", durationMs);
        return result;
    }

    private static Map<String, Object> metadata(String finding, ServletWebServerApplicationContext app) {
        var result = new LinkedHashMap<String, Object>();
        result.put("finding", finding);
        result.put("recordedAtUtc", Instant.now().toString());
        result.put("springBootVersion", SpringBootVersion.getVersion());
        result.put("javaVersion", System.getProperty("java.version"));
        result.put("httpHost", "127.0.0.1");
        result.put("httpPort", app.getWebServer().getPort());
        if (System.getProperty("poc.zap.proxy") != null) {
            result.put("zapProxy", System.getProperty("poc.zap.proxy"));
        }
        return result;
    }

    private static void writeJson(Path path, Object value) throws Exception {
        JSON.writerWithDefaultPrettyPrinter().writeValue(path.toFile(), value);
    }
}

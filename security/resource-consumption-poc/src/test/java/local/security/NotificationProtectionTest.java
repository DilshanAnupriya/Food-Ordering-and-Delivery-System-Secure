package local.security;

import com.example.Notification.NotificationApplication;
import com.example.Notification.repository.NotificationDeliveryRepository;
import com.example.Notification.service.ProtectedNotificationService;
import com.example.Notification.service.ProtectedNotificationService.DeliveryResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetup;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import java.net.http.*;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class NotificationProtectionTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private GreenMail mail;
    @TempDir Path temporary;

    @BeforeEach void startMail() {
        mail = new GreenMail(new ServerSetup(0, "127.0.0.1", ServerSetup.PROTOCOL_SMTP));
        mail.setUser("vidura-test@example.test", "poc", "poc");
        mail.start();
    }
    @AfterEach void stopMail() { mail.stop(); }

    private ServletWebServerApplicationContext app(String... extra) {
        var args = new ArrayList<>(List.of(
                "--spring.mail.host=127.0.0.1", "--spring.mail.port=" + mail.getSmtp().getPort(),
                "--spring.mail.properties.mail.smtp.auth=false", "--spring.mail.properties.mail.smtp.starttls.enable=false",
                "--spring.mail.properties.mail.smtp.from=poc-sender@example.test",
                "--spring.mail.properties.mail.smtp.connectiontimeout=5000", "--spring.mail.properties.mail.smtp.timeout=5000",
                "--spring.mail.properties.mail.smtp.writetimeout=5000"));
        args.addAll(List.of(extra));
        return ResourceConsumptionFixTest.start(NotificationApplication.class, args.toArray(String[]::new));
    }
    private HttpResponse<String> post(ServletWebServerApplicationContext app, String path, String body, String spoofedIp) throws Exception {
        var request = HttpRequest.newBuilder(ResourceConsumptionFixTest.endpoint(app, path))
                .timeout(java.time.Duration.ofSeconds(15)).header("Content-Type", "application/json");
        if (spoofedIp != null) request.header("X-Forwarded-For", spoofedIp);
        return HTTP.send(request.POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }
    private String payment(String id, double amount) {
        return "{\"email\":\"vidura-test@example.test\",\"orderId\":\"" + id + "\",\"amount\":" + amount + ",\"paymentStatus\":\"SUCCESS\"}";
    }
    private String status(HttpResponse<String> response) throws Exception {
        return JSON.readTree(response.body()).path("deliveryStatus").asText();
    }

    @Test void distinctEventsAreLimitedAndForwardedHeadersCannotChangeCaller() throws Exception {
        try (var app = app()) {
            for (int i = 1; i <= 5; i++) {
                var response = post(app, "/api/notifications/payment-confirmation", payment("ORDER-" + i, 25), "198.51.100." + i);
                assertEquals(200, response.statusCode()); assertEquals("SENT", status(response));
            }
            var blocked = post(app, "/api/notifications/payment-confirmation", payment("ORDER-6", 25), "198.51.100.6");
            assertEquals(429, blocked.statusCode());
            assertTrue(Long.parseLong(blocked.headers().firstValue("Retry-After").orElseThrow()) >= 1);
            assertTrue(mail.waitForIncomingEmail(5000, 5));
            assertEquals(5, mail.getReceivedMessages().length);
            assertEquals(5, app.getBean(NotificationDeliveryRepository.class).count());
        }
    }

    @Test void everyRouteSharesQuotaAndLegacyAliasSharesDeduplication() throws Exception {
        try (var app = app()) {
            var order = "/api/notifications/order-confirmation?email=vidura-test@example.test&orderId=ORDER-1&totalAmount=25";
            assertEquals("SENT", status(post(app, order, "", null)));
            var legacy = "/api/orders/confirm?email=vidura-test@example.test&orderId=ORDER-1&totalAmount=999";
            assertEquals("ALREADY_SENT", status(post(app, legacy, "", null)));
            assertEquals("SENT", status(post(app, "/api/notifications/restaurant-confirmation",
                    "{\"email\":\"vidura-test@example.test\",\"restaurantName\":\"Test\",\"restaurantId\":\"REST-1\"}", null)));
            assertEquals("SENT", status(post(app, "/api/notifications/driver-status",
                    "{\"email\":\"vidura-test@example.test\",\"driverName\":\"Test\",\"driverId\":\"DRIVER-1\",\"status\":\"APPROVED\"}", null)));
            assertEquals("SENT", status(post(app, "/api/notifications/payment-confirmation", payment("ORDER-1", 25), null)));
            assertEquals(429, post(app, legacy.replace("ORDER-1", "ORDER-2"), "", null).statusCode());
            assertTrue(mail.waitForIncomingEmail(5000, 4));
            assertEquals(4, mail.getReceivedMessages().length);
        }
    }

    @Test void invalidInputsDoNotSendOrConsumeQuota() throws Exception {
        try (var app = app()) {
            String path = "/api/notifications/payment-confirmation";
            for (String invalid : List.of(payment("", 25), payment("ORDER-1", -1),
                    payment("ORDER-1", 25).replace("SUCCESS", "ARBITRARY"),
                    payment("ORDER-1", 25).replace("vidura-test@example.test", "invalid"))) {
                assertEquals(400, post(app, path, invalid, null).statusCode());
            }
            assertEquals(400, post(app, "/api/notifications/restaurant-confirmation",
                    "{\"email\":\"vidura-test@example.test\",\"restaurantName\":\"Test\"}", null).statusCode());
            for (String amount : List.of("-1", "NaN", "Infinity")) {
                assertEquals(400, post(app, "/api/orders/confirm?email=vidura-test@example.test&orderId=ORDER-1&totalAmount=" + amount, "", null).statusCode());
            }
            assertEquals(0, app.getBean(NotificationDeliveryRepository.class).count());
            assertEquals(0, mail.getReceivedMessages().length);
            for (int i = 1; i <= 5; i++) assertEquals(200, post(app, path, payment("ORDER-" + i, 25), null).statusCode());
        }
    }

    @Test void changingAmountCannotResendAndPersistentReceiptSurvivesRestart() throws Exception {
        String database = "--spring.datasource.url=jdbc:h2:file:" + temporary.resolve("deliveries").toAbsolutePath();
        try (var app = app(database, "--spring.jpa.hibernate.ddl-auto=update")) {
            assertEquals("SENT", status(post(app, "/api/notifications/payment-confirmation", payment("ORDER-1", 25), null)));
        }
        try (var app = app(database, "--spring.jpa.hibernate.ddl-auto=update")) {
            assertEquals("ALREADY_SENT", status(post(app, "/api/notifications/payment-confirmation", payment("ORDER-1", 999), null)));
            assertEquals(1, app.getBean(NotificationDeliveryRepository.class).count());
            assertEquals(1, mail.getReceivedMessages().length);
        }
    }

    @Test void concurrentDuplicateClaimsOnlyInvokeSenderOnce() throws Exception {
        try (var app = app("--notification.protection.caller-limit=50", "--notification.protection.recipient-limit=50")) {
            var service = app.getBean(ProtectedNotificationService.class);
            var request = new MockHttpServletRequest(); request.setRemoteAddr("127.0.0.1");
            var sends = new AtomicInteger();
            var go = new CountDownLatch(1);
            var senderStarted = new CountDownLatch(1);
            var finishSender = new CountDownLatch(1);
            var pool = Executors.newFixedThreadPool(8);
            try {
                List<Future<DeliveryResult>> futures = new ArrayList<>();
                for (int i = 0; i < 8; i++) futures.add(pool.submit(() -> {
                    go.await();
                    return service.deliver(request, "payment", "ORDER-1", "vidura-test@example.test", "SUCCESS", () -> {
                        sends.incrementAndGet(); senderStarted.countDown();
                        try { assertTrue(finishSender.await(10, TimeUnit.SECONDS)); }
                        catch (InterruptedException e) { throw new RuntimeException(e); }
                    });
                }));
                go.countDown(); assertTrue(senderStarted.await(5, TimeUnit.SECONDS));
                // Let competing claims observe the committed PROCESSING row while the send is in progress.
                finishSender.countDown();
                int sent = 0;
                for (var future : futures) if (future.get(10, TimeUnit.SECONDS) == DeliveryResult.SENT) sent++;
                assertEquals(1, sent); assertEquals(1, sends.get());
                assertEquals(1, app.getBean(NotificationDeliveryRepository.class).count());
            } finally { finishSender.countDown(); pool.shutdownNow(); }
        }
    }

    @Test void definiteSendFailureReleasesClaimForRetry() {
        try (var app = app()) {
            var request = new MockHttpServletRequest(); request.setRemoteAddr("127.0.0.1");
            var service = app.getBean(ProtectedNotificationService.class);
            var ledger = app.getBean(NotificationDeliveryRepository.class);
            assertThrows(IllegalStateException.class, () -> service.deliver(request, "payment", "ORDER-1",
                    "vidura-test@example.test", "SUCCESS", () -> { throw new IllegalStateException("Simulated pre-delivery failure"); }));
            assertEquals(0, ledger.count());
            var sends = new AtomicInteger();
            assertEquals(DeliveryResult.SENT, service.deliver(request, "payment", "ORDER-1",
                    "vidura-test@example.test", "SUCCESS", sends::incrementAndGet));
            assertEquals(1, sends.get()); assertEquals(1, ledger.count());
        }
    }
}

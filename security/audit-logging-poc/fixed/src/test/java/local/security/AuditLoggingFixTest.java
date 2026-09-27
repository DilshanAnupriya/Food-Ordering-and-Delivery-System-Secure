package local.security;

import com.OrderManagement.OrderManagement.OrderManagementApplication;
import com.OrderManagement.OrderManagement.audit.*;
import com.OrderManagement.OrderManagement.model.*;
import com.OrderManagement.OrderManagement.repository.OrderRepository;
import com.OrderManagement.OrderManagement.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.mock.web.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import static org.junit.jupiter.api.Assertions.*;
import static com.OrderManagement.OrderManagement.audit.SecurityAuditEvent.Action.*;

class AuditLoggingFixTest {
    // Synthetic key used only by isolated local tests; never a deployment credential.
    private static final String KEY = "audit-fixture-only-key-not-for-production-2026";
    private static final String OWNER = "POC-AUDIT-OWNER";
    private static final ObjectMapper JSON = new ObjectMapper().findAndRegisterModules();
    private static final String FIXTURE = """
        {"userId":"POC-AUDIT-OWNER","restaurantId":"POC-AUDIT-RESTAURANT",
         "deliveryAddress":"Local synthetic address","contactPhone":"0000000000",
         "deliveryFee":1,"tax":1,"orderItems":[{"menuItemId":"POC-MENU-001",
         "itemName":"Audit test meal","quantity":1,"unitPrice":10,"totalPrice":10}]}
        """;
    private final Path evidence = Path.of("target/evidence").toAbsolutePath();
    private final List<Map<String,Object>> observations = new ArrayList<>();
    private HttpClient http;
    private URI base;

    private ServletWebServerApplicationContext start(String database, String ddl) {
        return (ServletWebServerApplicationContext) new SpringApplicationBuilder(OrderManagementApplication.class).run(
                "--spring.config.location=optional:classpath:/isolated-audit.properties",
                "--server.address=127.0.0.1", "--server.port=0", "--spring.main.banner-mode=off",
                "--spring.datasource.url=" + database, "--spring.datasource.driver-class-name=org.h2.Driver",
                "--spring.datasource.username=sa", "--spring.datasource.password=",
                "--spring.jpa.hibernate.ddl-auto=" + ddl, "--spring.jpa.open-in-view=true",
                "--spring.sql.init.mode=never", "--spring.jmx.enabled=false", "--logging.level.root=WARN",
                "--security.audit.jwt-secret=" + KEY);
    }

    @Test @Timeout(120)
    void zapWorkflowRetainsAuditAfterDeletionAndRestart() throws Exception {
        Files.createDirectories(evidence);
        URI proxy = URI.create(System.getProperty("poc.zap.proxy", "http://127.0.0.1:8080"));
        assertEquals("127.0.0.1", proxy.getHost()); assertEquals("http", proxy.getScheme());
        http = HttpClient.newBuilder().proxy(ProxySelector.of(new InetSocketAddress(proxy.getHost(),proxy.getPort())))
                .connectTimeout(Duration.ofSeconds(5)).build();
        String database = "jdbc:h2:file:" + evidence.resolve("audit-" + UUID.randomUUID()) + ";MODE=MySQL";
        long id; long count;
        try (var app = start(database, "create")) {
            base = URI.create("http://127.0.0.1:" + app.getWebServer().getPort());
            var repository = app.getBean(SecurityAuditRepository.class);
            id = JSON.readTree(request("01-create", "POST", "/api/v1/orders", FIXTURE, 201, OWNER, true).body()).get("orderId").asLong();
            String path = "/api/v1/orders/" + id;
            request("02-read", "GET", path, null, 200, OWNER, true);
            request("03-update", "PUT", path, FIXTURE.replace("Local synthetic address", "Updated synthetic address"),200,OWNER,true);
            request("04-confirm", "PATCH", path+"/status", "{\"status\":\"CONFIRMED\"}",200,OWNER,true);
            request("05-rejected-transition", "PATCH",path+"/status","{\"status\":\"DELIVERED\"}",400,OWNER,true);
            assertEquals(OrderStatus.CONFIRMED, app.getBean(OrderRepository.class).findById(id).orElseThrow().getStatus());
            request("06-denied", "PATCH",path+"/status","{\"status\":\"CANCELLED\"}",403,"POC-OTHER",true);
            request("07-null-status", "PATCH",path+"/status","{\"status\":null}",400,OWNER,true);
            request("08-invalid-status", "PATCH",path+"/status","{\"status\":\"INVALID\"}",400,OWNER,true);
            request("09-malformed-json", "PATCH",path+"/status","{",400,OWNER,true);
            request("10-cancel", "PATCH",path+"/status","{\"status\":\"CANCELLED\"}",200,OWNER,true);
            request("11-delete", "DELETE",path,null,204,OWNER,true);
            request("12-after-delete", "GET",path,null,404,OWNER,true);
            assertFalse(app.getBean(OrderRepository.class).existsById(id));
            var records = repository.findByOrderIdOrderByOccurredAtAsc(id);
            assertEquals(11, records.size());
            assertEquals(5, records.stream().filter(e -> e.getOutcome().equals("SUCCESS")).count());
            assertEquals(1, records.stream().filter(e -> e.getOutcome().equals("DENIED")).count());
            assertTrue(records.stream().allMatch(e -> e.getIdentitySource().equals("VERIFIED_JWT")));
            var confirmed = records.stream().filter(e -> e.getAction()==CHANGE_STATUS && e.getNewStatus()==OrderStatus.CONFIRMED).findFirst().orElseThrow();
            assertEquals(OrderStatus.PLACED, confirmed.getPreviousStatus());
            assertEquals(OWNER, confirmed.getActorId());
            var deleted = records.stream().filter(e -> e.getAction()==DELETE_ORDER).findFirst().orElseThrow();
            assertEquals(OrderStatus.CANCELLED, deleted.getPreviousStatus()); assertNull(deleted.getNewStatus());
            var unverified = request("13-unverified-identity", "POST","/api/v1/orders",
                    FIXTURE.replace(OWNER,"SPOOFED-BODY-OWNER"),201,"SPOOFED-HEADER-OWNER",false);
            var unverifiedEvent = repository.findByRequestId(unverified.headers().firstValue("X-Request-ID").orElseThrow()).get(0);
            assertEquals("UNVERIFIED", unverifiedEvent.getActorId());
            count = repository.count(); assertEquals(12,count);
            // Every response has a server-generated correlation ID, matching its audit row (except normal reads).
            for (var observation : observations) {
                var matching = repository.findByRequestId(observation.get("requestId").toString());
                assertEquals(observation.get("step").equals("02-read") ? 0 : 1, matching.size());
            }
            String serialized = JSON.writeValueAsString(records);
            assertFalse(serialized.contains("synthetic address")); assertFalse(serialized.contains("0000000000"));
            assertFalse(serialized.contains("Bearer")); assertFalse(serialized.contains(KEY));
            JSON.writerWithDefaultPrettyPrinter().writeValue(evidence.resolve("audit-records.json").toFile(),records);
            var csv = new StringBuilder("time,actor,identity_source,action,order_id,outcome,http_status,previous_status,new_status,request_id\n");
            for(var e: records) csv.append(String.join(",",e.getOccurredAt().toString(),e.getActorId(),e.getIdentitySource(),
                    e.getAction().name(),e.getOrderId().toString(),e.getOutcome(),String.valueOf(e.getHttpStatus()),
                    String.valueOf(e.getPreviousStatus()),String.valueOf(e.getNewStatus()),e.getRequestId())).append('\n');
            Files.writeString(evidence.resolve("audit-records.csv"),csv);
        }
        try (var restarted = start(database,"validate")) {
            assertEquals(count, restarted.getBean(SecurityAuditRepository.class).count());
            assertEquals(11, restarted.getBean(SecurityAuditRepository.class).findByOrderIdOrderByOccurredAtAsc(id).size());
            assertFalse(restarted.getBean(OrderRepository.class).existsById(id));
        }
        var summary = new LinkedHashMap<String,Object>();
        summary.put("baseUrl",base.toString()); summary.put("zapProxy",proxy.toString()); summary.put("requests",observations);
        summary.put("requestCount",observations.size()); summary.put("deletedOrderId",id); summary.put("retainedEventsForDeletedOrder",11);
        summary.put("totalAuditRecordsAfterRestart",count); summary.put("orderExistsAfterDeletion",false);
        summary.put("scope","Actual secure Order_Service; loopback ZAP proxy; synthetic JWTs/data; file-backed H2; gateway/MySQL not exercised.");
        JSON.writerWithDefaultPrettyPrinter().writeValue(evidence.resolve("summary.json").toFile(),summary);
        Files.writeString(evidence.resolve("verification.txt"),"PASS: 13 ZAP-proxied requests with expected responses.\n"
                +"PASS: 11 audit records retained for deleted order (5 SUCCESS, 1 DENIED, 5 REJECTED).\n"
                +"PASS: verified JWT actor attribution; spoofed headers/body without JWT labelled UNVERIFIED.\n"
                +"PASS: 12 total audit records survive application restart; deleted order remains absent.\n"
                +"PASS: audit records exclude tokens, addresses, phone numbers and signing secrets.\n");
    }

    @Test @Timeout(90)
    void transactionsPreventFalseSuccessAndRetainRejectionOnRollback() throws Exception {
        try(var app=start("jdbc:h2:mem:transactions_"+UUID.randomUUID(),"create-drop")) {
            var orders=app.getBean(OrderService.class); var repository=app.getBean(OrderRepository.class);
            var audit=app.getBean(SecurityAuditRepository.class); var writer=app.getBean(SecurityAuditService.class);
            var tx=new TransactionTemplate(app.getBean(PlatformTransactionManager.class));
            var id=new AtomicLong();
            tx.executeWithoutResult(status -> { try {
                id.set(orders.createOrder(JSON.readValue(FIXTURE,OrderModel.class)).getOrderId());
                status.setRollbackOnly();
            } catch(Exception ex) { throw new RuntimeException(ex); } });
            assertFalse(repository.existsById(id.get())); assertEquals(0,audit.count());
            tx.executeWithoutResult(status -> {
                writer.rejected(CHANGE_STATUS,99L,400,"ORDER_RULE_REJECTED"); status.setRollbackOnly();
            });
            assertEquals(1,audit.count());
            var order=orders.createOrder(JSON.readValue(FIXTURE,OrderModel.class));
            assertEquals("SYSTEM",audit.findByOrderIdOrderByOccurredAtAsc(order.getOrderId()).get(0).getActorId());
            var jdbc=app.getBean(JdbcTemplate.class);
            // Simulate audit storage rejecting one event while the business table remains writable.
            jdbc.execute("ALTER TABLE security_audit_events ADD CONSTRAINT reject_status_audit CHECK (action <> 'CHANGE_STATUS' OR outcome <> 'SUCCESS')");
            assertThrows(RuntimeException.class,()->orders.updateOrderStatus(order.getOrderId(),OrderStatus.CONFIRMED));
            assertEquals(OrderStatus.PLACED,repository.findById(order.getOrderId()).orElseThrow().getStatus());
            assertEquals(2,audit.count());
        }
    }

    @Test
    void spoofedExpiredAndMalformedIdentitiesAreNeverVerified() throws Exception {
        var filter=new SecurityAuditRequestFilter(KEY);
        for(String token:List.of("not-a-jwt", token("POC-USER",Instant.now().minusSeconds(60)),
                Jwts.builder().claim("userId","POC-USER").signWith(Keys.hmacShaKeyFor(KEY.getBytes(StandardCharsets.UTF_8))).compact(),
                token("spoof\nnew-log-entry",Instant.now().plusSeconds(60)),
                Jwts.builder().claim("userId","SPOOFED").setExpiration(Date.from(Instant.now().plusSeconds(60)))
                        .signWith(Keys.hmacShaKeyFor("different-untrusted-signing-key-for-tests-2026".getBytes(StandardCharsets.UTF_8))).compact())) {
            var request=new MockHttpServletRequest(); request.addHeader("Authorization","Bearer "+token);
            request.addHeader("X-Auth-User-Id","ADMIN"); request.addHeader("X-Request-ID","spoofed-request-id");
            filter.doFilter(request,new MockHttpServletResponse(),new MockFilterChain());
            var context=(AuditContext)request.getAttribute(AuditContext.ATTRIBUTE);
            assertEquals("UNVERIFIED",context.actorId()); assertNotEquals("spoofed-request-id",context.requestId());
        }
        var request=new MockHttpServletRequest(); request.addHeader("Authorization","Bearer "+token(OWNER,Instant.now().plusSeconds(60)));
        new SecurityAuditRequestFilter("").doFilter(request,new MockHttpServletResponse(),new MockFilterChain());
        assertEquals("UNVERIFIED",((AuditContext)request.getAttribute(AuditContext.ATTRIBUTE)).actorId());
    }

    private static String token(String actor,Instant expiry) {
        return Jwts.builder().setSubject(actor).claim("userId",actor).setExpiration(Date.from(expiry))
                .signWith(Keys.hmacShaKeyFor(KEY.getBytes(StandardCharsets.UTF_8))).compact();
    }
    private HttpResponse<String> request(String label,String method,String path,String body,int status,String actor,boolean verified) throws Exception {
        var builder=HttpRequest.newBuilder(base.resolve(path)).timeout(Duration.ofSeconds(15))
                .header("X-Auth-User-Id",actor).header("X-Audit-Test-Step",label).header("X-Request-ID","client-value-must-be-replaced");
        if(verified) builder.header("Authorization","Bearer "+token(actor,Instant.now().plusSeconds(120)));
        if(body!=null)builder.header("Content-Type","application/json");
        var response=http.send(builder.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
        assertEquals(status,response.statusCode(),label+": "+response.body());
        String correlation=response.headers().firstValue("X-Request-ID").orElseThrow(); UUID.fromString(correlation);
        Files.writeString(evidence.resolve(label+"-response.http"),"HTTP "+response.statusCode()+"\n"+response.headers().map()+"\n\n"+response.body());
        Files.writeString(evidence.resolve(label+"-request.http"),method+" "+base.resolve(path)+"\nX-Auth-User-Id: "+actor
                +"\nAuthorization: "+(verified?"[synthetic test JWT redacted]":"[absent]")+"\n\n"+(body==null?"":body));
        observations.add(Map.of("step",label,"method",method,"url",base.resolve(path).toString(),"status",status,"requestId",correlation));
        return response;
    }
}

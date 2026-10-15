package dev.zofolio.contact;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import dev.zofolio.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContactApiIT {

	static final GenericContainer<?> mailpit = new GenericContainer<>("axllent/mailpit:v1.21")
			.withExposedPorts(1025, 8025).waitingFor(Wait.forHttp("/api/v1/info").forPort(8025));

	@DynamicPropertySource
	static void smtp(DynamicPropertyRegistry r) {
		mailpit.start();
		r.add("spring.mail.host", mailpit::getHost);
		r.add("spring.mail.port", () -> mailpit.getMappedPort(1025));
	}

	@LocalServerPort int port;
	@Autowired JdbcTemplate jdbc;
	final HttpClient http = HttpClient.newHttpClient();

	HttpResponse<String> post(String body, String ip) throws Exception {
		return http.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/contact"))
				.header("Content-Type", "application/json").header("X-Forwarded-For", ip)
				.POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
	}

	static String json(String name, String website) {
		return "{\"name\":\"" + name + "\",\"email\":\"ada@example.com\",\"company\":null,\"message\":\"Bonjour\",\"website\":\""
				+ website + "\"}";
	}

	long count() { return jdbc.queryForObject("select count(*) from contact_message", Long.class); }

	@Test
	void validMessageIsAcceptedStoredAndMailed() throws Exception {
		long before = count();
		assertThat(post(json("Ada", ""), "10.1.0.1").statusCode()).isEqualTo(202);
		assertThat(count()).isEqualTo(before + 1);
		assertThat(jdbc.queryForObject("select status from contact_message order by id desc limit 1", String.class))
				.isEqualTo("SENT");
		String inbox = http.send(HttpRequest.newBuilder(URI.create(
				"http://" + mailpit.getHost() + ":" + mailpit.getMappedPort(8025) + "/api/v1/messages")).build(),
				HttpResponse.BodyHandlers.ofString()).body();
		assertThat(inbox).contains("[Zofolio] Message de Ada");
	}

	@Test
	void invalidInputIsRejected() throws Exception {
		long before = count();
		HttpResponse<String> r = post(json("Ada\\r\\nBcc: x@y.z", ""), "10.1.0.2");
		assertThat(r.statusCode()).isEqualTo(400);
		assertThat(r.body()).contains("\"code\":\"VALIDATION_FAILED\"").contains("\"field\":\"name\"")
				.contains("\"code\":\"Pattern\"");
		assertThat(count()).isEqualTo(before);
	}

	@Test
	void honeypotIsAcceptedWithoutWrite() throws Exception {
		long before = count();
		assertThat(post(json("Bot", "http://spam"), "10.1.0.3").statusCode()).isEqualTo(202);
		assertThat(count()).isEqualTo(before);
	}

	@Test
	void sixthMessageFromSameIpIsRateLimited() throws Exception {
		for (int i = 0; i < 5; i++) assertThat(post(json("Ada", ""), "10.1.0.4").statusCode()).isEqualTo(202);
		HttpResponse<String> r = post(json("Ada", ""), "10.1.0.4");
		assertThat(r.statusCode()).isEqualTo(429);
		assertThat(r.headers().firstValue("Retry-After")).isPresent();
		assertThat(r.body()).contains("\"code\":\"RATE_LIMITED\"");
		assertThat(post(json("Ada", ""), "10.1.0.5").statusCode()).isEqualTo(202);
	}
}

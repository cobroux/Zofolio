package dev.zofolio.contact;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.time.Duration;

import dev.zofolio.TestcontainersConfiguration;

/** Config par défaut : le client direct (127.0.0.1) n'est pas un proxy de confiance, son XFF est ignoré. */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ForwardedForIT {
	@LocalServerPort int port;
	// pas de vrai SMTP : ce test ne porte que sur l'IP comptée
	@MockitoBean JavaMailSender mailSender;

	@Test
	void forgedXForwardedForDoesNotChangeCountedIp() throws Exception {
		HttpClient http = HttpClient.newHttpClient();
		int last = 0;
		for (int i = 0; i < 6; i++) {
			last = http.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/contact")).timeout(Duration.ofSeconds(10))
					.header("Content-Type", "application/json").header("X-Forwarded-For", "9.9.9." + i + ", 8.8.8." + i)
					.POST(HttpRequest.BodyPublishers.ofString(
							"{\"name\":\"Ada\",\"email\":\"ada@example.com\",\"company\":null,\"message\":\"Hi\",\"website\":\"\"}"))
					.build(), HttpResponse.BodyHandlers.ofString()).statusCode();
		}
		assertThat(last).isEqualTo(429);
	}
}

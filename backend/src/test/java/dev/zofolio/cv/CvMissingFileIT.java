package dev.zofolio.cv;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import dev.zofolio.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
		properties = "zofolio.cv.location=classpath:cv/absent.pdf")
class CvMissingFileIT {

	@LocalServerPort int port;

	@Test
	void missingFileIs404() throws Exception {
		HttpResponse<String> r = HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/fr/cv")).build(),
				HttpResponse.BodyHandlers.ofString());
		assertThat(r.statusCode()).isEqualTo(404);
		assertThat(r.body()).contains("\"code\":\"NOT_FOUND\"");
	}
}

package dev.zofolio.shared;

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
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiErrorIT {

	@LocalServerPort
	int port;

	@Test
	void unknownRouteIsProblemDetailWithCode() throws Exception {
		HttpResponse<String> r = HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/nope")).build(),
				HttpResponse.BodyHandlers.ofString());
		assertThat(r.statusCode()).isEqualTo(404);
		assertThat(r.headers().firstValue("Content-Type").orElse("")).contains("application/problem+json");
		assertThat(r.body()).contains("\"code\":\"NOT_FOUND\"").contains("\"detail\":\"Not found\"").contains("\"status\":404");
	}
}

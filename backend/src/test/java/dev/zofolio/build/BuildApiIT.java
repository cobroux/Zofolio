package dev.zofolio.build;

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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BuildApiIT {

	@LocalServerPort
	int port;

	@Test
	void withoutEnvironmentEverythingIsNull() throws Exception {
		var res = HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/build")).build(),
				HttpResponse.BodyHandlers.ofString());
		assertThat(res.statusCode()).isEqualTo(200);
		JsonNode body = JsonMapper.builder().build().readTree(res.body());
		assertThat(body.get("commit").isNull()).isTrue();
		assertThat(body.get("deployedAt").isNull()).isTrue();
		assertThat(body.get("ci").get("conclusion").isNull()).isTrue();
		assertThat(body.get("ci").get("url").isNull()).isTrue();
	}
}

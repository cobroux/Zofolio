package dev.zofolio.githubsync;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.junit.jupiter.api.extension.ExtendWith;

import com.sun.net.httpserver.HttpServer;

import dev.zofolio.TestcontainersConfiguration;

/** GitHub est remplacé par un HttpServer JDK local ; le token ci-dessous est factice. */
@ExtendWith(OutputCaptureExtension.class)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GithubSyncIT {

	static final String TOKEN = "fake-it-token-9876543210";
	static final AtomicInteger status = new AtomicInteger(200);
	static final HttpServer github = start();

	@Autowired
	GithubSyncService service;
	@Autowired
	GithubRepoRepository repos;
	@Autowired
	GithubContributionsRepository contributions;
	@LocalServerPort
	int port;

	static HttpServer start() {
		try {
			HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
			s.createContext("/graphql", ex -> {
				boolean authorized = ("Bearer " + TOKEN).equals(ex.getRequestHeaders().getFirst("Authorization"));
				byte[] body = authorized && status.get() == 200
						? new ClassPathResource("github/graphql-ok.json").getContentAsByteArray()
						: "{\"message\":\"denied\"}".getBytes(StandardCharsets.UTF_8);
				ex.getResponseHeaders().add("Content-Type", "application/json");
				ex.sendResponseHeaders(authorized ? status.get() : 401, body.length);
				ex.getResponseBody().write(body);
				ex.close();
			});
			s.start();
			return s;
		} catch (IOException e) {
			throw new IllegalStateException(e);
		}
	}

	@DynamicPropertySource
	static void props(DynamicPropertyRegistry r) {
		r.add("zofolio.github.url", () -> "http://127.0.0.1:" + github.getAddress().getPort() + "/graphql");
		r.add("zofolio.github.token", () -> TOKEN);
	}

	@AfterAll
	static void stop() {
		github.stop(0);
	}

	@BeforeEach
	void clean() {
		status.set(200);
		repos.deleteAll();
		contributions.deleteAll();
	}

	@Test
	void syncWritesCacheThenSurvivesAFailure(CapturedOutput out) throws Exception {
		service.sync();
		assertThat(repos.findAll()).extracting(r -> r.name).containsExactlyInAnyOrder("repo-a", "repo-b", "repo-vide");
		GithubRepo a = repos.findById("repo-a").orElseThrow();
		assertThat(a.commits).isEqualTo(10);
		assertThat(a.languages).containsEntry("Java", 500L);
		GithubContributions c = contributions.findById(GithubContributions.ID).orElseThrow();
		assertThat(c.total).isEqualTo(4);
		assertThat(c.counts).containsExactly(0, 3, 1);

		status.set(500);
		service.sync();

		assertThat(repos.count()).isEqualTo(3);
		assertThat(contributions.count()).isEqualTo(1);
		HttpResponse<String> r = HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/fr/projects/inconnu")).build(),
				HttpResponse.BodyHandlers.ofString());
		assertThat(r.statusCode()).isEqualTo(404);
		assertThat(r.body()).doesNotContain(TOKEN);
		assertThat(out.getAll()).doesNotContain(TOKEN).contains("HTTP 500");
	}
}

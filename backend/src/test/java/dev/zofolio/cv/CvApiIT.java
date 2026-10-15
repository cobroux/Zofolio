package dev.zofolio.cv;

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

import dev.zofolio.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CvApiIT {

	@LocalServerPort int port;
	@Autowired JdbcTemplate jdbc;

	HttpResponse<byte[]> get(String path) throws Exception {
		return HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).build(),
				HttpResponse.BodyHandlers.ofByteArray());
	}

	long count() { return jdbc.queryForObject("select count(*) from cv_download", Long.class); }

	@Test
	void servesPdfAndCountsDownload() throws Exception {
		long before = count();
		HttpResponse<byte[]> r = get("/api/en/cv");
		assertThat(r.statusCode()).isEqualTo(200);
		assertThat(r.headers().firstValue("Content-Type")).hasValue("application/pdf");
		assertThat(r.headers().firstValue("Content-Disposition").orElse(""))
				.contains("attachment").contains("Enzo-Leveque-CV-FR.pdf");
		assertThat(new String(r.body(), 0, 4)).isEqualTo("%PDF");
		assertThat(count()).isEqualTo(before + 1);
	}

	@Test
	void unknownLangIs404() throws Exception {
		assertThat(get("/api/de/cv").statusCode()).isEqualTo(404);
	}
}

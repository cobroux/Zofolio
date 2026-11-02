package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import dev.zofolio.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = AdminClient.PROXY_PROPS)
class CvAdminIT {

	@LocalServerPort int port;
	@Value("${MEDIA_DIR}") String mediaDir;

	HttpResponse<String> upload(AdminClient c, String lang, byte[] content) throws Exception {
		String b = "----zofolio" + System.nanoTime();
		byte[] head = ("--" + b + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"cv.pdf\"\r\nContent-Type: application/pdf\r\n\r\n").getBytes();
		byte[] tail = ("\r\n--" + b + "--\r\n").getBytes();
		return c.send("PUT", "/api/admin/cv/" + lang, HttpRequest.BodyPublishers.ofByteArray(Fixtures.concat(head, content, tail)),
				"multipart/form-data; boundary=" + b, true);
	}

	byte[] publicCv(String lang) throws Exception {
		return HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/" + lang + "/cv")).build(),
				HttpResponse.BodyHandlers.ofByteArray()).body();
	}

	@AfterEach
	void clean() throws Exception {
		for (String l : new String[] { "fr", "en" }) Files.deleteIfExists(Path.of(mediaDir, "cv", "cv-" + l + ".pdf"));
	}

	@Test
	void uploadNeedsASession() throws Exception {
		var c = new AdminClient(port, "10.0.4.1");
		c.get("/api/admin/session");
		assertThat(upload(c, "fr", "%PDF-1.7 x".getBytes()).statusCode()).isEqualTo(401);
	}

	@Test
	void uploadedPdfReplacesTheEmbeddedOne() throws Exception {
		var c = AdminClient.loggedIn(port);
		assertThat(c.get("/api/admin/cv").body()).contains("\"fr\":null");
		byte[] pdf = "%PDF-1.7 nouveau CV".getBytes();
		assertThat(upload(c, "fr", pdf).statusCode()).isEqualTo(204);
		assertThat(publicCv("fr")).isEqualTo(pdf);
		assertThat(publicCv("en")).isNotEqualTo(pdf);
		assertThat(c.get("/api/admin/cv").body()).doesNotContain("\"fr\":null").contains("\"en\":null");
	}

	@Test
	void nonPdfIsRejected() throws Exception {
		var c = AdminClient.loggedIn(port);
		var r = upload(c, "fr", "MZ executable".getBytes());
		assertThat(r.statusCode()).isEqualTo(400);
		assertThat(r.body()).contains("\"reason\":\"TYPE\"");
		assertThat(upload(c, "de", "%PDF-1.7".getBytes()).statusCode()).isEqualTo(404);
	}
}

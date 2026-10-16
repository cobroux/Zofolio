package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import dev.zofolio.TestcontainersConfiguration;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = { AdminClient.PROXY_PROPS,
		// Le refus de 6 Mo se produit avant la fin de la lecture : au-delà de 2 Mo non lus (défaut), Tomcat coupe la connexion et le client voit un échec d'envoi au lieu du 400.
		"server.tomcat.max-swallow-size=16MB" })
class MediaIT {

	@LocalServerPort int port;
	@Value("${MEDIA_DIR}") String mediaDir;
	final ObjectMapper json = new ObjectMapper();

	HttpResponse<String> upload(AdminClient c, String filename, byte[] content) throws Exception {
		String b = "----zofolio" + System.nanoTime();
		byte[] head = ("--" + b + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"" + filename
				+ "\"\r\nContent-Type: application/octet-stream\r\n\r\n").getBytes();
		byte[] tail = ("\r\n--" + b + "--\r\n").getBytes();
		return c.send("POST", "/api/admin/media", HttpRequest.BodyPublishers.ofByteArray(Fixtures.concat(head, content, tail)),
				"multipart/form-data; boundary=" + b, true);
	}

	void assertRejected(HttpResponse<String> r, String reason) {
		assertThat(r.statusCode()).isEqualTo(400);
		assertThat(r.body()).contains("\"code\":\"MEDIA_REJECTED\"", "\"reason\":\"" + reason + "\"");
	}

	@Test
	void uploadNeedsASession() throws Exception {
		var c = new AdminClient(port, "10.0.3.1");
		c.get("/api/admin/session");
		assertThat(upload(c, "a.png", Fixtures.image(5, 5, "png")).statusCode()).isEqualTo(401);
		assertThat(c.get("/api/admin/media").statusCode()).isEqualTo(401);
		assertThat(c.send("DELETE", "/api/admin/media/1", null).statusCode()).isEqualTo(401);
	}

	@Test
	void trappedJpegComesOutWithoutExifAndRotated() throws Exception {
		var c = AdminClient.loggedIn(port);
		var r = upload(c, "photo.jpg", Fixtures.jpegWithExif(Fixtures.image(100, 50, "jpg"), 6));

		assertThat(r.statusCode()).isEqualTo(201);
		JsonNode m = json.readTree(r.body());
		assertThat(m.get("width").asInt()).isEqualTo(50);
		assertThat(m.get("height").asInt()).isEqualTo(100);
		assertThat(m.get("url").asText()).matches("/uploads/[0-9a-f]{24}\\.jpg");
		byte[] stored = Files.readAllBytes(Path.of(mediaDir).resolve(m.get("url").asText().substring("/uploads/".length())));
		assertThat(Fixtures.contains(stored, "Exif")).isFalse();
		assertThat(Fixtures.contains(stored, "GPS-LAT")).isFalse();
		assertThat(m.get("usedBy")).isEmpty();
		// même contenu : 200 et la ligne existante
		var again = upload(c, "photo.jpg", Fixtures.jpegWithExif(Fixtures.image(100, 50, "jpg"), 6));
		assertThat(again.statusCode()).isEqualTo(200);
		assertThat(json.readTree(again.body()).get("id").asLong()).isEqualTo(m.get("id").asLong());
	}

	@Test
	void disguisedOversizedAndMetadataFilesAreRejected() throws Exception {
		var c = AdminClient.loggedIn(port);
		assertRejected(upload(c, "film.mp4", Fixtures.image(10, 10, "png")), "TYPE"); // PNG renommé .mp4
		assertRejected(upload(c, "photo.jpg", "MZ executable".getBytes()), "TYPE");
		assertRejected(upload(c, "notes.txt", "hello".getBytes()), "TYPE");
		assertRejected(upload(c, "large.png", Fixtures.image(5000, 1, "png")), "DIMENSIONS");
		assertRejected(upload(c, "huge.png", new byte[6 * 1024 * 1024]), "SIZE");
		assertRejected(upload(c, "big.mp4", Fixtures.mp4(null, 3 * 1024 * 1024)), "SIZE");
		assertRejected(upload(c, "phone.mp4", Fixtures.mp4(Fixtures.box("udta", Fixtures.box("©xyz", "+48.85+002.35/".getBytes())), 10)), "METADATA");
		assertRejected(upload(c, "phone2.mp4", Mp4CheckTest.resource("phone.mp4")), "METADATA");
		assertRejected(upload(c, "broken.png", java.util.Arrays.copyOf(Fixtures.image(50, 50, "png"), 40)), "DECODE");
	}

	@Test
	void encodeShOutputIsAcceptedUsedClipCannotBeDeletedAndUnusedCan() throws Exception {
		var c = AdminClient.loggedIn(port);
		var r = upload(c, "demo.mp4", Mp4CheckTest.resource("encode-sh.mp4"));
		assertThat(r.statusCode()).isEqualTo(201);
		JsonNode m = json.readTree(r.body());
		String url = m.get("url").asText();
		assertThat(m.get("kind").asText()).isEqualTo("VIDEO");

		// un projet ne peut référencer qu'un média existant
		String video = "\"tier\":\"SHORT\",\"video\":{\"name\":\"media-it\",\"mp4\":\"" + url + "\",\"width\":64,\"height\":64}";
		assertThat(c.send("POST", "/api/admin/projects", ProjectAdminIT.body("media-it", video.replace(url, "/uploads/ffffffffffffffffffffffff.mp4"))).body())
				.contains("\"field\":\"video.mp4\"");
		assertThat(c.send("POST", "/api/admin/projects", ProjectAdminIT.body("media-it", video)).statusCode()).isEqualTo(201);
		assertThat(c.get("/api/fr/projects/media-it").body()).contains("\"mp4\":\"" + url + "\"", "\"webm\":null");

		var del = c.send("DELETE", "/api/admin/media/" + m.get("id").asLong(), null);
		assertThat(del.statusCode()).isEqualTo(409);
		assertThat(del.body()).contains("\"code\":\"CONFLICT\"");
		assertThat(c.get("/api/admin/media").body()).contains("\"usedBy\":[\"media-it\"]");

		assertThat(c.send("DELETE", "/api/admin/projects/media-it", null).statusCode()).isEqualTo(204);
		Path file = Path.of(mediaDir).resolve(url.substring("/uploads/".length()));
		assertThat(Files.exists(file)).isTrue();
		assertThat(c.send("DELETE", "/api/admin/media/" + m.get("id").asLong(), null).statusCode()).isEqualTo(204);
		assertThat(Files.exists(file)).isFalse();
		assertThat(c.send("DELETE", "/api/admin/media/" + m.get("id").asLong(), null).statusCode()).isEqualTo(404);
	}

	@Test
	void traversalNamesCannotReachOutsideTheMediaDirectory() throws Exception {
		var c = AdminClient.loggedIn(port);
		assertThat(c.send("DELETE", "/api/admin/media/..%2F..%2Fetc", null).statusCode()).isGreaterThanOrEqualTo(400);
		assertThat(MediaService.FILE_NAME.matcher("../x.jpg").matches()).isFalse();
		assertThat(MediaService.FILE_NAME.matcher("0123456789abcdef01234567.jpg").matches()).isTrue();
		// une valeur de projet hors forme n'atteint jamais le disque
		assertThat(c.send("POST", "/api/admin/projects", ProjectAdminIT.body("trav-it",
				"\"video\":{\"name\":\"x\",\"width\":1,\"height\":1,\"poster\":\"/uploads/../../etc/passwd.jpg\"}")).statusCode()).isEqualTo(400);
	}
}

package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import dev.zofolio.TestcontainersConfiguration;

@ExtendWith(OutputCaptureExtension.class)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = AdminClient.PROXY_PROPS)
class AdminAuthIT {

	@LocalServerPort int port;
	@Autowired JdbcTemplate jdbc;

	@BeforeEach
	void clean() {
		jdbc.update("delete from admin_login_failure");
	}

	@Test
	void adminRoutesNeedASession() throws Exception {
		var c = new AdminClient(port, "10.0.0.1");
		for (String path : new String[] { "/api/admin/projects", "/api/admin/media", "/api/admin/anything", "/api/admin/preview/fr/project" }) {
			var r = c.get(path);
			assertThat(r.statusCode()).as(path).isEqualTo(401);
			assertThat(r.body()).contains("\"code\":\"UNAUTHENTICATED\"");
		}
		assertThat(c.send("POST", "/api/admin/logout", null).statusCode()).isEqualTo(401);
	}

	@Test
	void sessionRouteIsOpenAndSetsCsrfCookie() throws Exception {
		var c = new AdminClient(port, "10.0.0.1");
		var r = c.get("/api/admin/session");
		assertThat(r.statusCode()).isEqualTo(200);
		assertThat(r.body()).contains("\"authenticated\":false");
		assertThat(c.cookies).containsKey("XSRF-TOKEN");
		assertThat(r.headers().allValues("Set-Cookie").stream().filter(s -> s.startsWith("XSRF-TOKEN")).findFirst().orElse(""))
				.doesNotContain("HttpOnly");
	}

	@Test
	void loginWithoutCsrfHeaderIsForbidden() throws Exception {
		var c = new AdminClient(port, "10.0.0.1");
		var r = c.send("POST", "/api/admin/login", java.net.http.HttpRequest.BodyPublishers
				.ofString("{\"password\":\"" + AdminClient.PASSWORD + "\"}"), "application/json", false);
		assertThat(r.statusCode()).isEqualTo(403);
		assertThat(r.body()).contains("\"code\":\"FORBIDDEN\"");
	}

	@Test
	void goodPasswordGivesNewSessionIdWithHardenedCookieThenLogoutEndsIt(CapturedOutput out) throws Exception {
		var c = new AdminClient(port, "10.0.0.1");
		c.get("/api/admin/session");
		String before = c.cookies.get("__Host-zadmin");
		assertThat(before).isNotBlank();

		var r = c.send("POST", "/api/admin/login", "{\"password\":\"" + AdminClient.PASSWORD + "\"}");

		assertThat(r.statusCode()).isEqualTo(204);
		String cookie = r.headers().allValues("Set-Cookie").stream().filter(s -> s.startsWith("__Host-zadmin=")).findFirst().orElseThrow();
		assertThat(cookie).contains("HttpOnly", "Secure", "SameSite=Strict", "Path=/");
		assertThat(c.cookies.get("__Host-zadmin")).isNotEqualTo(before);
		assertThat(r.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
		assertThat(c.get("/api/admin/session").body()).contains("\"authenticated\":true");
		assertThat(c.get("/api/admin/projects").statusCode()).isNotEqualTo(401); // 404 tant que T13 n'est pas là

		assertThat(c.send("POST", "/api/admin/logout", null).statusCode()).isEqualTo(204);
		assertThat(c.get("/api/admin/projects").statusCode()).isEqualTo(401);
		assertThat(out.getAll()).doesNotContain(AdminClient.PASSWORD);
	}

	@Test
	void sixthAttemptIsLockedEvenWithRightPasswordAndOtherIpPasses() throws Exception {
		var c = new AdminClient(port, "10.0.0.2");
		for (int i = 0; i < 5; i++) {
			assertThat(c.login("mauvais-" + i).statusCode()).isEqualTo(401);
		}
		var locked = c.login(AdminClient.PASSWORD);
		assertThat(locked.statusCode()).isEqualTo(429);
		assertThat(locked.body()).contains("\"code\":\"LOGIN_LOCKED\"");
		assertThat(Long.parseLong(locked.headers().firstValue("Retry-After").orElseThrow())).isBetween(1L, 900L);

		assertThat(new AdminClient(port, "10.0.0.3").login(AdminClient.PASSWORD).statusCode()).isEqualTo(204);
	}

	@Test
	void successClearsTheIpFailures() throws Exception {
		var c = new AdminClient(port, "10.0.0.4");
		for (int i = 0; i < 4; i++) {
			c.login("mauvais");
		}
		assertThat(c.login(AdminClient.PASSWORD).statusCode()).isEqualTo(204);
		assertThat(jdbc.queryForObject("select count(*) from admin_login_failure", Long.class)).isZero();
	}

	@Test
	void twentyDistributedFailuresLockEveryone() throws Exception {
		for (int i = 0; i < 20; i++) {
			assertThat(new AdminClient(port, "10.1.0." + i).login("mauvais").statusCode()).isEqualTo(401);
		}
		var r = new AdminClient(port, "10.2.0.1").login(AdminClient.PASSWORD);
		assertThat(r.statusCode()).isEqualTo(429);
		assertThat(r.headers().firstValue("Retry-After")).isPresent();
	}

	@Test
	void oversizedOrBlankPasswordIsValidationFailed() throws Exception {
		var c = new AdminClient(port, "10.0.0.5");
		c.get("/api/admin/session");
		assertThat(c.send("POST", "/api/admin/login", "{\"password\":\"\"}").body()).contains("VALIDATION_FAILED");
		assertThat(c.send("POST", "/api/admin/login", "{\"password\":\"" + "x".repeat(201) + "\"}").statusCode()).isEqualTo(400);
	}

	@Test
	void publicApiKeepsNoSessionNoCookieAndNoSecurityHeaders() throws Exception {
		var r = new AdminClient(port, "10.0.0.6").get("/api/fr/races");
		assertThat(r.statusCode()).isEqualTo(200);
		assertThat(r.headers().map()).doesNotContainKey("set-cookie").doesNotContainKey("cache-control");
	}
}

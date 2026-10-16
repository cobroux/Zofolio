package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import dev.zofolio.TestcontainersConfiguration;

/** OWASP A01 : énumère tous les mappings /api/admin/** ; sans session, aucun ne répond autre chose que 401 (403 sans CSRF). */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = AdminClient.PROXY_PROPS)
class AdminRoutesIT {

	@LocalServerPort int port;
	@Autowired RequestMappingHandlerMapping mappings;

	@Test
	void everyAdminMappingRejectsAnonymousExceptSessionAndLogin() throws Exception {
		List<String> checked = new ArrayList<>();
		for (RequestMappingInfo info : mappings.getHandlerMethods().keySet()) {
			for (String pattern : info.getPathPatternsCondition().getPatternValues()) {
				if (!pattern.startsWith("/api/admin")) {
					continue;
				}
				for (var method : info.getMethodsCondition().getMethods()) {
					String path = pattern.replaceAll("\\{[^}]+}", "1");
					if (method.name().equals("GET") && path.equals("/api/admin/session")
							|| method.name().equals("POST") && path.equals("/api/admin/login")) {
						continue;
					}
					var c = new AdminClient(port, "10.7.0.1");
					c.get("/api/admin/session"); // pose le cookie CSRF, sans ouvrir de session
					assertThat(c.send(method.name(), path, "{}").statusCode()).as(method + " " + path).isEqualTo(401);
					if (!method.name().equals("GET")) {
						var noCsrf = new AdminClient(port, "10.7.0.2");
						assertThat(noCsrf.send(method.name(), path, null).statusCode()).as(method + " " + path + " sans CSRF").isEqualTo(403);
					}
					checked.add(method + " " + path);
				}
			}
		}
		assertThat(checked).as("mappings admin énumérés").hasSizeGreaterThan(15);
	}
}

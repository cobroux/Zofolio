package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import dev.zofolio.TestcontainersConfiguration;

@ExtendWith(OutputCaptureExtension.class)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = { "zofolio.admin.password-hash=" })
class AdminEmptyHashIT {

	@LocalServerPort int port;

	@Test
	void emptyHashRefusesEveryLoginAndWarns(CapturedOutput out) throws Exception {
		assertThat(new AdminClient(port, "10.0.0.1").login(AdminClient.PASSWORD).statusCode()).isEqualTo(401);
		assertThat(out.getAll()).contains("ADMIN_PASSWORD_HASH absent ou invalide");
	}
}

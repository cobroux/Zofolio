package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import dev.zofolio.admin.AdminDto.ProjectAdmin;
import dev.zofolio.content.ContentDto.Decision;
import dev.zofolio.content.ContentService;
import dev.zofolio.content.ProjectRepository;
import dev.zofolio.githubsync.GithubRepoRepository;
import dev.zofolio.shared.ApiException;

class ProjectAdminServiceTest {

	ProjectAdminService service = new ProjectAdminService(mock(ProjectRepository.class), mock(GithubRepoRepository.class),
			mock(ContentService.class));

	static ProjectAdmin project(List<String> stack, Map<String, List<Decision>> decisions, Integer sortOrder) {
		return new ProjectAdmin("ok", null, null, sortOrder, Map.of("fr", "T"), Map.of("fr", "P"), "AI", stack, null, null,
				null, null, null, null, null, null, decisions, null, null, null, null);
	}

	@Test
	void tooManyStackItemsDecisionsAndOutOfRangeOrderAreAllReported() {
		var d = new Decision("t", "c");
		var in = project(java.util.Collections.nCopies(13, "x"), Map.of("fr", List.of(d, d, d, d)), -1);

		assertThatThrownBy(() -> service.preview("fr", in)).isInstanceOf(ApiException.class);
	}

	@Test
	void blankValuesAreDroppedAndAValidProjectPasses() {
		var in = project(List.of("Java"), null, 5);
		assertThatThrownBy(() -> service.preview("fr", new ProjectAdmin("ok", null, null, 5, Map.of("fr", " "), Map.of("fr", "P"),
				"AI", List.of(), null, null, null, null, null, null, null, null, null, null, null, null, null)))
				.isInstanceOf(ApiException.class); // title.fr blanc = absent
		assertThat(in.stack()).containsExactly("Java");
	}
}

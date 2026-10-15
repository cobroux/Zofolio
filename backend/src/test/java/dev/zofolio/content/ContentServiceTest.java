package dev.zofolio.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import dev.zofolio.content.ContentDto.Home;

class ContentServiceTest {

	RaceRepository races = mock(RaceRepository.class);
	ProjectRepository projects = mock(ProjectRepository.class);
	ExperienceRepository experiences = mock(ExperienceRepository.class);
	ContentService service = new ContentService(races, projects, experiences);

	@Test
	void homeFallsBackToFrenchKeepsOrderAndFiltersStage() {
		Experience e = new Experience();
		e.stage = "P1";
		e.kind = Experience.Kind.AID;
		e.title = Map.of("fr", "Titre FR");
		e.body = Map.of("fr", "Corps", "en", "Body");
		Race a = race("A"), b = race("B");
		when(experiences.findAllByOrderBySortOrder()).thenReturn(List.of(e));
		when(races.findAllByOrderBySortOrder()).thenReturn(List.of(a, b));
		when(projects.findByTierNotOrderBySortOrder(Project.Tier.HIDDEN))
				.thenReturn(List.of(project("x", "P1"), project("y", null), project("z", "P3")));

		Home h = service.home("en");

		assertThat(h.experiences().get(0).title()).isEqualTo("Titre FR");
		assertThat(h.experiences().get(0).body()).isEqualTo("Body");
		assertThat(h.projects()).extracting("slug").containsExactly("x", "z");
		assertThat(h.races()).extracting("name").containsExactly("A", "B");
	}

	@Test
	void projectMissingIs404() {
		when(projects.findBySlugAndTierNot("nope", Project.Tier.HIDDEN)).thenReturn(Optional.empty());
		assertThatThrownBy(() -> service.project("nope", "fr")).isInstanceOf(ResponseStatusException.class);
	}

	@Test
	void projectFound() {
		when(projects.findBySlugAndTierNot("ok", Project.Tier.HIDDEN)).thenReturn(Optional.of(project("ok", "P1")));
		assertThat(service.project("ok", "fr").slug()).isEqualTo("ok");
	}

	private static Race race(String n) {
		Race r = new Race();
		r.kind = Race.Kind.RACE;
		r.name = Map.of("fr", n);
		return r;
	}

	private static Project project(String slug, String stage) {
		Project p = new Project();
		p.slug = slug;
		p.stage = stage;
		p.tier = Project.Tier.SHORT;
		p.aiTag = Project.AiTag.AI;
		p.title = Map.of("fr", slug);
		return p;
	}
}

package dev.zofolio.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import dev.zofolio.content.ContentDto.Home;
import dev.zofolio.content.ContentDto.ProjectSummary;
import dev.zofolio.githubsync.GithubContributions;
import dev.zofolio.githubsync.GithubContributionsRepository;
import dev.zofolio.githubsync.GithubRepo;
import dev.zofolio.githubsync.GithubRepoRepository;

class ContentServiceTest {

	RaceRepository races = mock(RaceRepository.class);
	ProjectRepository projects = mock(ProjectRepository.class);
	ExperienceRepository experiences = mock(ExperienceRepository.class);
	GithubRepoRepository githubRepos = mock(GithubRepoRepository.class);
	GithubContributionsRepository contributions = mock(GithubContributionsRepository.class);
	ContentService service = new ContentService(races, projects, experiences, githubRepos, contributions, "cobroux");

	@Test
	void homeFallsBackToFrenchKeepsOrderAndFiltersStage() {
		Experience e = new Experience();
		e.stage = "P1";
		e.kind = Experience.Kind.AID;
		e.title = Map.of("fr", "Titre FR");
		e.body = Map.of("fr", "Corps", "en", "Body");
		Race a = race("A"), b = race("B");
		when(experiences.findAllByOrderBySortOrder()).thenReturn(List.of(e));
		when(races.findAllOrdered()).thenReturn(List.of(a, b));
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

	@Test
	void aggregatesOnlyTheProjectsOwnCachedRepos() {
		Project p = project("agg", "P3");
		p.githubRepos = List.of("a", "b", "absent");
		when(projects.findBySlugAndTierNot("agg", Project.Tier.HIDDEN)).thenReturn(Optional.of(p));
		when(githubRepos.findAll()).thenReturn(List.of(
				cached("a", 10, "2026-01-01T00:00:00Z", Map.of("Java", 500L, "HTML", 50L, "CSS", 40L)),
				cached("b", 5, "2026-03-01T00:00:00Z", Map.of("TypeScript", 300L, "Java", 100L, "Shell", 1L)),
				cached("non-cure", 999, "2030-01-01T00:00:00Z", Map.of("Rust", 99999L))));

		ProjectSummary s = service.project("agg", "fr");

		assertThat(s.commits()).isEqualTo(15);
		assertThat(s.languages()).containsExactly("Java", "TypeScript", "HTML");
		assertThat(s.lastPushAt()).isEqualTo(Instant.parse("2026-03-01T00:00:00Z"));
		assertThat(s.repoUrl()).isEqualTo("https://github.com/cobroux/a");
	}

	@Test
	void emptyCacheOrNoRepoGivesNullEmptyNull() {
		Project p = project("vide", "P3");
		p.githubRepos = List.of("a");
		when(projects.findBySlugAndTierNot("vide", Project.Tier.HIDDEN)).thenReturn(Optional.of(p));

		ProjectSummary s = service.project("vide", "fr");

		assertThat(s.commits()).isNull();
		assertThat(s.languages()).isEmpty();
		assertThat(s.lastPushAt()).isNull();
		assertThat(service.home("fr").contributions()).isNull();
	}

	@Test
	void homeExposesCachedContributions() {
		GithubContributions c = new GithubContributions();
		c.startDate = LocalDate.parse("2026-10-11");
		c.counts = List.of(0, 3);
		c.total = 3;
		c.syncedAt = Instant.parse("2026-10-15T12:00:30Z");
		when(contributions.findById(GithubContributions.ID)).thenReturn(Optional.of(c));

		assertThat(service.home("fr").contributions().total()).isEqualTo(3);
		assertThat(service.home("fr").contributions().counts()).containsExactly(0, 3);
	}

	private static GithubRepo cached(String name, int commits, String pushedAt, Map<String, Long> languages) {
		GithubRepo r = new GithubRepo();
		r.name = name;
		r.commits = commits;
		r.pushedAt = Instant.parse(pushedAt);
		r.languages = languages;
		return r;
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

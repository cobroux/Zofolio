package dev.zofolio.content;

import static dev.zofolio.shared.I18n.pick;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import dev.zofolio.content.ContentDto.CaseStudy;
import dev.zofolio.content.ContentDto.Decision;
import dev.zofolio.content.ContentDto.Contributions;
import dev.zofolio.content.ContentDto.ExperienceDto;
import dev.zofolio.content.ContentDto.Home;
import dev.zofolio.content.ContentDto.ProjectSummary;
import dev.zofolio.content.ContentDto.RaceDto;
import dev.zofolio.content.ContentDto.RepoLink;
import dev.zofolio.content.ContentDto.Video;
import dev.zofolio.githubsync.GithubContributions;
import dev.zofolio.githubsync.GithubContributionsRepository;
import dev.zofolio.githubsync.GithubRepo;
import dev.zofolio.githubsync.GithubRepoRepository;

@Service
@Transactional(readOnly = true)
class ContentService {

	private final RaceRepository races;
	private final ProjectRepository projects;
	private final ExperienceRepository experiences;

	private final GithubRepoRepository githubRepos;
	private final GithubContributionsRepository githubContributions;
	private final String login;

	ContentService(RaceRepository races, ProjectRepository projects, ExperienceRepository experiences,
			GithubRepoRepository githubRepos, GithubContributionsRepository githubContributions,
			@Value("${zofolio.github.login:cobroux}") String login) {
		this.githubRepos = githubRepos;
		this.githubContributions = githubContributions;
		this.login = login;
		this.races = races;
		this.projects = projects;
		this.experiences = experiences;
	}

	List<RaceDto> races(String lang) {
		return races.findAllOrdered().stream().map(r -> new RaceDto(r.kind.name(), r.raceDate,
				pick(r.name, lang), r.distanceKm, r.elevationGainM, r.durationS, pick(r.note, lang),
				r.personalRecord)).toList();
	}

	List<ProjectSummary> projects(String lang) {
		Map<String, GithubRepo> cache = cache();
		return projects.findByTierNotOrderBySortOrder(Project.Tier.HIDDEN).stream()
				.map(p -> toDto(p, lang, false, cache)).toList();
	}

	ProjectSummary project(String slug, String lang) {
		return projects.findBySlugAndTierNot(slug, Project.Tier.HIDDEN).map(p -> toDto(p, lang, true, cache()))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

	Home home(String lang) {
		List<ExperienceDto> xp = experiences.findAllByOrderBySortOrder().stream()
				.map(e -> new ExperienceDto(e.stage, e.kind.name(), pick(e.title, lang), pick(e.body, lang),
						pick(e.period, lang), e.stack, pick(e.note, lang)))
				.toList();
		var contrib = githubContributions.findById(GithubContributions.ID)
				.map(c -> new Contributions(c.startDate, c.counts, c.total, c.syncedAt)).orElse(null);
		return new Home(xp, projects(lang).stream().filter(p -> p.stage() != null).toList(), races(lang), contrib);
	}

	private Map<String, GithubRepo> cache() {
		return githubRepos.findAll().stream().collect(Collectors.toMap(r -> r.name, Function.identity()));
	}

	/** D15-D16 : seuls les dépôts listés dans {@code github_repos} du projet comptent ; cache vide = null/[]/null. */
	private ProjectSummary toDto(Project p, String lang, boolean detail, Map<String, GithubRepo> cache) {
		List<GithubRepo> own = p.githubRepos.stream().map(cache::get).filter(Objects::nonNull).toList();
		Integer commits = own.stream().map(r -> r.commits).filter(Objects::nonNull).reduce(Integer::sum).orElse(null);
		Map<String, Long> bytes = new HashMap<>();
		own.forEach(r -> r.languages.forEach((l, n) -> bytes.merge(l, n, Long::sum)));
		List<String> languages = bytes.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
				.limit(3).map(Map.Entry::getKey).toList();
		Instant lastPush = own.stream().map(r -> r.pushedAt).filter(Objects::nonNull).max(Comparator.naturalOrder())
				.orElse(null);
		return new ProjectSummary(p.slug, p.tier.name(), p.stage, pick(p.title, lang), pick(p.pitch, lang),
				p.aiTag.name(), p.stack, pick(p.duration, lang), commits, pick(p.note, lang), repoUrl(p.githubRepos),
				p.demoUrl, languages, lastPush, video(p.video, lang), detail ? caseStudy(p, lang) : null);
	}

	private String repoUrl(List<String> repos) {
		return repos.isEmpty() ? null : repoLink(repos.get(0)).url();
	}

	private RepoLink repoLink(String name) {
		return new RepoLink(name, "https://github.com/" + login + "/" + name);
	}

	private static Video video(Project.VideoData v, String lang) {
		if (v == null) {
			return null;
		}
		String base = "media/" + v.name();
		return new Video(base + ".mp4", base + ".webm", base + ".webp", v.width(), v.height(), pick(v.caption(), lang));
	}

	/** Non nul ssi CASE_STUDY et {@code problem} renseigné (plan-v2 §4.2). */
	private CaseStudy caseStudy(Project p, String lang) {
		if (p.tier != Project.Tier.CASE_STUDY || p.problem == null) {
			return null;
		}
		List<Decision> decisions = pick(p.decisions, lang);
		return new CaseStudy(pick(p.role, lang), pick(p.problem, lang), decisions == null ? List.of() : decisions,
				pick(p.wall, lang), pick(p.takeaway, lang), pick(p.aiNote, lang),
				p.githubRepos.stream().map(this::repoLink).toList());
	}
}

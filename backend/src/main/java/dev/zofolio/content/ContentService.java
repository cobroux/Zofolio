package dev.zofolio.content;

import static dev.zofolio.shared.I18n.pick;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import dev.zofolio.content.ContentDto.ExperienceDto;
import dev.zofolio.content.ContentDto.Home;
import dev.zofolio.content.ContentDto.ProjectSummary;
import dev.zofolio.content.ContentDto.RaceDto;

@Service
@Transactional(readOnly = true)
class ContentService {

	private final RaceRepository races;
	private final ProjectRepository projects;
	private final ExperienceRepository experiences;

	ContentService(RaceRepository races, ProjectRepository projects, ExperienceRepository experiences) {
		this.races = races;
		this.projects = projects;
		this.experiences = experiences;
	}

	List<RaceDto> races(String lang) {
		return races.findAllByOrderBySortOrder().stream().map(r -> new RaceDto(r.kind.name(), r.raceDate,
				pick(r.name, lang), r.distanceKm, r.elevationGainM, r.durationS, pick(r.note, lang),
				r.personalRecord)).toList();
	}

	List<ProjectSummary> projects(String lang) {
		return projects.findByTierNotOrderBySortOrder(Project.Tier.HIDDEN).stream().map(p -> toDto(p, lang)).toList();
	}

	ProjectSummary project(String slug, String lang) {
		return projects.findBySlugAndTierNot(slug, Project.Tier.HIDDEN).map(p -> toDto(p, lang))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
	}

	Home home(String lang) {
		List<ExperienceDto> xp = experiences.findAllByOrderBySortOrder().stream()
				.map(e -> new ExperienceDto(e.stage, e.kind.name(), pick(e.title, lang), pick(e.body, lang),
						pick(e.period, lang), e.stack, pick(e.note, lang)))
				.toList();
		return new Home(xp, projects(lang).stream().filter(p -> p.stage() != null).toList(), races(lang));
	}

	private static ProjectSummary toDto(Project p, String lang) {
		return new ProjectSummary(p.slug, p.tier.name(), p.stage, pick(p.title, lang), pick(p.pitch, lang),
				p.aiTag.name(), p.stack, pick(p.duration, lang), p.commits, pick(p.note, lang), p.repoUrl, p.demoUrl);
	}
}

package dev.zofolio.content;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.zofolio.content.ContentDto.Home;
import dev.zofolio.content.ContentDto.ProjectSummary;
import dev.zofolio.content.ContentDto.RaceDto;

/** {lang:fr|en} : toute autre valeur ne correspond à aucune route, donc 404 NOT_FOUND (D5). */
@RestController
@RequestMapping("/api/{lang:fr|en}")
class ContentController {

	private final ContentService service;

	ContentController(ContentService service) {
		this.service = service;
	}

	@GetMapping("/home")
	Home home(@PathVariable String lang) {
		return service.home(lang);
	}

	@GetMapping("/races")
	List<RaceDto> races(@PathVariable String lang) {
		return service.races(lang);
	}

	@GetMapping("/projects")
	List<ProjectSummary> projects(@PathVariable String lang) {
		return service.projects(lang);
	}

	@GetMapping("/projects/{slug}")
	ProjectSummary project(@PathVariable String lang, @PathVariable String slug) {
		return service.project(slug, lang);
	}
}

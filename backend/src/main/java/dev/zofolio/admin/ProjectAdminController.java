package dev.zofolio.admin;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.zofolio.admin.AdminDto.GithubRepoAdmin;
import dev.zofolio.admin.AdminDto.ProjectAdmin;
import dev.zofolio.content.ContentDto.ProjectSummary;

/** Accès réservé par la chaîne de sécurité {@code /api/admin/**} (AdminSecurityConfig). */
@RestController
@RequestMapping("/api/admin")
class ProjectAdminController {

	private final ProjectAdminService service;

	ProjectAdminController(ProjectAdminService service) {
		this.service = service;
	}

	@GetMapping("/projects")
	List<ProjectAdmin> list() {
		return service.list();
	}

	@GetMapping("/projects/{slug}")
	ProjectAdmin get(@PathVariable String slug) {
		return service.get(slug);
	}

	@PostMapping("/projects")
	ResponseEntity<ProjectAdmin> create(@RequestBody ProjectAdmin body) {
		ProjectAdmin created = service.create(body);
		return ResponseEntity.created(URI.create("/api/admin/projects/" + created.slug())).body(created);
	}

	@PutMapping("/projects/{slug}")
	ProjectAdmin update(@PathVariable String slug, @RequestBody ProjectAdmin body) {
		return service.update(slug, body);
	}

	@DeleteMapping("/projects/{slug}")
	ResponseEntity<Void> delete(@PathVariable String slug) {
		service.delete(slug);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/preview/{lang:fr|en}/project")
	ProjectSummary preview(@PathVariable String lang, @RequestBody ProjectAdmin body) {
		return service.preview(lang, body);
	}

	@GetMapping("/github-repos")
	List<GithubRepoAdmin> githubRepos() {
		return service.githubRepos();
	}
}

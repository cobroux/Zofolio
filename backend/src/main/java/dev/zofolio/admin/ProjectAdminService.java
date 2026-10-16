package dev.zofolio.admin;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.zofolio.admin.AdminDto.GithubRepoAdmin;
import dev.zofolio.admin.AdminDto.ProjectAdmin;
import dev.zofolio.admin.AdminDto.VideoAdmin;
import dev.zofolio.content.ContentDto.Decision;
import dev.zofolio.content.ContentDto.ProjectSummary;
import dev.zofolio.content.ContentService;
import dev.zofolio.content.Project;
import dev.zofolio.content.ProjectRepository;
import dev.zofolio.githubsync.GithubRepo;
import dev.zofolio.githubsync.GithubRepoRepository;
import dev.zofolio.shared.ApiException;

@Service
class ProjectAdminService {

	private static final Logger log = LoggerFactory.getLogger(ProjectAdminService.class);
	static final Pattern SLUG = Pattern.compile("^[a-z0-9-]{1,64}$");
	private static final Pattern REPO = Pattern.compile("^[A-Za-z0-9._-]{1,100}$");
	private static final Pattern HTTPS = Pattern.compile("^https://\\S{1,247}$");
	private static final Pattern MP4 = Pattern.compile("^/uploads/[0-9a-f]{24}\\.mp4$");
	private static final Pattern POSTER = Pattern.compile("^/uploads/[0-9a-f]{24}\\.(jpg|png)$");

	private final ProjectRepository projects;
	private final GithubRepoRepository githubRepos;
	private final ContentService content;

	ProjectAdminService(ProjectRepository projects, GithubRepoRepository githubRepos, ContentService content) {
		this.projects = projects;
		this.githubRepos = githubRepos;
		this.content = content;
	}

	@Transactional(readOnly = true)
	List<ProjectAdmin> list() {
		return projects.findAll().stream().sorted(Comparator.comparingInt(p -> p.sortOrder)).map(ProjectAdminService::toAdmin).toList();
	}

	@Transactional(readOnly = true)
	ProjectAdmin get(String slug) {
		return toAdmin(projects.findBySlug(slug).orElseThrow(ApiException::notFound));
	}

	@Transactional
	ProjectAdmin create(ProjectAdmin in) {
		Check c = new Check();
		Project p = fill(new Project(), in, c, true);
		c.throwIfAny();
		if (projects.findBySlug(p.slug).isPresent()) {
			throw ApiException.conflict();
		}
		if (p.tier == null) {
			p.tier = Project.Tier.HIDDEN; // un nouveau projet n'est pas publié tant qu'on ne choisit pas un tier
		}
		if (in.sortOrder() == null) {
			p.sortOrder = projects.findAll().stream().mapToInt(x -> x.sortOrder).max().orElse(0) + 10;
		}
		try {
			p = projects.saveAndFlush(p);
		} catch (DataIntegrityViolationException e) {
			throw ApiException.conflict(); // course entre deux créations du même slug
		}
		log.info("admin : projet {} action=CREATE", p.slug);
		return toAdmin(p);
	}

	@Transactional
	ProjectAdmin update(String slug, ProjectAdmin in) {
		Project p = projects.findBySlug(slug).orElseThrow(ApiException::notFound);
		Project.Tier keep = p.tier;
		int keepOrder = p.sortOrder;
		Check c = new Check();
		fill(p, in, c, false);
		c.throwIfAny();
		p.slug = slug; // immuable (D47)
		if (p.tier == null) {
			p.tier = keep;
		}
		if (in.sortOrder() == null) {
			p.sortOrder = keepOrder;
		}
		p = projects.saveAndFlush(p);
		log.info("admin : projet {} action=UPDATE", slug);
		return toAdmin(p);
	}

	@Transactional
	void delete(String slug) {
		projects.delete(projects.findBySlug(slug).orElseThrow(ApiException::notFound));
		log.info("admin : projet {} action=DELETE", slug);
	}

	/** Aperçu (D41) : validé comme une écriture, converti par {@link ContentService}, jamais enregistré. */
	@Transactional(readOnly = true)
	ProjectSummary preview(String lang, ProjectAdmin in) {
		Check c = new Check();
		Project p = fill(new Project(), in, c, false);
		c.throwIfAny();
		p.tier = Project.Tier.CASE_STUDY;
		if (p.slug == null) {
			p.slug = "apercu";
		}
		return content.preview(p, lang);
	}

	@Transactional(readOnly = true)
	List<GithubRepoAdmin> githubRepos() {
		List<Project> all = projects.findAll();
		return githubRepos.findAll().stream().sorted(Comparator.comparing((GithubRepo r) -> r.name))
				.map(r -> new GithubRepoAdmin(r.name, r.pushedAt, r.commits,
						r.languages == null ? List.of() : r.languages.keySet().stream().toList(),
						all.stream().filter(p -> p.githubRepos.contains(r.name)).map(p -> p.slug).sorted().toList()))
				.toList();
	}

	/** Valide chaque champ et l'applique à {@code p} (les erreurs sont dans {@code c}). */
	private static Project fill(Project p, ProjectAdmin in, Check c, boolean requireSlug) {
		if (requireSlug) {
			c.matches("slug", in.slug(), SLUG);
			p.slug = in.slug();
		} else {
			p.slug = in.slug() != null && SLUG.matcher(in.slug()).matches() ? in.slug() : null;
		}
		p.tier = enumOf(c, "tier", Project.Tier.class, in.tier());
		p.aiTag = enumOf(c, "aiTag", Project.AiTag.class, in.aiTag());
		if (p.aiTag == null && in.aiTag() == null) {
			c.add("aiTag", "NotNull");
		}
		if (in.stage() != null && !in.stage().equals("P1") && !in.stage().equals("P3")) {
			c.add("stage", "Pattern");
		}
		p.stage = in.stage();
		p.sortOrder = in.sortOrder() == null ? 0 : in.sortOrder();
		if (in.sortOrder() != null) {
			c.range("sortOrder", in.sortOrder(), 0, 100000);
		}
		p.title = c.text("title", in.title(), 120, true);
		p.pitch = c.text("pitch", in.pitch(), 300, true);
		p.duration = c.text("duration", in.duration(), 120, false);
		p.note = c.text("note", in.note(), 300, false);
		p.metaTitle = c.text("metaTitle", in.metaTitle(), 70, false);
		p.metaDescription = c.text("metaDescription", in.metaDescription(), 160, false);
		p.role = c.text("role", in.role(), 200, false);
		p.problem = c.text("problem", in.problem(), 3000, false);
		p.wall = c.text("wall", in.wall(), 3000, false);
		p.takeaway = c.text("takeaway", in.takeaway(), 3000, false);
		p.aiNote = c.text("aiNote", in.aiNote(), 3000, false);
		p.stack = list(c, "stack", in.stack(), 12, null, 40);
		p.githubRepos = list(c, "githubRepos", in.githubRepos(), 5, REPO, 100);
		if (in.demoUrl() != null && !HTTPS.matcher(in.demoUrl()).matches()) {
			c.add("demoUrl", "Pattern"); // jamais javascript: ni http:
		}
		p.demoUrl = in.demoUrl();
		p.decisions = decisions(c, in.decisions());
		p.video = video(c, in.video());
		return p;
	}

	private static <E extends Enum<E>> E enumOf(Check c, String field, Class<E> type, String v) {
		if (v == null) {
			return null;
		}
		try {
			return Enum.valueOf(type, v);
		} catch (IllegalArgumentException e) {
			c.add(field, "Pattern");
			return null;
		}
	}

	private static List<String> list(Check c, String field, List<String> in, int maxItems, Pattern p, int maxLen) {
		if (in == null) {
			return List.of();
		}
		if (in.size() > maxItems) {
			c.add(field, "Size");
		}
		List<String> out = new ArrayList<>();
		for (int i = 0; i < in.size(); i++) {
			String s = in.get(i);
			if (s == null || s.isBlank() || s.length() > maxLen) {
				c.add(field + "[" + i + "]", "Size");
			} else if (p != null && !p.matcher(s).matches()) {
				c.add(field + "[" + i + "]", "Pattern");
			} else {
				out.add(s.strip());
			}
		}
		return out;
	}

	private static Map<String, List<Decision>> decisions(Check c, Map<String, List<Decision>> in) {
		if (in == null || in.isEmpty()) {
			return null;
		}
		Map<String, List<Decision>> out = new java.util.LinkedHashMap<>();
		in.forEach((lang, items) -> {
			if (!Check.LANGS.contains(lang)) {
				c.add("decisions." + lang, "InvalidKey");
				return;
			}
			if (items == null) {
				return;
			}
			if (items.size() > 3) {
				c.add("decisions." + lang, "Size");
			}
			for (int i = 0; i < items.size(); i++) {
				Decision d = items.get(i);
				String f = "decisions." + lang + "[" + i + "]";
				if (d == null || d.title() == null || d.title().isBlank() || d.title().length() > 120) {
					c.add(f + ".title", "Size");
				}
				if (d == null || d.tradeoff() == null || d.tradeoff().isBlank() || d.tradeoff().length() > 1000) {
					c.add(f + ".tradeoff", "Size");
				}
			}
			out.put(lang, items);
		});
		return out;
	}

	private static Project.VideoData video(Check c, VideoAdmin v) {
		if (v == null) {
			return null;
		}
		c.matches("video.name", v.name(), SLUG);
		c.range("video.width", v.width(), 1, 4096);
		c.range("video.height", v.height(), 1, 4096);
		if (v.mp4() != null) {
			c.matches("video.mp4", v.mp4(), MP4);
		}
		if (v.poster() != null) {
			c.matches("video.poster", v.poster(), POSTER);
		}
		Map<String, String> caption = c.text("video.caption", v.caption(), 200, false);
		return new Project.VideoData(v.name(), v.mp4(), v.poster(), v.width() == null ? 0 : v.width(),
				v.height() == null ? 0 : v.height(), caption);
	}

	static ProjectAdmin toAdmin(Project p) {
		VideoAdmin v = p.video == null ? null
				: new VideoAdmin(p.video.name(), p.video.mp4(), p.video.poster(), p.video.width(), p.video.height(),
						p.video.caption());
		return new ProjectAdmin(p.slug, p.tier.name(), p.stage, p.sortOrder, p.title, p.pitch, p.aiTag.name(), p.stack,
				p.duration, p.note, p.githubRepos, p.demoUrl, p.metaTitle, p.metaDescription, p.role, p.problem,
				p.decisions, p.wall, p.takeaway, p.aiNote, v);
	}
}

package dev.zofolio.admin;

import java.util.List;
import java.util.Map;

import dev.zofolio.content.ContentDto.Decision;

/** Formes de l'API admin (plan-v3 §3.3) : toutes langues brutes, jamais de repli. */
interface AdminDto {

	record VideoAdmin(String name, String mp4, String poster, Integer width, Integer height, Map<String, String> caption) {}

	record ProjectAdmin(String slug, String tier, String stage, Integer sortOrder, Map<String, String> title,
			Map<String, String> pitch, String aiTag, List<String> stack, Map<String, String> duration,
			Map<String, String> note, List<String> githubRepos, String demoUrl, Map<String, String> metaTitle,
			Map<String, String> metaDescription, Map<String, String> role, Map<String, String> problem,
			Map<String, List<Decision>> decisions, Map<String, String> wall, Map<String, String> takeaway,
			Map<String, String> aiNote, VideoAdmin video) {}

	record RaceAdmin(Long id, String kind, java.time.LocalDate date, Map<String, String> name, java.math.BigDecimal distanceKm,
			Integer elevationGainM, Integer durationS, Map<String, String> note, Boolean personalRecord, Integer sortOrder) {}

	record MediaAdmin(Long id, String url, String kind, String contentType, int bytes, Integer width, Integer height,
			java.time.Instant createdAt, List<String> usedBy) {}

	record GithubRepoAdmin(String name, java.time.Instant pushedAt, Integer commits, List<String> languages,
			List<String> projects) {}
}

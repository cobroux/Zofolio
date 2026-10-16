package dev.zofolio.content;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** DTO de l'API de contenu (plan §4.2) ; champs absents = {@code null}, jamais omis. */
public interface ContentDto {

	record RaceDto(String kind, LocalDate date, String name, BigDecimal distanceKm, Integer elevationGainM,
			Integer durationS, String note, boolean personalRecord) {}

	record ProjectSummary(String slug, String tier, String stage, String title, String pitch, String aiTag,
			List<String> stack, String duration, Integer commits, String note, String repoUrl, String demoUrl,
			List<String> languages, Instant lastPushAt, Video video, CaseStudy caseStudy) {}

	record Decision(String title, String tradeoff) {}

	record RepoLink(String name, String url) {}

	record Video(String mp4, String webm, String poster, int width, int height, String caption) {}

	record CaseStudy(String role, String problem, List<Decision> decisions, String wall, String takeaway,
			String aiNote, List<RepoLink> repos) {}

	record ExperienceDto(String stage, String kind, String title, String body, String period, List<String> stack,
			String note) {}

	record Contributions(LocalDate start, List<Integer> counts, int total, Instant syncedAt) {}

	record Home(List<ExperienceDto> experiences, List<ProjectSummary> projects, List<RaceDto> races,
			Contributions contributions) {}
}

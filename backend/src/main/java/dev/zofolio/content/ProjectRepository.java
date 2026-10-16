package dev.zofolio.content;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
	List<Project> findByTierNotOrderBySortOrder(Project.Tier tier);

	Optional<Project> findBySlug(String slug);

	/** Slugs dont le clip référence ce média (D44). */
	@org.springframework.data.jpa.repository.Query(nativeQuery = true,
			value = "select slug from project where video->>'mp4' = :url or video->>'poster' = :url order by slug")
	List<String> findSlugsUsingMedia(@org.springframework.data.repository.query.Param("url") String url);

	Optional<Project> findBySlugAndTierNot(String slug, Project.Tier tier);
}

package dev.zofolio.content;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface ProjectRepository extends JpaRepository<Project, Long> {
	List<Project> findByTierNotOrderBySortOrder(Project.Tier tier);

	Optional<Project> findBySlugAndTierNot(String slug, Project.Tier tier);
}

package dev.zofolio.content;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface ExperienceRepository extends JpaRepository<Experience, Long> {
	List<Experience> findAllByOrderBySortOrder();
}

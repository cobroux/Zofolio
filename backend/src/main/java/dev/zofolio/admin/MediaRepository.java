package dev.zofolio.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface MediaRepository extends JpaRepository<Media, Long> {
	Optional<Media> findByFileName(String fileName);

	boolean existsByFileName(String fileName);

	List<Media> findAllByOrderByCreatedAtDesc();
}

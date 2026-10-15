package dev.zofolio.content;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface RaceRepository extends JpaRepository<Race, Long> {
	List<Race> findAllByOrderBySortOrder();
}

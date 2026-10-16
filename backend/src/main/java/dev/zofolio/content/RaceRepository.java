package dev.zofolio.content;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface RaceRepository extends JpaRepository<Race, Long> {
	/** Plus récentes d'abord, courses sans date en dernier (puis ordre de saisie). */
	@Query("select r from Race r order by r.raceDate desc nulls last, r.sortOrder")
	List<Race> findAllOrdered();
}

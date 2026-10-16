package dev.zofolio.content;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SportYearRepository extends JpaRepository<SportYear, Short> {
	List<SportYear> findAllByOrderByYearDesc();
}

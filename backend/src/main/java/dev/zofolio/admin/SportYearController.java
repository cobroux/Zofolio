package dev.zofolio.admin;

import java.time.Year;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.zofolio.content.ContentDto.SportYearDto;
import dev.zofolio.content.SportYear;
import dev.zofolio.content.SportYearRepository;
import dev.zofolio.shared.ApiException;

/** Totaux annuels (D48) : upsert par année, l'année vient du chemin. */
@RestController
@RequestMapping("/api/admin/sport-years")
class SportYearController {

	private static final Logger log = LoggerFactory.getLogger(SportYearController.class);
	private static final double MAX = 10_000_000;

	private final SportYearRepository years;

	SportYearController(SportYearRepository years) {
		this.years = years;
	}

	@GetMapping
	List<SportYearDto> list() {
		return years.findAllByOrderByYearDesc().stream().map(SportYearController::toDto).toList();
	}

	@PutMapping("/{year}")
	@Transactional
	SportYearDto put(@PathVariable int year, @RequestBody SportYearDto in) {
		Check c = new Check();
		c.range("year", year, 2000, Year.now().getValue());
		c.optRange("distanceKm", in.distanceKm(), 0, MAX);
		c.optRange("elevationGainM", in.elevationGainM(), 0, MAX);
		c.optRange("hours", in.hours(), 0, MAX);
		c.optRange("activities", in.activities(), 0, MAX);
		c.throwIfAny();
		SportYear y = years.findById((short) year).orElseGet(SportYear::new);
		y.year = (short) year;
		y.distanceKm = in.distanceKm();
		y.elevationGainM = in.elevationGainM();
		y.hours = in.hours();
		y.activities = in.activities();
		y.updatedAt = java.time.Instant.now();
		log.info("admin : année sportive {} action=UPSERT", year);
		return toDto(years.saveAndFlush(y));
	}

	@DeleteMapping("/{year}")
	@Transactional
	ResponseEntity<Void> delete(@PathVariable short year) {
		years.delete(years.findById(year).orElseThrow(ApiException::notFound));
		log.info("admin : année sportive {} action=DELETE", year);
		return ResponseEntity.noContent().build();
	}

	private static SportYearDto toDto(SportYear y) {
		return new SportYearDto((int) y.year, y.distanceKm, y.elevationGainM, y.hours, y.activities);
	}
}

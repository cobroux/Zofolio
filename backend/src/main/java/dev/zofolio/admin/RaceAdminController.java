package dev.zofolio.admin;

import java.math.RoundingMode;
import java.net.URI;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.zofolio.admin.AdminDto.RaceAdmin;
import dev.zofolio.content.Race;
import dev.zofolio.content.RaceRepository;
import dev.zofolio.shared.ApiException;

/** Plan-v3 §3.4. Aucun champ de classement ni de tracé (SPEC §3). */
@RestController
@RequestMapping("/api/admin/races")
class RaceAdminController {

	private static final Logger log = LoggerFactory.getLogger(RaceAdminController.class);

	private final RaceRepository races;

	RaceAdminController(RaceRepository races) {
		this.races = races;
	}

	@GetMapping
	@Transactional(readOnly = true)
	List<RaceAdmin> list() {
		return races.findAll().stream().sorted(Comparator.comparingInt((Race r) -> r.sortOrder)).map(RaceAdminController::toAdmin).toList();
	}

	@PostMapping
	@Transactional
	ResponseEntity<RaceAdmin> create(@RequestBody RaceAdmin in) {
		Race r = fill(new Race(), in);
		if (in.sortOrder() == null) {
			r.sortOrder = races.findAll().stream().mapToInt(x -> x.sortOrder).max().orElse(0) + 10;
		}
		r = races.saveAndFlush(r);
		log.info("admin : course {} action=CREATE", r.id);
		return ResponseEntity.created(URI.create("/api/admin/races/" + r.id)).body(toAdmin(r));
	}

	@PutMapping("/{id}")
	@Transactional
	RaceAdmin update(@PathVariable long id, @RequestBody RaceAdmin in) {
		Race r = races.findById(id).orElseThrow(ApiException::notFound);
		int keep = r.sortOrder;
		fill(r, in);
		if (in.sortOrder() == null) {
			r.sortOrder = keep;
		}
		log.info("admin : course {} action=UPDATE", id);
		return toAdmin(races.saveAndFlush(r));
	}

	@DeleteMapping("/{id}")
	@Transactional
	ResponseEntity<Void> delete(@PathVariable long id) {
		races.delete(races.findById(id).orElseThrow(ApiException::notFound));
		log.info("admin : course {} action=DELETE", id);
		return ResponseEntity.noContent().build();
	}

	private static Race fill(Race r, RaceAdmin in) {
		Check c = new Check();
		try {
			r.kind = in.kind() == null ? null : Race.Kind.valueOf(in.kind());
		} catch (IllegalArgumentException e) {
			c.add("kind", "Pattern");
		}
		if (in.kind() == null) {
			c.add("kind", "NotNull");
		}
		r.name = c.text("name", in.name(), 120, true);
		r.note = c.text("note", in.note(), 300, false);
		c.optRange("distanceKm", in.distanceKm(), 0, 1000);
		c.optRange("elevationGainM", in.elevationGainM(), 0, 20000);
		c.optRange("durationS", in.durationS(), 0, 604800);
		c.optRange("sortOrder", in.sortOrder(), 0, 100000);
		if (in.date() != null && in.date().isAfter(LocalDate.now().plusYears(1))) {
			c.add("date", "Future");
		}
		c.throwIfAny();
		r.raceDate = in.date();
		r.distanceKm = in.distanceKm() == null ? null : in.distanceKm().setScale(1, RoundingMode.HALF_UP);
		r.elevationGainM = in.elevationGainM();
		r.durationS = in.durationS();
		r.personalRecord = Boolean.TRUE.equals(in.personalRecord());
		r.sortOrder = in.sortOrder() == null ? 0 : in.sortOrder();
		return r;
	}

	private static RaceAdmin toAdmin(Race r) {
		return new RaceAdmin(r.id, r.kind.name(), r.raceDate, r.name, r.distanceKm, r.elevationGainM, r.durationS, r.note,
				r.personalRecord, r.sortOrder);
	}
}

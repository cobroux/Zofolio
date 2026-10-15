package dev.zofolio.content;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
class Race {
	enum Kind { RACE, INDEX, CLUB }

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	@jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
	Kind kind;
	LocalDate raceDate;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> name;
	BigDecimal distanceKm;
	@Column(name = "elevation_gain_m")
	Integer elevationGainM;
	@Column(name = "duration_s")
	Integer durationS;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> note;
	boolean personalRecord;
	int sortOrder;
}

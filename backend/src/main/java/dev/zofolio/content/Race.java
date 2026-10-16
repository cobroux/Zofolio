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
public class Race {
	public enum Kind { RACE, INDEX, CLUB }

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	@jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
	public Kind kind;
	public LocalDate raceDate;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> name;
	public BigDecimal distanceKm;
	@Column(name = "elevation_gain_m")
	public Integer elevationGainM;
	@Column(name = "duration_s")
	public Integer durationS;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> note;
	public boolean personalRecord;
	public int sortOrder;
}

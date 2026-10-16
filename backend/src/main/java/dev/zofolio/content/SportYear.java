package dev.zofolio.content;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Totaux d'une année sportive (D48) : saisie manuelle, aucune donnée de santé ni tracé. */
@Entity
public class SportYear {
	@Id
	public short year;
	public Integer distanceKm;
	@Column(name = "elevation_gain_m")
	public Integer elevationGainM;
	public Integer hours;
	public Integer activities;
	public Instant updatedAt = Instant.now();
}

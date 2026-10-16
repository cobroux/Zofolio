package dev.zofolio.admin;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
class Media {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String fileName;
	String kind;
	String contentType;
	int bytes;
	Integer width;
	Integer height;
	Instant createdAt = Instant.now();
}

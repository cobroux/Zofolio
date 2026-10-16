package dev.zofolio.admin;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
class AdminLoginFailure {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String ipHash;
	Instant failedAt;

	AdminLoginFailure() {}

	AdminLoginFailure(String ipHash, Instant failedAt) {
		this.ipHash = ipHash;
		this.failedAt = failedAt;
	}
}

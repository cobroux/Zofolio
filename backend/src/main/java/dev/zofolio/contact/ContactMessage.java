package dev.zofolio.contact;

import java.time.Instant;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "contact_message")
class ContactMessage {

	enum Status { PENDING, SENT, FAILED }

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String name;
	String email;
	String company;
	String message;
	@JdbcTypeCode(SqlTypes.CHAR)
	@Column(name = "ip_hash", length = 64)
	String ipHash;
	@Enumerated(EnumType.STRING)
	Status status = Status.PENDING;
	@Column(name = "created_at")
	Instant createdAt = Instant.now();

	protected ContactMessage() {}

	ContactMessage(ContactRequest r, String ipHash) {
		this.name = r.name();
		this.email = r.email();
		this.company = r.company();
		this.message = r.message();
		this.ipHash = ipHash;
	}
}

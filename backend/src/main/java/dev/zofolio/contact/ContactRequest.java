package dev.zofolio.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

record ContactRequest(
		@NotBlank @Size(max = 100) @Pattern(regexp = "[^\\p{Cc}]*") String name,
		@NotBlank @Email @Size(max = 254) String email,
		@Size(max = 100) String company,
		@NotBlank @Size(max = 5000) String message,
		String website) {}

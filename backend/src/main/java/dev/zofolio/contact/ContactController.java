package dev.zofolio.contact;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
class ContactController {
	private final ContactService service;

	ContactController(ContactService service) { this.service = service; }

	@PostMapping
	ResponseEntity<Void> send(@Valid @RequestBody ContactRequest request, HttpServletRequest http) {
		service.send(request, http.getRemoteAddr());
		return ResponseEntity.accepted().build();
	}
}

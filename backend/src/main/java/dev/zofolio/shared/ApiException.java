package dev.zofolio.shared;

import org.springframework.http.HttpStatus;

/** Erreur métier avec {@code code} du contrat §4.1. */
public class ApiException extends RuntimeException {
	private final HttpStatus status;
	private final String code;
	private final Long retryAfterSeconds;

	private ApiException(HttpStatus status, String code, Long retryAfterSeconds) {
		super(code);
		this.status = status;
		this.code = code;
		this.retryAfterSeconds = retryAfterSeconds;
	}

	public static ApiException rateLimited(long retryAfterSeconds) {
		return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", retryAfterSeconds);
	}

	public static ApiException mailFailed() {
		return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "MAIL_DELIVERY_FAILED", null);
	}

	public static ApiException notFound() {
		return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", null);
	}

	HttpStatus status() { return status; }
	String code() { return code; }
	Long retryAfterSeconds() { return retryAfterSeconds; }
}

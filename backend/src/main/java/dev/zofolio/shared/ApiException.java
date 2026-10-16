package dev.zofolio.shared;

import java.util.List;

import org.springframework.http.HttpStatus;

/** Erreur métier avec {@code code} du contrat §4.1. */
public class ApiException extends RuntimeException {
	private final HttpStatus status;
	private final String code;
	private final Long retryAfterSeconds;
	private final List<ApiExceptionHandler.FieldError> errors;

	private ApiException(HttpStatus status, String code, Long retryAfterSeconds,
			List<ApiExceptionHandler.FieldError> errors) {
		super(code);
		this.status = status;
		this.code = code;
		this.retryAfterSeconds = retryAfterSeconds;
		this.errors = errors;
	}

	public static ApiException rateLimited(long retryAfterSeconds) {
		return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", retryAfterSeconds, null);
	}

	public static ApiException mailFailed() {
		return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "MAIL_DELIVERY_FAILED", null, null);
	}

	public static ApiException notFound() {
		return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", null, null);
	}

	public static ApiException unauthenticated() {
		return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", null, null);
	}

	public static ApiException forbidden() {
		return new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", null, null);
	}

	public static ApiException loginLocked(long retryAfterSeconds) {
		return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "LOGIN_LOCKED", retryAfterSeconds, null);
	}

	public static ApiException conflict() {
		return new ApiException(HttpStatus.CONFLICT, "CONFLICT", null, null);
	}

	public static ApiException validation(List<ApiExceptionHandler.FieldError> errors) {
		return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", null, errors);
	}

	HttpStatus status() { return status; }
	String code() { return code; }
	Long retryAfterSeconds() { return retryAfterSeconds; }
	List<ApiExceptionHandler.FieldError> errors() { return errors; }
}

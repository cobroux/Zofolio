package dev.zofolio.admin;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.zofolio.shared.ApiException;
import dev.zofolio.shared.IpHash;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Session admin (plan-v3 §3.2). Un seul utilisateur : le mot de passe est comparé au hash bcrypt de l'environnement. */
@RestController
@RequestMapping("/api/admin")
class AdminAuthController {

	private static final Logger log = LoggerFactory.getLogger(AdminAuthController.class);
	private static final int MIN_BCRYPT_COST = 12;

	record LoginRequest(@NotBlank @Size(max = 200) String password) {}

	private final LoginThrottle throttle;
	private final BCryptPasswordEncoder encoder;
	private final String hash;
	private final String salt;
	private final HttpSessionSecurityContextRepository contexts = new HttpSessionSecurityContextRepository();

	AdminAuthController(LoginThrottle throttle, BCryptPasswordEncoder encoder,
			@Value("${zofolio.admin.password-hash:}") String hash, @Value("${IP_HASH_SALT:}") String salt) {
		this.throttle = throttle;
		this.encoder = encoder;
		this.salt = salt;
		this.hash = usable(hash) ? hash : "";
		if (this.hash.isEmpty()) {
			log.warn("admin : ADMIN_PASSWORD_HASH absent ou invalide (bcrypt coût >= {} requis), connexion toujours refusée",
					MIN_BCRYPT_COST);
		}
	}

	private static boolean usable(String h) {
		return h.matches("\\$2[aby]\\$\\d{2}\\$.{53}") && Integer.parseInt(h.substring(4, 6)) >= MIN_BCRYPT_COST;
	}

	@GetMapping("/session")
	Map<String, Boolean> session(HttpServletRequest request, CsrfToken csrf) {
		csrf.getToken(); // force l'écriture du cookie XSRF-TOKEN
		request.getSession(true); // ligne de base : login change ensuite l'identifiant (anti-fixation)
		var auth = SecurityContextHolder.getContext().getAuthentication();
		return Map.of("authenticated", auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken));
	}

	@PostMapping("/login")
	ResponseEntity<Void> login(@Valid @RequestBody LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
		String ipHash = IpHash.of(salt, request.getRemoteAddr());
		var locked = throttle.lockedFor(ipHash);
		// bcrypt toujours calculé (même bloqué) : temps de réponse constant
		boolean ok = matches(body.password());
		if (locked.isPresent()) {
			log.info("admin-login : bloqué ip={}", ipHash.substring(0, 12));
			throw ApiException.loginLocked(locked.getAsLong());
		}
		if (!ok) {
			throttle.recordFailure(ipHash);
			log.info("admin-login : échec ip={}", ipHash.substring(0, 12));
			throw ApiException.unauthenticated();
		}
		throttle.clear(ipHash);
		request.getSession(true);
		request.changeSessionId();
		SecurityContext ctx = SecurityContextHolder.createEmptyContext();
		ctx.setAuthentication(UsernamePasswordAuthenticationToken.authenticated("admin", null,
				List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
		SecurityContextHolder.setContext(ctx);
		contexts.saveContext(ctx, request, response);
		log.info("admin-login : succès ip={}", ipHash.substring(0, 12));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/logout")
	ResponseEntity<Void> logout(HttpServletRequest request) {
		HttpSession s = request.getSession(false);
		if (s != null) {
			s.invalidate();
		}
		SecurityContextHolder.clearContext();
		String expired = "__Host-zadmin=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Strict";
		return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, expired).build();
	}

	private boolean matches(String password) {
		if (hash.isEmpty()) {
			return false;
		}
		try {
			return encoder.matches(password, hash);
		} catch (IllegalArgumentException e) { // mot de passe > 72 octets
			return false;
		}
	}
}

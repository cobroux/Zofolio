package dev.zofolio.admin;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.HandlerExceptionResolver;

import dev.zofolio.shared.ApiException;

/** D35 : deux chaînes. L'admin exige la session et le CSRF ; le reste du site reste ouvert, sans session ni en-tête ajouté. */
@Configuration
@EnableWebSecurity
class AdminSecurityConfig {

	@Bean
	@Order(1)
	SecurityFilterChain adminChain(HttpSecurity http, @Qualifier("handlerExceptionResolver") HandlerExceptionResolver errors)
			throws Exception {
		http.securityMatcher("/api/admin/**")
				.authorizeHttpRequests(a -> a.requestMatchers(HttpMethod.GET, "/api/admin/session").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()
						.anyRequest().hasRole("ADMIN"))
				.csrf(c -> c.spa())
				// les erreurs de filtre passent par ApiExceptionHandler : même ProblemDetail + code que le reste de l'API
				.exceptionHandling(e -> e
						.authenticationEntryPoint((req, res, ex) -> errors.resolveException(req, res, null, ApiException.unauthenticated()))
						.accessDeniedHandler((req, res, ex) -> errors.resolveException(req, res, null, ApiException.forbidden())))
				.formLogin(AbstractHttpConfigurer::disable).httpBasic(AbstractHttpConfigurer::disable)
				.logout(AbstractHttpConfigurer::disable).requestCache(c -> c.disable());
		return http.build();
	}

	@Bean
	@Order(2)
	SecurityFilterChain publicChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(a -> a.anyRequest().permitAll()).csrf(AbstractHttpConfigurer::disable)
				.headers(AbstractHttpConfigurer::disable).requestCache(c -> c.disable())
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.logout(AbstractHttpConfigurer::disable).anonymous(Customizer.withDefaults());
		return http.build();
	}

	/** Aucun utilisateur : évite le mot de passe généré que Spring Boot écrirait sinon dans les logs. */
	@Bean
	UserDetailsService noUsers() {
		return username -> {
			throw new UsernameNotFoundException("aucun utilisateur");
		};
	}

	@Bean
	BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}

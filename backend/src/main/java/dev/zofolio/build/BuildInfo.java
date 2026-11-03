package dev.zofolio.build;

import dev.zofolio.githubsync.CiStatus;

/** Dos du dossard : une donnée absente vaut {@code null}, jamais une valeur inventée. */
public record BuildInfo(String commit, String deployedAt, CiStatus ci) {

	static BuildInfo of(String sha, String deployedAt, CiStatus ci) {
		String s = sha == null ? "" : sha.strip();
		String d = deployedAt == null ? "" : deployedAt.strip();
		return new BuildInfo(s.isEmpty() ? null : s.substring(0, Math.min(7, s.length())), d.isEmpty() ? null : d,
				ci == null ? new CiStatus(null, null) : ci);
	}
}

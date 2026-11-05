package dev.zofolio.githubsync;

/** Dernière exécution terminée du workflow CI sur main ; {@code conclusion} vaut success, failure ou null. */
public record CiStatus(String conclusion, String url) {}

/** Encadré Décision (spec §6, P2). Une rubrique vide n'est pas rendue. */
export interface Decision {
  problem: string;
  options: string[];
  choice: string;
  result: string;
}

/** Alertes en temps réel chez Worldline : texte tiré uniquement du CV (ligne « Alertes en temps réel »). */
export const WORLDLINE_ALERTS: Decision = {
  problem: $localize`:@@decision.alerts.problem:Propager les changements de configuration des alertes sans redémarrer le service`,
  options: ['ActiveMQ', 'Kafka', 'RabbitMQ'],
  choice: $localize`:@@decision.alerts.choice:ActiveMQ / JMS, après une étude comparative`,
  result: $localize`:@@decision.alerts.result:Module producer/consumer testé en JUnit, changements propagés en temps réel`,
};

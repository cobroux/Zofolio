/** Encadré Décision (spec §6, P2). Une rubrique vide n'est pas rendue. */
export interface Decision {
  problem: string;
  options: string[];
  choice: string;
  result: string;
}

/** Passerelle TOM, move2cloud : source = rapport d'alternance M1 (choix argumenté de RabbitMQ face à ActiveMQ ; non déployé, donc aucun résultat en production). */
export const WORLDLINE_GATEWAY: Decision = {
  problem: $localize`:@@decision.gateway.problem:Faire passer l'envoi des ordres de la passerelle TOM d'une base MySQL à une file de messages (move2cloud)`,
  options: ['ActiveMQ', 'RabbitMQ'],
  choice: $localize`:@@decision.gateway.choice:RabbitMQ, pour l'accusé de réception des ordres, la tenue sur de gros volumes et le clustering`,
  result: $localize`:@@decision.gateway.result:Producer/consumer Java testé en JUnit, ordre routé jusqu'au marché de test`,
};

// Données 100 % factices pour le clip Oltre. Node 18+, sans dépendance.
// Usage : node oltre-seed.mjs <fichier-de-sortie-auth.json>   (API : OLTRE_API, défaut http://localhost:8090)
import { writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const API = process.env.OLTRE_API ?? 'http://localhost:8090';
const password = randomBytes(12).toString('hex'); // jamais affiché
const iso = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const day = (offset) => iso(new Date(today.getTime() + offset * 864e5));
const monday = new Date(today.getTime() - ((today.getDay() + 6) % 7) * 864e5);
const wk = (i) => iso(new Date(monday.getTime() + i * 864e5));

let token = '';
async function call(method, path, body) {
  const r = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

const auth = await call('POST', '/auth/register', { username: 'Démo', email: 'demo@example.com', password, age: 30, birthDate: '1995-06-15' });
token = auth.token;

const expenses = [
  ['Loyer', 720, 'Monthly', -85], ['Électricité', 64.5, 'Monthly', -80], ['Internet', 29.99, 'Monthly', -78],
  ['Abonnement mobile', 12.99, 'Monthly', -75], ['Salle de sport', 34, 'Monthly', -70], ['Streaming vidéo', 13.49, 'Monthly', -66],
  ['Assurance habitation', 18.2, 'Monthly', -60], ['Courses alimentaires', 85, 'Monthly', -58], ['Transports en commun', 49, 'Monthly', -50],
  ['Abonnement musique', 10.99, 'Monthly', -45], ['Assurance vélo', 96, 'Yearly', -40], ['Cloud photos', 2.99, 'Monthly', -38],
  ['Boulangerie', 4.2, 'Daily', -30], ['Café du matin', 1.6, 'Daily', -20], ['Abonnement presse', 9.9, 'Monthly', -33],
  ['Mutuelle', 38.5, 'Monthly', -28], ['Dons associatifs', 15, 'Monthly', -25], ['Jardinage', 22, 'Monthly', -22],
  ['Livres', 17.5, 'Monthly', -15], ['Cinéma', 11, 'Monthly', -9],
];
for (const [expensesName, amount, recType, off] of expenses) {
  await call('POST', '/api/expenses/save', { expensesName, amount, recType, startDate: day(off), endDate: null });
}

const tasks = [
  ['Préparer la réunion de lundi', 'TRAVAIL', 'HIGH', 'PENDING', 0], ['Réserver le train du week-end', 'PERSO', 'MEDIUM', 'PENDING', 1],
  ['Faire les courses', 'PERSO', 'MEDIUM', 'PENDING', 2], ['Rendre les livres à la médiathèque', 'PERSO', 'LOW', 'DONE', -1],
  ['Sortie vélo de 40 km', 'SPORT', 'MEDIUM', 'PENDING', 3], ['Relire le compte rendu', 'TRAVAIL', 'LOW', 'DONE', -2],
  ['Appeler le plombier', 'AUTRE', 'HIGH', 'PENDING', 1],
];
for (const [tasksName, tasksType, tasksPriority, tasksStatus, off] of tasks) {
  await call('POST', '/api/tasks/save', { tasksName, tasksType, tasksPriority, tasksStatus, tasksDate: day(off) });
}

const meals = [
  [0, 'PETIT_DEJ', 'Porridge aux fruits rouges', 380, 12, 58, 9, 300], [0, 'DEJEUNER', 'Salade de lentilles et feta', 520, 24, 52, 22, 350],
  [0, 'COLLATION', 'Yaourt grec et noix', 210, 14, 12, 12, 180], [0, 'DINER', 'Pâtes aux légumes grillés', 640, 21, 92, 18, 400],
  [1, 'PETIT_DEJ', 'Tartines et œuf', 350, 15, 38, 14, 220], [1, 'DEJEUNER', 'Bol de riz, saumon et edamame', 610, 36, 66, 20, 420],
  [1, 'DINER', 'Soupe de légumes et pain complet', 430, 14, 70, 9, 450],
];
for (const [i, mealType, mealName, calories, proteinG, carbsG, fatG, quantityG] of meals) {
  await call('POST', '/api/meals/save', { mealName, mealDescript: '', mealType, mealDate: wk(i), calories, proteinG, carbsG, fatG, quantityG, offBarcode: null });
}

const appts = [
  [0, '09:00', '10:00', 'Point d’équipe', 'TRAVAIL', 'Bureau'], [1, '12:30', '13:30', 'Déjeuner avec Léa', 'PERSO', 'Centre-ville'],
  [2, '18:00', '19:00', 'Cours de natation', 'SPORT', 'Piscine municipale'], [3, '10:30', '11:15', 'Contrôle dentaire', 'MEDICAL', 'Cabinet'],
  [4, '14:00', '15:30', 'Atelier poterie', 'AUTRE', 'Atelier des Arts'],
];
for (const [i, apptTime, apptEndTime, title, apptType, location] of appts) {
  await call('POST', '/api/appointments/save', { title, description: '', location, apptDate: wk(i), apptTime, apptEndTime, apptType, source: 'MANUAL' });
}

writeFileSync(process.argv[2], JSON.stringify(auth));
console.log(`seed ok : ${expenses.length} dépenses, ${tasks.length} tâches, ${meals.length} repas, ${appts.length} rendez-vous`);

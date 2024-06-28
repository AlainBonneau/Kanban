import { sequelize } from "./src/models/index.js";
import { app } from "./app.js";

// Problème 1 : il faut lancer le SERVEUR manuellement pour pouvoir lancer les tests
// ✅ Solution 1 : faire en sorte que les tests démarre un serveur de test sur le port 5357

// Problème 2 : nos tests communiquent avec notre BDD de développement (okanban)
// ✅ Solution 2 : on va créer une BDD dédiée de test (okanbantest) que l'on videra entre chaque test

// Note : les variables d'enironnement pour l'environnement de tests ont été chargé préalablement via le fichier test.config.js

let server;

export const mochaHooks = {
  
  // Fonction qui se lance avant l'ensemble des tests
  async beforeAll() {
    // On créer les tables dans la BDD de test
    await sequelize.sync();

    // Lance un server de test
    server = await app.listen(process.env.PORT);
  },

  // Fonction qui se lance après l'ensemble des tests
  async afterAll() {
    // On ferme le serveur de test
    await server.close();

    // On supprime toutes les tables de la BDD
    await sequelize.drop({ cascade: true, force: true });

    // On ferme le tunnel de connexion vers notre BDD Postgres
    await sequelize.close();
  },

  // Fonction qui se lance entre chaque test
  async beforeEach() {
    // On vide les tables (supprimer les enregistrement tout en gardant la structure de ces tables)
    await sequelize.truncate({ cascade: true, force: true });
  }
};

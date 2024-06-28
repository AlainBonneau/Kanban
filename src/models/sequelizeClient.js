import "dotenv/config"; // require("dotenv/config");

import { Sequelize } from "sequelize"; // const { Sequelize } = require('sequelize');

// Notre client Sequelize
export const sequelize = new Sequelize(process.env.PG_URL, { // pour importer, on fera `import { sequelize } from "..."`
  define: {
    createdAt: "created_at", // rename pour TOUS les modèles (DRY !)
    updatedAt: "updated_at"
  },
  logging: false
}); 

// Tester : TOP-LEVEL AWAIT autorisé en ESM !
// Pas besoin necessairement d'être dans une fonction 'async'
// Toutefois, si le code EST dans une fonction, il devra être async.
await sequelize.authenticate();

// Exporter le client
// module.exports = sequelize; ==> plus besoin !


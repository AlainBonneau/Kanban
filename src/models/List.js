import { Model, DataTypes } from "sequelize";
import { sequelize } from "./sequelizeClient.js";

export class List extends Model {}

List.init({
  // On se rappelle : pas besoin de mettre l'ID, le created_at, le updated_at => c'est géré par Sequelize

  title: {
    type: DataTypes.STRING, // VARCHAR(255)
    allowNull: false // NOT NULL
  },

  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  sequelize, // instance de connexion
  tableName: "list"
});

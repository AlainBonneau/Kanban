import { Model, DataTypes } from "sequelize";
import { sequelize } from "./sequelizeClient.js";

export class Card extends Model {}

Card.init({
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },

  color: {
    type: DataTypes.STRING(7),  // Hexadecimal code #FF00FF
    allowNull: false,
    defaultValue: "#FFFFFF" // Blanc
  }
}, {
  sequelize,
  tableName: "card"
});

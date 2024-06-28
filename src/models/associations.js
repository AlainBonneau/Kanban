// Importer nos modèles
import { Card } from "./Card.js";
import { List } from "./List.js";
import { Tag } from "./Tag.js";
import { sequelize } from "./sequelizeClient.js";


// List <--> Card (One-to-Many)
List.hasMany(Card, {
  as: "cards", // Alias, permet de faire les 'include' sans avoir à importer le deuxième modèle. // On choisi la valeur pour cet alias, mais en pratique, répondre à la questio: "quand je requête un liste, je veux pouvoir récupérer ses..."
  foreignKey: {
    name: "list_id",
    allowNull: false,
  },
  onDelete: "CASCADE"
});
Card.belongsTo(List, {
  as: "list", // Quand je requête une carte, je veux pouvoir récupérer... sa liste
  foreignKey: "list_id" // obligatoire, sinon il créé un champ 'listId' dont on ne veut pas
});

// Card <--> Tag (Many-to-Many)
Card.belongsToMany(Tag, {
  as: "tags",
  through: "card_has_tag",
  foreignKey: "card_id"
});

Tag.belongsToMany(Card, {
  as: "cards",
  through: "card_has_tag",
  foreignKey: "tag_id"
});


// Exporter nos modèles
export { Card, List, Tag, sequelize };

import { Card, List, Tag } from "../src/models/index.js";
import { sequelize } from "../src/models/sequelize-client.js";

seedDatabase();


async function seedDatabase() {
  console.log("🔄 Okanban seeding started...");

  // Create Tags
  const urgentTag = await Tag.create({ name: 'Urgent',       color: '#FF00FF' });
  const lateTag   = await Tag.create({ name: 'En retard',    color: '#000000' });
  const ecoTag    = await Tag.create({ name: 'Eco-friendly', color: '#00FF00' });

  // Create List and Cards (in one batch !)
  await List.bulkCreate([
    { title: 'Liste des courses', position: 1, cards: [
      { content: 'Chartreuse', position: 3 },
      { content: 'Concombre',  position: 2, color: '#00FF00' },
      { content: 'Savon', position: 1, color: '#FF00FF' },
    ] },

    { title: 'Todo', position: 2, cards: [
      { content: 'Dormir', position: 1, color: '#FF0000' },
      { content: 'Nourrir le chat', position: 2 },
      { content: 'Devenir le meilleur dresseur', position: 3 },
    ] },

    { title: 'Liste des anniversaires', position: 3, cards: [
      { content: 'Maman le 01/01/1970', position: 1, color: '#0000FF' },
    ] }

  ], { include: "cards" });

  // Add Tags to some Cards
  await addTagToCard("Savon", ecoTag);
  await addTagToCard("Savon", urgentTag);
  await addTagToCard("Nourrir le chat", urgentTag);
  await addTagToCard("Dormir", lateTag);


  console.log("✅ Okanban seed done with success !");
  
  console.log("🧹 Clean up by closing database connexion");
  await sequelize.close();
}

async function addTagToCard(cardContent, tagEntity) {
  const card = await Card.findOne({ where: { content: cardContent }});
  await card.addTag(tagEntity);
}
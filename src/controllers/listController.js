import Joi from "joi";
import sanitizeHtml from 'sanitize-html';

import { List } from "../models/index.js"; // ESM = obligé de mettre index.js

export async function getAllLists(req, res) {
  // Récupérer toutes les listes de la BDD
  const lists = await List.findAll({
    // Inconvénient : attention au poids de la réponse ! Mais ici, on a qu'un seul utilisateur du Kanban, donc pas plus de 1000 listes... ca devrait le faire
    include: {
      association: "cards",
      include: "tags"
    },

    order: [
      ["position", "ASC"],
      ["created_at", "DESC"]
    ]
  });
  
  // Les renvoyer au format JSON
  res.json(lists);
}

export async function createList(req, res) {
  // Récupérer les données dans req.body (qu'on va fournir dans insomnia)
  let { title, position } = req.body;
  
  // ==== VALIDATION ===
  // NOTE : Si on ne met pas de validation, alors le body suivant pourrait passer:  // { title: 42, position: "bonjour" }
  
  // Vérifier que le titre ne comporte pas une injection XSS
  title = sanitizeHtml(req.body.title); // sanitizeHtml("<img .. />") === ""

  // S'il n'y a pas de title dans le body OU que c'est une string vide => 400
  if (! title || typeof title !== "string") {
    res.status(400).json({ error: "Missing body parameter or invalid format: 'title'." }); // Répondre au client
    return; // Arrêter la fonction, pour éviter les if/else à répétition => CLAUSE DE GARDE / EARLY RETURN
  }

  // S'il y a une position (note : facultative) MAIS qu'elle n'est pas un nombre entier POSITIF ==> 400
  if (isDefinedButNotPositiveNumber(position)) {
    return res.status(400).json({ "error": "Invalid type: 'position' should be a strictly positive number." });
  }
  
  // === Créer la liste en BDD ===
  const createdList = await List.create({ title, position });

  // PROBLEME !
  // const result = await sequelize.query(`INSERT INTO "list" ("title", "position") VALUES ('${title}', ${position}) RETURNING *;`); // Equivalent à du SQL brute
  // const createdList = result.rows[0];
  //                                    INSERT INTO "list" ("title", "position") VALUES ('toto', 1); DROP TABLE card_has_tag; -- ) RETURNING *;
  //                                            position ===> 1); DROP TABLE card_has_tag; --

  // SOLUTION !
  // await sequelize.query(`INSERT INTO "list" ("title", "position") VALUES ($1, $2) RETURNING *;`, [title, position]);
  
  res.status(201).json(createdList); // 201 = created

}

export async function getOneList(req, res) {
  // Récupérer l'ID de la liste demandée
  const listId = parseInt(req.params.id);

  // Vérifier que l'ID demandé est bien un nombre
  if (!Number.isInteger(listId)) {
    return res.status(404).json({ error: "List not found." });
  }

  // Récupérer la liste en BDD
  const list = await List.findByPk(listId);

  // Si elle existe pas => 404
  if (!list) {
    return res.status(404).json({ error: "List not found." });
  }

  // La renvoyer en JSON
  res.status(200).json(list);
}

export async function deleteList(req, res) {
  // récupérer l'ID de la liste à supprimer
  const listId = parseInt(req.params.id);
  
  // Vérifier que cet ID est un entier
  if (!Number.isInteger(listId)) {
    return res.status(404).json({ error: "List not found." });
  }
  
  // Récupérer la liste à supprimer en BDD
  const list = await List.findByPk(listId);
  
  // Si la liste existe pas => 404
  if (!list) {
    return res.status(404).json({ error: "List not found." });
  }
  
  // Si la liste existe, on la supprime (.destroy())
  await list.destroy();
  // Grace au ON DELETE CASCADE sur la list_id des cartes, les cartes de cette liste seront supprimées automatiquement !

  // Si on avait mis ce ON DELETE CASCADE, comment on aurait pu implémenter l'équivalent en JS ? 
  // const cards = await Card.findAll({ where: { list_id: listId }});
  // for (const card of cards) { await card.destroy(); }
  
  // On renvoie une réponse 204 au client sans le body
  res.status(204).end();
  // res.status(204).json({}); // fait tout à fait l'affaire
}

export async function updateList(req, res) {
  // Récupérer l'ID de la liste
  const listId = parseInt(req.params.id);

  // Vérifier que l'ID de la liste est un entier
  if (! Number.isInteger(listId)) {
    return res.status(404).json({ error: "List not found." });
  }

  // VALIDER les champs : 
  // - title : string  (potentiellement undefined si l'utilisateur souhaite uniquement modifier la position)
  // - position : number positif (potentiellement undefined si l'utilisateur souhaite uniquement modifier le title de la liste)

  const updateListSchema = Joi.object({
    title: Joi.string().min(1),
    position: Joi.number().integer().greater(0)
  }).min(1).message("At least property 'title' or 'position' should be provided."); // Au moins un des deux champs dans le body doit être présent

  const { error } = updateListSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Récupérer les champs title et position du body
  const { title, position } = req.body;

  // Récupérer la liste en BDD
  const list = await List.findByPk(listId);

  // Si elle existe pas ==> 404
  if (! list) {
    return res.status(404).json({ error: "List not found." });
  }

  // Si elle existe, on modifie ce qu'il y a à modifier
  // if (title) { // S'il y a un nouveau title
  //   list.title = title;
  // }
  // if (position) { // S'il y a une nouvelle position
  //   list.position = position;
  // }

  // Alternativement
  // list.title = title || list.title;
  // list.position = position || list.position;
  // await list.save();

  await list.update({
    title: title || list.title,
    position: position || list.position
  });

  // On renvoie la liste modifiée
  res.status(200).json(list);
}


function isDefinedButNotPositiveNumber(value) {
  return value !== undefined && (!Number.isInteger(value) || value <= 0);
}

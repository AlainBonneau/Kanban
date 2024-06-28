import { apiBaseUrl } from "./config.js";

export async function getLists() {
  try {
    const httpResponse = await fetch(`${apiBaseUrl}/lists`); // Récupérer les listes via l'API

    if (! httpResponse.ok) { // Si la réponse API n'est pas position (! ok) => on renvoie null
      console.log(httpResponse);
      return null;
    }
    
    const lists = await httpResponse.json(); // [{ id, title, position, cards, created_at, updated_at }, {}, {}]
    return lists;

  } catch (error) { // Catch les erreurs réseaux (je ne peux pas contacter le serveur)
    console.error(error); // Mieux encore, on log l'erreur avec un service externe dédiée à la collecte d'erreur côté client !
    return null; // Si on a pas pu récupérer les listes, cette fonction renvoie null
  }
}

export async function createList(listData) {  // listData = { title: "..." }
  try {
    const httpResponse = await fetch(`${apiBaseUrl}/lists`, { // Faire une requête : POST /lists - BODY = { title: "..." }
      method: "POST",
      body: JSON.stringify(listData),
      headers: { "Content-Type": "application/json" }
    });

    if (! httpResponse.ok) { // Si la réponse API n'est pas position (! ok) => on renvoie null
      console.log(httpResponse);
      return null;
    }

    const createdList = await httpResponse.json(); // On récupère le résultat de la requête
    return createdList;
  } catch (error) {
    console.error(error);
    return null; // Si on ne peut pas créer la liste, cette fonction renvoie null
  }
}

export async function updateList(listId, listData) { // listData = { title: "..." }
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/lists/${listId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listData)
    });
  
    if (!httpResponse.ok) {
      console.log(httpResponse);
      return null;
    }
  
    const updatedList = await httpResponse.json();
    return updatedList;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteList(listId) {
  try {
    const httpResponse = await fetch(`${apiBaseUrl}/lists/${listId}`, {  // renvoie pas de JSON
      method: "DELETE"
    });
  
    if (! httpResponse.ok) {
      console.error(httpResponse);
      return false;
    }
  
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function createCard(cardData) { // card = { content, list_id, color }
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardData)
    });
  
    if (! httpResponse.ok) {
      console.log(httpResponse);
      return null;
    }
  
    const createdCard = await httpResponse.json();
    return createdCard;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateCard(cardId, cardData) { // cardData = { content, color, list_id }
  try {

    const httpResponse = await fetch(`${apiBaseUrl}/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardData)
    });
  
    if (!httpResponse.ok) {
      console.log(httpResponse);
      return null;
    }
  
    const updatedCard = await httpResponse.json();
    return updatedCard;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteCard(cardId) {
  try {
    const httpResponse = await fetch(`${apiBaseUrl}/cards/${cardId}`, {
      method: "DELETE"
    });
  
    if (! httpResponse.ok) {
      console.error(httpResponse);
      return false;
    }
  
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
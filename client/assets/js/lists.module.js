import Sortable from "sortablejs";
import { createList, deleteList, getLists, updateCard, updateList } from "./api.js";
import { closeActiveModal, displaySuccessToast, showErrorModal } from "./utils.js";
import { addCardToList } from "./cards.module.js";


export async function fetchAndDisplayLists() {
  const lists = await getLists(); // Récupérer les listes sur l'API
  
  // lists = [{}, {}, {}] || null
  if (! lists) {
    showErrorModal();
    return; // On arrête la fonction
  }
  
  
  // Renverser la liste pour que les prepends passent finalement dans le bon sens !
  lists.reverse();

  lists.forEach(list => { // Pour chacune des listes dans le tableau des listes
    addListToListsContainer(list); // Insérer la liste dans la page

    list.cards.reverse(); // On renverse la liste des cartes pour lorsque l'on gèrera la position

    list.cards.forEach(card => {
      // Insérer la carte dans la bonne liste !
      addCardToList(card); // card = { color, content, list_id }
    });
  });
}

export function listenToSubmitOnAddListForm() {
  const addListForm = document.querySelector("#add-list-modal form"); // On selectionne le formulaire d'ajout de liste
  addListForm.addEventListener("submit", async (event) => { // On écoute le "submit" sur ce formulaire, en cas de submit : 
    event.preventDefault(); // - empêcher le rechargement de la page (à cause de la requête HTTP par défaut d'un submit dans un formulaire)
    
    const listData = Object.fromEntries(new FormData(addListForm)); // - récupérer les données du formulaire
    // const titleInput = addListForm.querySelector('[name="title"]');
    // console.log(titleInput.value);
    // const body = { title: titleInput.value };

    const createdList = await createList(listData); // listData = { title: "..." }
    // createdList = { ... } || null

    if (!createdList) {
      showErrorModal();
    } else {
      addListToListsContainer(createdList); // On affiche la liste fraichement créée en BDD sur la page ==> addListToListsContainer(list)
      displaySuccessToast("La liste a été créée avec succès.");
    }
  
    closeActiveModal(); // Fermer la modale
    addListForm.reset(); // Reset le formulaire
  });
}

export function addListToListsContainer(list) { // list = { id, title, position, cards, ... }
  const listTemplate = document.querySelector("#list-template"); // Récupérer le template d'une liste
  const listClone = listTemplate.content.cloneNode(true); // Le cloner

  // Modification du template
  listClone.querySelector('[slot="list-title"]').textContent = list.title; // Modifier le title du clone
  listClone.querySelector('[slot="list-id"]').id = `list-${list.id}`; // Modifier l'ID du clone

  // Ecouter le click sur le bouton 🖍️ du clone
  const editListButton = listClone.querySelector('[slot="edit-list-button"]'); // Selectionner le bouton 🖍️ du clone
  editListButton.addEventListener("click", () => {
    // console.log(list.id);

    const editListModal = document.querySelector("#edit-list-modal"); // Selectionner la modale
    editListModal.classList.add("is-active"); // Lui ajouter la classe is-active

    // Bonus : pré-remplir l'ancien titre dans l'input !
    const titleInput = editListModal.querySelector('input[name="title"]'); // Selectionner l'input de la modal et lui mettre une valeur
    const previousListTitle = document.querySelector(`#list-${list.id} [slot="list-title"]`).textContent;
    titleInput.value = previousListTitle; // (BONUS !)

    // Passer l'ID de la liste à la modale
    editListModal.dataset.listId = list.id;
  });

  // Ecouter le click sur le bouton 🗑️ du clone
  const deleteListButton = listClone.querySelector('[slot="delete-list-button"]');
  deleteListButton.addEventListener("click", () => {
    // Selectionner la modale
    const deleteListModal = document.querySelector("#delete-list-modal");
    deleteListModal.classList.add("is-active");

    // Cette modale, il faut lui fournir l'ID de la liste à supprimer (dans les dataset)
    deleteListModal.dataset.listId = list.id;
  });

  // Ecouter le click sur le bouton ➕ du clone
  const addCardButton = listClone.querySelector('[slot="add-card-button"]');
  addCardButton.addEventListener("click", () => {
    // Selectionne la modale d'ajout de carte
    const addCardModal = document.querySelector('#add-card-modal');
    // Mettre la classe is-active
    addCardModal.classList.add("is-active");
    // SECRET : Lui mettre dans ses dataset l'ID de la LISTE dans laquelle on va créer notre carte
    addCardModal.dataset.listId = list.id;
  });

  // Ajout du drag&drop sur le conteneur de carte
  const cardsContainer = listClone.querySelector('[slot="list-content"]');
  Sortable.create(cardsContainer, {
    animation: 150,
    group: "shared",
    onEnd: async (event) => {
      const cardId = parseInt(event.item.id.slice(5));
      const fromListId = parseInt(event.from.parentElement.id.slice(5));
      const toListId = parseInt(event.to.parentElement.id.slice(5));

      if (fromListId !== toListId) { // S'il y a eu changement de liste, on update la list_id de la carte
        const updatedCard = await updateCard(cardId, { list_id: toListId });
        if (!updatedCard) { showErrorModal(); return; }
      }

      // Et on update les positions des cartes dans la liste d'arrivée 
      const cardElements = Array.from(document.querySelector(`#list-${toListId} [slot="list-content"]`).children);
      const promises = cardElements.map((card, index) => {
        const cardId = card.id.slice(5);
        const position = index + 1;
        return updateCard(cardId, { position });
      });
      const results = await Promise.all(promises);

      if (results.includes(null)) {
        showErrorModal();
      } else {
        displaySuccessToast("Positions des cartes sauvegardées avec succès");
      }
    }
  });

  const listsContainer = document.querySelector("#lists-container"); // Sélectionner le conteneur des liste
  listsContainer.prepend(listClone); // Insérer le clone dans ce conteneur (en position 1)
}

export function listenToSubmitOnDeleteListForm() {
  // Selectionner le formulaire de suppression de liste
  const deleteListForm = document.querySelector("#delete-list-form");

  // Ecouter le submit, et en cas de submit :
  deleteListForm.addEventListener("submit", async (event) => {
    // Prévent default
    event.preventDefault();

    // Récupérer l'ID de la liste à supprimer
    const deleteListModal = document.querySelector('#delete-list-modal');
    const listId = deleteListModal.dataset.listId;

    // Appeler l'API route DELETE /lists/:id
    const hasBeenDeleted = await deleteList(listId);

    if (! hasBeenDeleted) { // Si erreur : afficher la modale d'erreur 
      showErrorModal();
    } else { // Si ok : toast de succès + retirer la liste du DOM !
      displaySuccessToast("La liste a bien été supprimée");

      // Selectionner la liste par son ID
      const deletedListElement = document.querySelector(`#list-${listId}`);
      // Retirer cette liste du DOM
      deletedListElement.remove();
    }

    // Fermer la modal
    closeActiveModal();
  });
}

export function listenToClickOnAddListButton() {
  const addListButton = document.querySelector("#add-list-button"); // Selectionner le bouton +
  addListButton.addEventListener("click", () => { // et écouter le click, en cas de click : 
    const addListModal = document.querySelector("#add-list-modal"); // Sélectionner la modale
    addListModal.classList.add("is-active"); // Lui mettre la classe is-active
  });
}

export function listenToSubmitOnEditListForm() {
  const editListModal = document.querySelector("#edit-list-modal");
  const editListForm = document.querySelector("#edit-list-form"); // Selectionner le formulaire 
  
  // Ecouter le submit sur ce formulaire, en cas en submit : 
  editListForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // - preventDefault()

    const listData = Object.fromEntries(new FormData(editListForm)); //  - nouveau titre ==> dans le formulaire
    // console.log(listData); // { title: "List des courses !" }

    const listId = editListModal.dataset.listId;
    // console.log(listId); // 4

    // Avant de fetch, penser à TESTER la ROUTE !
    const updatedList = await updateList(listId, listData); // { ... } || null
    if (! updatedList) {
      showErrorModal();
    } else {
      displaySuccessToast("Liste modifiée avec succès.");
      // Prendre la liste dans la dom et changer son title !
      const updatedListTitleElement = document.querySelector(`#list-${updatedList.id} [slot="list-title"]`);
      updatedListTitleElement.textContent = updatedList.title;
    }

    closeActiveModal();
    editListForm.reset();
  });
  
  // - récupérer les données du formulaire : 
  //   - nouveau titre ==> dans le formulaire
  //   - l'ID de la liste ==> dans les dataSet

  // - PATCH /lists/:id // BODY : { title: "..." }
  // - Récupére le résultat du patch
  
  // Si c'est OK : 
  // - un toast de succès
  // - on modifie le title de la liste sur la page !

  // Si pas OK : 
  // - on affiche notre modal d'erreur

  // - reset le formulaire
  // - on ferme la modale
}

export function setupDragAndDropOnLists() {
  // Selectionner le conteneur des listes
  const listsContainer = document.querySelector("#lists-container");

  // Sortable.create(conteneur)
  Sortable.create(listsContainer, {
    animation: 150,
    handle: '[slot="drag-list-button"]',
    onEnd: async (/* event */) => { // La fonction qui se déclenche lorsque l'utilisateur termine sont drag and drop
      // console.log(event);

      // Au moment du "drop", on va :
      // - PRENDRE l'index de CHAQUE CARTE dans le position du kanban actuel 
      // - PATCH de la position de CHAQUE CARTE

      // Récupérer toutes les listes
      // Itérer dessus : 
      // - leur ID
      // - leur nouvelle position
      // PATCH /lists/:id || BODY { position: ... }

      const listElements = Array.from(document.querySelector("#lists-container").children); // HTMLCollection -> Array<Element>
      // console.log(listElements);

      // /!\ MAUVAISE PRATIQUE : ici on fait autant d'appel API qu'il y a de liste ! => on évite. Notamment parce que s'il y a 1 des 5 calls qui pète, ça met le bazar !
      listElements.forEach(async (listElement, index) => {
        // console.log(listElement); // ELEMENT
        // console.log(listElement.id); // "list-4"
        // console.log(listElement.id.substring(5)); // "4"
        // console.log(parseInt(listElement.id.substring(5))); // 4

        const listId = parseInt(listElement.id.substring(5));
        const position = index + 1; // nouvelle position pour la liste

        await updateList(listId, { position });
      });

      // fetch("/api/lists/positions", {
      //   method: "PATCH",
      //   body: JSON.stringify({
      //     1: 5,
      //     2: 3,
      //     3: 2,
      //     4: 4,
      //     5: 1
      //   })
      // });

      displaySuccessToast("Position des listes sauvegardée.");

      // /!\ Autre option /!\
      // TODO : BONUS : implémenter cette route (coté BACK) et l'appeller convenablement (coté FRONT)
      // Créer une route dédiée pour l'update des listes (côté backend)
      // PUT /lists/positions       BODY :       [{ id: 1, position: 3 }, { id: 2, position: 1 }, { id: 3, position: 2 }]

      // /!\ (BONUS) Pour la gestion d'erreur comment ça se passerait ? /!\
      // [ELEMENT, ELEMENT, ELEMENT] ===> [PROMESE, PROMESE, PROMESE]

      // const promises = listElements.map((listElement, index) => {
      //   const listId = parseInt(listElement.id.substring(5));
      //   const position = index + 1; // nouvelle position pour la liste
      //   return updateList(listId, { position });
      // });
      // const successArray = await Promise.all(promises); // successArray = [ { ... }, { ... }, { ... }, null, { ... }]
      // if (successArray.includes(null)) {
      //   showErrorModal();
      // } else {
      //   displaySuccessToast("Position des listes sauvegardée.");
      // }
    }
  });
}

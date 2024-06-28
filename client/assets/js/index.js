import {
  listenToClickOnAddListButton,
  listenToSubmitOnAddListForm,
  fetchAndDisplayLists,
  listenToSubmitOnEditListForm,
  setupDragAndDropOnLists,
  listenToSubmitOnDeleteListForm
} from "./lists.module.js";

import {
  listenToSubmitOnAddCardForm,
  listenToSubmitOnDeleteCardForm,
  listenToSubmitOnEditCardForm
} from "./cards.module.js";

import { listenToClickOnModalClosingElements } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  listenToClickOnAddListButton();
  listenToClickOnModalClosingElements();
  
  listenToSubmitOnAddListForm();
  listenToSubmitOnEditListForm();
  listenToSubmitOnDeleteListForm();

  listenToSubmitOnAddCardForm();
  listenToSubmitOnEditCardForm();
  listenToSubmitOnDeleteCardForm();

  setupDragAndDropOnLists();

  await fetchAndDisplayLists();
});


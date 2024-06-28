import "animate.css";
import { toast } from "bulma-toast";

export function closeActiveModal() {
  const addListModal = document.querySelector(".is-active"); // Sélectionner la modale active
  addListModal.classList.remove("is-active"); // Lui retirer la classe is-active
}

export function listenToClickOnModalClosingElements() {
  const modalCloseElements = document.querySelectorAll(".close"); // Selectionner tous les éléments avec la classe .close (ceux pour fermer la modal) //> modalCloseElements.addEventListener(); interdit parce qu'on a un array [{}, {}, {}]
  modalCloseElements.forEach(element => { // Pour chaque élément individuellement, on va lui ajouter un listener
    element.addEventListener("click", closeActiveModal); // Ecouter le click, en cas de click :
  });
}

export function displaySuccessToast(message) {
  toast({
    message: message,
    type: "is-success",
    dismissible: true,
    animate: { in: "fadeIn", out: "fadeOut" },
    duration: 5000, // 5 secondes
  });
}

export function showErrorModal() {
  // Selectionner la modale d'erreur
  const errorModal = document.querySelector("#error-modal");
  // Lui ajouter la classe is-active
  errorModal.classList.add("is-active");
}

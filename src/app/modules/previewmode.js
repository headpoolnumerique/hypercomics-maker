import { updateDelayUI } from "./delay";
import { deselect } from "./helpers";
import { updateLayers } from "./layerManipulation";

export function startPreviewMode() {
  document
    .querySelector("#readerMode")
    .addEventListener("click", function (event) {
      document.querySelector("body").classList.toggle("preview");
    });
  readingTools();
  // hide all the button
  //
  // start the reader mode: set the screen accordingly to the ratio (or don’t change the ratio)
  // show the preview tool bar? (could we change the renderer for this here?)
  //  set the scroll delay mode
  // start the reader mode
}

async function readingTools() {
  let canMoveForward = true; // Flag variable to track if moveForward is allowed
  let delay;
  let forwardTimeout = null; // Variable pour stocker la référence du setTimeout
  //handling keyboard
  window.addEventListener("keyup", function (e) {
    //dont move
    if (document.activeElement.tagName === "INPUT") return;
    switch (e.code) {
      case "ArrowLeft":
      case "ArrowUp":
        // Mouvement en arrière, pas de délai nécessaire
        moveBackward();
        resetForwardTimeout(forwardTimeout);
        updateDelayUI();
        updateLayers();
        break;

      case "ArrowRight":
      case "ArrowDown":
        // Vérifie si le mouvement vers l'avant est autorisé
        if (!canMoveForward) {
          console.log(`Please wait for ${delay}ms`);
          return; // Si moveForward est désactivé, on quitte
        }

        // Effectue le mouvement vers l'avant
        moveForward();
        resetForwardTimeout(forwardTimeout);
        updateDelayUI();
        updateLayers();
        testdelay();
        break;
    }

    // Récupère le délai du nouvel élément visible
    const hashElement = document.querySelector(".shown");
    delay = hashElement.dataset.delay || 0;

    testdelay();

    // Disable moveForward for the time set in the db
    canMoveForward = false;
    setTimeout(() => {
      canMoveForward = true;
    }, delay); // 5 seconds delay
  });

  // on scroll
  window.addEventListener("wheel", function (e) {
    e.preventDefault();

    if (!document.querySelector(".preview")) {
      return;
    }

    //get waitign time and set waiting time
    // setWaitingTime();
    //
    if (detectMouseWheelDirection(e) == "up") {
      console.log(canMoveForward);
      moveBackward();
      resetForwardTimeout(forwardTimeout);
      updateDelayUI();
      updateLayers();
    } else {
      if (delay && !canMoveForward) {
        console.log(`please wait for ${delay}ms`);
        return; // If moveForward is not allowed, exit early
      }
      moveForward();
      resetForwardTimeout(forwardTimeout);
      updateDelayUI();
      updateLayers();
    }

    const hashElement = document.querySelector(".shown");
    delay = hashElement.dataset.delay || 0;

    testdelay();

    // Disable moveForward for the time set in the db
    canMoveForward = false;
    setTimeout(() => {
      canMoveForward = true;
    }, delay); // 5 seconds delay
  });
}
function resetForwardTimeout(forwardTimeout) {
  if (forwardTimeout !== null) {
    clearTimeout(forwardTimeout); // Efface le timeout précédent
    forwardTimeout = null; // Réinitialise la variable
  }
}
// move to next plan
function moveForward() {
  let elementToMoveFrom = document.querySelector(".shown");
  let elementToMoveTo = elementToMoveFrom.nextElementSibling;
  if (!elementToMoveFrom || !elementToMoveTo) return;
  elementToMoveTo.classList.add("shown");
  elementToMoveFrom.classList.remove("shown");
  deselect(".selected");
  document
    .querySelector(`#link-${elementToMoveTo.dataset.strapId} a`)
    .classList.add("selected");
  // window.location.hash = new URL(elementToMoveTo.querySelector("a").href).hash;
}

// move to previous plan
function moveBackward() {
  let elementToMoveFrom = document.querySelector(".shown");
  let elementToMoveTo = elementToMoveFrom.previousElementSibling;
  if (!elementToMoveFrom || !elementToMoveTo) return;
  elementToMoveTo.classList.add("shown");
  elementToMoveFrom.classList.remove("shown");
  deselect(".selected");
  document
    .querySelector(`#link-${elementToMoveTo.dataset.strapId} a`)
    .classList.add("selected");
  // window.location.hash = new URL(elementToMoveTo.querySelector("a").href).hash;
}

//detect the direction of the mouse wheel
function detectMouseWheelDirection(e) {
  if (!e) {
    // if the event is not provided, we get it from the window object
    e = window.event;
  }
  let direction;
  if (e.deltaY !== null) {
    return (direction = e.deltaY > 0 ? "down" : "up");
  }
  return direction;
}

function testdelay() {
  const element = document.querySelector("#delaytest");
  element.style.setProperty(
    "--delay-value",
    `${document.querySelector("#minimaldelay").value}ms`,
  );
  // -> removing the class
  element.classList.remove("running");

  // -> triggering reflow /* The actual magic */
  // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
  // Oops! This won't work in strict mode. Thanks Felis Phasma!
  // element.offsetWidth = element.offsetWidth;
  // Do this instead:
  void element.offsetWidth;

  // -> and re-adding the class
  element.classList.add("running");
}

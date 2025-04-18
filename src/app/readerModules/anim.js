export async function readingTools() {
  let canMoveForward = true; // Flag variable to track if moveForward is allowed
  //handling keyboard
  window.addEventListener("keyup", function (e) {
    const hashElement = document.querySelector(window.location.hash);
    const delay = hashElement.dataset.storyDelay || 100;
    canMoveForward = true;
    if (delay && !canMoveForward) {
      console.log(`please wait for ${delay}ms`);
      return; // If moveForward is not allowed, exit early
    }
    switch (e.code) {
      case "ArrowLeft":
        moveBackward();
        break;

      case "ArrowUp":
        moveBackward();
        break;

      case "ArrowRight":
        moveForward();
        break;

      case "ArrowDown":
        moveForward();
        break;
    }

    // Disable moveForward for 5 seconds
    canMoveForward = false;
    setTimeout(() => {
      canMoveForward = true;
    }, delay); // 5 seconds delay
  });

  document
    .querySelector("#showfullscreen")
    ?.addEventListener("click", function () {
      document.body.classList.toggle("show-fullscreen");
    });

  // on scroll
  window.addEventListener("wheel", function (e) {
    e.preventDefault();
    const hashElement = document.querySelector(window.location.hash);
    const delay = hashElement.dataset.storyDelay || 10;
    if (delay && !canMoveForward) {
      console.log(`please wait for ${delay}ms`);
      return; // If moveForward is not allowed, exit early
    }

    //get waitign time and set waiting time
    // setWaitingTime();
    //
    if (detectMouseWheelDirection(e) == "up") {
      moveBackward();
    } else {
      moveForward();
    }

    // Disable moveForward for the time set in the db
    canMoveForward = false;
    setTimeout(() => {
      canMoveForward = true;
    }, delay); // 5 seconds delay
  });

  //updatetoc
  window.addEventListener("hashchange", function (e) {
    let hash = window.location.hash;
    document.querySelector(`#${hash.replace("#plan-", "link-")}`);
    document.querySelector(".selected").classList.remove("selected");
    document
      .querySelector(`#${hash.replace("#plan-", "link-")}`)
      .classList.add("selected");
  });
}

// move to next plan
function moveForward() {
  let elementToMoveFrom = document.querySelector(".selected");
  let elementToMoveTo = elementToMoveFrom.nextElementSibling;
  if (!elementToMoveFrom || !elementToMoveTo) return;
  elementToMoveTo.classList.add("selected");
  elementToMoveFrom.classList.remove("selected");
  window.location.hash = new URL(elementToMoveTo.querySelector("a").href).hash;
}

// move to previous plan
function moveBackward() {
  let elementToMoveFrom = document.querySelector(".selected");
  let elementToMoveTo = elementToMoveFrom.previousElementSibling;
  if (!elementToMoveFrom || !elementToMoveTo) return;
  elementToMoveTo.classList.add("selected");
  elementToMoveFrom.classList.remove("selected");
  window.location.hash = new URL(elementToMoveTo.querySelector("a").href).hash;
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

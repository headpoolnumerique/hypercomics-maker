function readingTools() {
  console.log("setting up reading tools");

  let canMoveForward = true; // Flag variable to track if moveForward is allowed
  //handling keyboard
  window.addEventListener("keyup", function (e) {
    if (!canMoveForward) {
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
    console.log("go")
    setTimeout(() => {
      canMoveForward = true;
    }, 1000); // 5 seconds delay
  });

  // allow some waiting time

  let scrollDelay = 100;
  let scrollTimeout;
  let delayActive = false; // Flag variable to indicate if delay is active

  // Set delay active and start the delay
  delayActive = true;
  setTimeout(() => {
    delayActive = false;
  }, scrollDelay);

  function delayedScroll(e, scrollTimeout, scrollDelay) {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll(e), scrollDelay);
  }

  function handleScroll(e) {
    // console.log(delayActive);
    if (delayActive) {
      return; // If delay is active, do not handle the scroll event
    }

    console.log("Scroll event triggered");
    // move forward/backward on wheel move
    // get waitingTime from section
    // lock minimal time
    // e.preventDefault();

    //get waitign time and set waiting time
    // setWaitingTime();
    //
    if (detectMouseWheelDirection(e) == "up") {
      console.log("up");
      moveBackward();
    } else {
      console.log("down");
      moveForward();
    }

    // detect mouse wheel direction
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
  }
  // on scroll
  window.addEventListener("wheel", function (e) {
    console.log("scroll");
    delayedScroll(e, scrollTimeout, scrollDelay);
  });
}
export { readingTools };

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

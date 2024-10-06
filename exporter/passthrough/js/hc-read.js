const story = document.querySelector("#story");
console.log("story", story);
const existingRatios = [];

document.querySelectorAll("style").forEach((el) => {
  existingRatios.push(el.dataset.ratio);
});

async function readingTools() {
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

  // on scroll
  window.addEventListener("wheel", function (e) {
    if (!window.location.hash)
      window.location.hash = `${document.querySelector("article").id}`;
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

function screenSizeManipulation(existingRatios, story) {
  // change screen at startup
  changeScreenSize(existingRatios, story);

  window.addEventListener("resize", function () {
    changeScreenSize(existingRatios, story);
  });
}

function changeScreenSize(existingRatios, story) {
  // 1. Get the browser ratio (width/height)
  let browserWidth = window.innerWidth;
  let browserHeight = window.innerHeight;
  let browserRatio = browserWidth / browserHeight; // This is the browser ratio

  // 2. Store the ratio in a variable
  let ratio = browserRatio;

  // 5. Choose the closest value from the array based on the ratio
  if (existingRatios.length > 1) {
    let closestValue = existingRatios.reduce((prev, curr) => {
      return Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev;
    });

    // 6. Determine new width and height for the #story element
    if (browserWidth / closestValue <= browserHeight) {
      // Width is the limiting factor
      let newHeight = browserWidth / closestValue;
      story.style.width = browserWidth - 48 + "px";
      story.style.height = newHeight - 48 + "px";
    } else {
      // Height is the limiting factor
      let newWidth = browserHeight * closestValue;
      story.style.width = newWidth - 48 + "px";
      story.style.height = browserHeight - 48 + "px";
    }

    ratioElement.innerHTML = `${ratio} (used: ${closestValue})`;
  }
}

readingTools();
screenSizeManipulation(existingRatios, story);
document.querySelector("#loading").remove();

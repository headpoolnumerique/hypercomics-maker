function readingTools() {
  console.log("setting up reading tools");

  window.addEventListener("keyup", function (e) {
    switch (e.code) {
      case "ArrowLeft":
        moveBackward();
        break;

      case "ArrowUp":
        console.log(e.code);
        moveBackward();
        break;

      case "ArrowRight":
        moveForward();
        break;
      case "ArrowDown":
        moveForward();
        break;
    }
  });

  // allow some waiting time
  let waitingTime = false;

  // move forward/backward on wheel move
  window.addEventListener("wheel", function (e) {
    // if you need to wait, dont accept the wheel changed
    if (waitingTime) {
      return;
    }
    // get waitingTime from section
    // lock minimal time
    e.preventDefault();

    //get waitign time and set waiting time
    // setWaitingTime();
    //
    if (detectMouseWheelDirection() == "up") {
      console.log("up");
      moveBackward();
    } else {
      console.log("down");
      moveForward();
    }
  });

  // wait!
  function setWaitingTime(lapsingTime) {
    // TODO get the time value from
    waitingTime = true;
    setTimeout(function (lapsingTime) {
      if (!lapsingTime) {
        lapsingTime = 2000;
      }
      waitingTime = false;
      console.log("you can now");
    }, lapsingTime);
  }

  function moveForward() {
    let old = document.querySelector(".selected");
    if (!old || !old.nextElementSibling) return;
    old.nextElementSibling?.classList.add("selected");
    old.classList.remove("selected");
    window.location.hash = new URL(old.nextElementSibling.querySelector('a').href).hash;
  }
  function moveBackward() {
    let old = document.querySelector(".selected");
    if (!old || !old.previousElementSibling) return;
    old.classList.remove("selected");
    old.previousElementSibling.classList.add("selected");
    window.location.hash = new URL(old.previousElementSibling.querySelector('a').href).hash;
  }

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

  function waitForMe(milisec) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
      }, milisec);
    });
  }

  function highlightPlanNumber() {}
}

export { readingTools };

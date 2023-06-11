window.addEventListener("keyup", function(e) {
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

function setPreviousOpacity() {
  if (!window.location.hash) {
    return;
  }
  if (document.querySelector(".oldView")) {
    document.querySelector(".oldView").classList.remove("oldView");
  }

  document.querySelector(`${window.location.hash}`).classList.add("oldView");
}

// allow some waiting time
let waitingTime = false;

window.addEventListener("wheel", function(e) {
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
    moveBackward();
    setMove("minus");
  } else {
    if (!document.querySelector("body").classList.contains("work")) {
      // setWaitingTime();
      setMove("maxus");
    }
    moveForward();
    setMove();
  }
});

const setMove = (dir) => {
  let stickyWrap = document.querySelector(".stickyWrap");
  if (dir == "minus") {
    stickyWrap.style.setProperty(
      "--unit",
      Number(Number(stickyWrap.style.getPropertyValue("--unit") - 0.3))
    );
  } else {
    stickyWrap.style.setProperty(
      "--unit",
      Number(Number(stickyWrap.style.getPropertyValue("--unit")) + 0.3)
    );
  }
};

// wait!
function setWaitingTime(lapsingTime) {
  // TODO get the time value from
  waitingTime = true;
  setTimeout(function(lapsingTime) {
    if (!lapsingTime) {
      lapsingTime = 2000;
    }
    waitingTime = false;
    console.log("you can now");
  }, lapsingTime);
}

function moveForward() {
  if (
    window.location.hash !=
    "#" + document.querySelector("section:last-of-type").id
  ) {
    window.location.hash = `#event-${Number(
      Number(window.location.hash.replace("#event-", "")) + 1
    )}`;
  }
}
function moveBackward() {
  if (window.location.hash != "#" + document.querySelector(".event").id) {
    window.location.hash = `#event-${Number(
      Number(window.location.hash.replace("#event-", "")) - 1
    )}`;
  }
}

function detectMouseWheelDirection(e) {
  if (!e) {
    // if the event is not provided, we get it from the window object
    e = window.event;
  }
  if (e.deltaY !== null) {
    return (direction = e.deltaY > 0 ? "down" : "up");
  }

  return direction;
}

document.querySelector("#work").addEventListener("click", function() {
  document.body.classList.toggle("work");
});
document.querySelector("#showUpdate").addEventListener("click", function() {
  document.querySelector("#update").classList.toggle("show");
});

function waitforme(milisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, milisec);
  });
}

document.querySelector("main").addEventListener("mousedown", function(e) {
  if (e.target.classList.contains("moveable")) {
    console.log(e.target);
    select(e.target);
  } else {
    if (document.querySelector(".active")) {
      document.querySelector(".active").classList.remove("active");
    }
  }
});
function select(img) {
  console.log(img);
  if (!document.querySelector(".active")) {
    img.classList.add("active");
  } else {
    document.querySelector(".active").classList.remove("active");
    img.classList.add("active");
  }
}

function nextprev() {
  //nextg prev?
  // show hide/plan
  document
    .querySelector("#previewPrevious")
    .addEventListener("click", function() {
      let shownPlan = document.querySelector(".shown");
      let shownLink = document.querySelector(".selected");

      if (!shownPlan.previousElementSibling) {
        return false;
      }

      document.querySelector(".oldshown")?.classList.remove("oldshown");
      shownPlan.classList.remove("shown");
      shownLink.classList.remove("selected");
      shownPlan.previousElementSibling.classList.add("shown");
      shownPlan.previousElementSibling?.previousElementSibling?.classList.add(
        "oldshown"
      );
      shownLink
        .closest("li")
        .previousElementSibling.querySelector("a")
        .classList.add("selected");
    });

  document.querySelector("#previewNext").addEventListener("click", function() {
    let shownPlan = document.querySelector(".shown");
    let shownLink = document.querySelector(".selected");
    if (!shownPlan.nextElementSibling) {
      return false;
    }
    shownPlan.classList.remove("shown");
    shownLink.classList.remove("selected");
    document.querySelector(".oldshown")?.classList.remove("oldshown");
    shownPlan.nextElementSibling.classList.add("shown");
    shownPlan.classList.add("oldshown");
    shownLink
      .closest("li")
      .nextElementSibling.querySelector("a")
      .classList.add("selected");
  });
}

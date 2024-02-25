import interact from "interactjs";

function toggleToolbars() {
  document
    .querySelector("#homeButtonsList")
    .addEventListener("click", function (event) {
      switch (event.target.id) {
        case "showLayers":
          console.log(event.target.id);
          toggleToolbar(document.querySelector("#layer-space"));
          break;
        case "showScreens":
          console.log(event.target.id);
          toggleToolbar(document.querySelector("#screen-ui"));
          break;
        case "showSequence":
          console.log(event.target.id);
          toggleToolbar(document.querySelector("#sequence"));
          break;
        case "showContextual":
          console.log(event.target.id);
          toggleToolbar(document.querySelector("#contextualUI"));
          break;
        case "showAssets":
          console.log(event.target.id);
          toggleToolbar(document.querySelector("#assets"));
          break;
        case "showMontage":
          console.log(event.target.id);
          toggleToolbar(document.querySelector("#banc-montage"));
          break;
        case "showPelure":
          console.log(event.target.id);
          if (document.querySelector(".oldShow")) {
            document.querySelector(".oldshown")?.classList.remove(".oldshown");
          }
          document.querySelector("main").classList.toggle("showPrevious");
          document
            .querySelector(".shown")
            .previousElementSibling?.classList.add("oldshown");
          break;
        default:
          console.log(event.target.id);
          console.log("this menu does nothing yet");
      }
    });
}

function toggleToolbar(toolbarElement) {
  toolbarElement.classList.toggle("hide");
  toolbarElement.style.top = "20%";
  toolbarElement.style.left = "20%";
}

function moveToolbars() {
  interact(".moveable")
    .draggable({
      inertia: false,
      onmove: function (event) {
        var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
          y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform = target.style.transform =
          "translate(" + x + "px, " + y + "px)";

        // update the position attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
      },
      onend: function (event) {
        console.log(event);
      },
    })
    .allowFrom("h2");
}

function resizeMontagePaneVertically() {
  const pane = document.querySelector("#planOrder");
  interact(pane).resizable({
    // only allow resizing from the top edge
    edges: { top: true },
    // keep the width the same during resizing
    preserveAspectRatio: false,
    // set a minimum height for the element
    restrictSize: {
      min: { height: 50 },
    },
    // on each resize event, update the height of the element
    onmove: (event) => {
      const height = event.rect.height;
      pane.style.height = `${height}px`;
    },
  });
}

export { moveToolbars, toggleToolbars, resizeMontagePaneVertically };

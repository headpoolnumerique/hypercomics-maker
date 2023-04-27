import { layerList, previewScreen } from "./selectors";
import Sortable from "sortablejs/modular/sortable.complete.esm.js";
import { deselect } from "./helpers";
import { deleteObject, updateTheUI } from "./objectManipulations";

// how is the layer list created?
// is it the layer list that maintains everything or is the layer list based on the preview block

// every time there is a change in the plan, if the layer is open, then the layer pane is updated to follow whatever happen in the layer box

// so the code should be this: everytime there is a plan loaded: on screen, the layer pane gets updated

function addLayer(asset) {
  appendLayer(asset.id);
}

function appendLayer(id, layerWrapper = layerList, top = false) {
  layerWrapper.insertAdjacentHTML(
    // put the first at the bottom
    top ? "beforeend" : "afterbegin",
    `<li data-objectid="${id}">
        <span class="moveIcon">M</span>
        <span class="identifier">#${id}</span>
        <span class="hidebutton">S</span>
        <span class="delete">D</delete>
    </li>`
  );
}

function selectLayer(layerWrapper = "layerList", id) {
  deselect(".selectedlayer");
  layerWrapper.querySelector(`li[data-objectid="${id}"]`).classList.add("selectedLayer");
}

function layerInteract(layerWrapper = layerList) {
  layerWrapper.addEventListener("click", function(e) {
    deselect(".selectedLayer");
    const target = e.target;


    if (!target.closest("li")){
      return
    }

    let objectid = target.closest("li").dataset.objectid;

    if (target.classList.contains("identifier")) {
      target.closest("li").classList.add("selectedLayer");
      deselect(".confirm");
      deselect(".asset-selected");
      const selectedObject = document.querySelector(
        `.shown [data-objectid="${objectid}"]`
      );
      selectedObject.classList.add("asset-selected");
      updateTheUI(selectedObject);
    } else if (target.classList.contains("hidebutton")) {
      target.closest("li").classList.add("selectedLayer");
      deselect(".asset-selected");
      const hidingObject = document.querySelector(
        `.shown [data-objectid="${objectid}"]`
      );
      hidingObject.classList.toggle(["asset-hidden"]);
      target.closest("li").classList.toggle("hidden");
    } else if (target.classList.contains("delete")) {
      target.closest("li").classList.add("selectedLayer");
      deselect(".asset-selected");
      const removableObject = document.querySelector(
        `.shown [data-objectid="${objectid}"]`
      );
      removableObject.classList.add(["asset-selected"]);
      if (target.classList.contains("confirm")) {
        deleteObject();
        target.closest("li").remove();
      }
      deselect(".confirm");
      target.classList.add("confirm");
    }
  });
}

function emptyLayers(layerWrapper = layerList) {
  layerWrapper.innerHTML = "";
}

function updateLayers(layerWrapper = layerList) {
  emptyLayers(layerWrapper);
  document
    .querySelector(".shown")
    .querySelectorAll(".asset")
    .forEach((asset) => {
      console.log(asset.dataset.objectid);
      appendLayer(asset.dataset.objectid);
    });

  // recreate the layer list from the selected plan
}

function reorderLayer(wrappingElement) {
  var sortableLayers = Sortable.create(wrappingElement, {
    animation: 300,
    multiDrag: true, // Enable the plugin
    selectedClass: "toDrag",
    multiDragKey: "shift", // Key that must be down for items to be selected
    avoidImplicitDeselect: false, // true - if you don't want to deselect items on outside click
    handle: ".moveIcon", //handle for the sorting block

    onEnd: function(event) {
      console.log(event);
      // reorder the plan
      // send the new order to the axios
    },
  });
}

export {
  selectLayer,
  reorderLayer,
  updateLayers,
  addLayer,
  appendLayer,
  layerInteract,
};

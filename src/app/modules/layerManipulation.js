import { layerList, previewScreen, zindexInteraction } from "./selectors";
import Sortable from "sortablejs/modular/sortable.complete.esm.js";
import { deselect } from "./helpers";
import { deleteObject, moveToLayer, updateTheUI } from "./objectManipulations";
import config from "../config/config";
import { updateData } from "./dataManagement";

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
<span class="moveIcon">M<span class="popup">move</span></span>
        <span class="previewTop"><span class="popup">preview on top</span>P</span>
        <span class="identifier">#${id}</span>
        <span class="hidebutton"><span class="popup">hide</span>S</span>
        <span class="delete"><span class="popup">delete</span>D</delete>
    </li>`,
  );
}
function selectLayer(layerWrapper = "layerList", id) {
  deselect(".selectedlayer");

  //select the layer with the data object id
  layerWrapper
    .querySelector(`li[data-objectid="${id}"]`)
    .classList.add("selectedLayer");
}

function layerInteract(layerWrapper = layerList) {
  // layer buttons
  zindexInteraction?.addEventListener("click", function(event) {
    const asset = previewScreen.querySelector(".asset-selected"),
      plan = previewScreen.querySelector(".shown");
    switch (event.target.id) {
      case "moveFarther":
        moveToLayer(asset, plan, "farther");
        break;
      case "moveCloser":
        moveToLayer(asset, plan, "closer");
        break;
      case "moveFarest":
        moveToLayer(asset, plan, "farest");
        break;
      case "moveClosest":
        moveToLayer(asset, plan, "closest");
        break;
      default:
        console.log("not there yet");
    }
  });

  // layer selection, hide/show,. deletion
  layerWrapper.addEventListener("click", function(e) {
    deselect(".selectedLayer");
    const target = e.target;

    if (!target.closest("li")) {
      return;
    }

    let objectid = target.closest("li").dataset.objectid;

    if (target.classList.contains("identifier")) {
      target.closest("li").classList.add("selectedLayer");
      deselect(".confirm");
      deselect(".asset-selected");
      const selectedObject = document.querySelector(
        `.shown [data-objectid="${objectid}"]`,
      );
      selectedObject.classList.add("asset-selected");
      updateTheUI(selectedObject);
    } else if (target.classList.contains("previewTop")) {
      const previewObj = document.querySelector(
        `.shown [data-objectid="${objectid}"]`,
      );
      target.closest("li").classList.add("previewedTop");
      previewObj.classList.toggle("previewTop");
    } else if (target.classList.contains("hidebutton")) {
      target.closest("li").classList.add("selectedLayer");
      deselect(".asset-selected");
      const hidingObject = document.querySelector(
        `.shown [data-objectid="${objectid}"]`,
      );
      hidingObject.classList.toggle(["asset-hidden"]);
      target.closest("li").classList.toggle("hidden");
    } else if (target.classList.contains("delete")) {
      target.closest("li").classList.add("selectedLayer");
      deselect(".asset-selected");
      const removableObject = document.querySelector(
        `.shown [data-objectid="${objectid}"]`,
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

async function updateLayers(layerWrapper = layerList) {
  // recreate the layer list from the selected plan
  emptyLayers(layerWrapper);
  //on load, 
  document
    .querySelector(".shown")
    .querySelectorAll(".asset")
    .forEach((asset) => {
      // console.log(asset.dataset.objectid);
      appendLayer(asset.dataset.objectid);
    });
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
      saveLayerOrder(
        config.strapi.url,
        document.querySelector(".shown").dataset.strapId,
        layerList,
      );
      // reorder the plan
      // send the new order to the axios
    },
  });
}

function saveLayerOrder(strapiUrl, planId, layerWrapper) {
  let orderedObjs = [];
  // get the order of the layers in the plan. reverse the order as html is set the opposite way,
  [...layerWrapper.querySelectorAll("li")].reverse().forEach((obj) => {
    // create the orderedList of all the assets
    orderedObjs.push(obj.dataset.objectid);
  });

  // plan
  const plan = document.querySelector(".shown");

  // list of asset not needed
  // const assets = plan.querySelectorAll(".asset");

  // strapi call
  console.log(orderedObjs);
  let data = {
    objects: {
      set: orderedObjs,
    },
  };

  updateData(
    config.strapi.url,
    "plans",
    data,
    Number(plan.dataset.strapId),
  ).then((response) => {
    if (response.status == 200) {
      // reorder on screen when the response is ok
      orderedObjs.forEach((assetInOrder) => {
        const element = plan.querySelector(
          `.asset[data-objectid="${assetInOrder}"]`,
        );
        plan.appendChild(element);
      });
    }
  });

  // get the plan id
  // rest the pln order
  // reorder the plan preview
}

export {
  selectLayer,
  reorderLayer,
  updateLayers,
  addLayer,
  appendLayer,
  layerInteract,
};

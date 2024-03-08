import { reorderObjectInPlan, removeObjectFromPlan } from "./dataManagement.js";
import interact from "interactjs";
import config from "../config/config.js";
import axios from "axios";


function moveToLayer(object, plan, position) {
  // move any object to a specific layer

  switch (position) {
    case "farest":
      reorderObjectInPlan(
        config.strapi.url,
        plan.id.split("-")[1],
        object.dataset.objectid,
        "farest",
      )
        .then(plan.insertAdjacentElement("afterbegin", object))
        .catch((error) => {
          if (error) {
            console.log(error);
          }
        });
      break;

    case "closest":
      reorderObjectInPlan(
        config.strapi.url,
        plan.id.split("-")[1],
        object.dataset.objectid,
        "closest",
      )
        .then(plan.insertAdjacentElement("beforeend", object))
        .catch((error) => {
          if (error) {
            console.log(error);
          }
        });
      break;

    case "closer":
      if (object?.nextElementSibling != null) {
        reorderObjectInPlan(
          config.strapi.url,
          plan.id.split("-")[1],
          object.dataset.objectid,
          "after",
          object.nextElementSibling.dataset.objectid,
        )
          .then(
            object.nextElementSibling.insertAdjacentElement("afterend", object),
          )
          .catch((error) => {
            if (error) {
              console.log(error);
            }
          });
      }
      break;

    case "farther":
      if (object.previousElementSibling != null) {
        reorderObjectInPlan(
          config.strapi.url,
          plan.id.split("-")[1],
          object.dataset.objectid,
          "before",
          object.previousElementSibling.dataset.objectid,
        )
          .then(
            object.previousElementSibling.insertAdjacentElement(
              "beforebegin",
              object,
            ),
          )
          .catch((error) => {
            if (error) {
              console.log(error);
            }
          });
      }
      break;
  }

  // check plan total layer and save it as plan.dataset.layersTotal
  // do we need to know the total amount if we only move them and save their exact places?
  // not so sure. We can simply move thing, and not send if it’s first going back or last going top.

  if (!plan.dataset.layersTotal) {
    plan.dataset.layersTotal = plan.querySelectorAll(".object").length;
  }
  // console.log(plan.dataset.layersToral)
  const totalLayer = plan.dataset.layersTotal;
  // (is it really needed)

  // check asset layer
  // when added, and asset needs to have the layer (using the index of the relation when adding the image to the plan)
  // if you want to Zmove an asset. if the selected in the latest, it can only go toward 0, if it’s 0, it can oly go toward the final one.
  //

  // reorder layer
  // move the element at his position: position in the html = order
  // no z-index involve!

  // move the element on the right layer (moveAfter, moveBefore)
}


/*
deteleAsset
@params domObject asset - the removedasset 
*/
async function deleteObject() {
  const plan = document.querySelector("#previewScreen article.shown");
  const object = document.querySelector(".asset-selected");
  // send info to strapi
  removeObjectFromPlan(
    config.strapi.url,
    plan.id.split("-")[1],
    object.dataset.objectid,
  ).then(object.remove());
}

function addRuleToObject(objectid, data) {
  return axios
    .put(`${config.strapi.url}/api/objects/${objectid}`, {
      data,
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      return err;
    });
}

function percentage(partialValue, totalValue) {
  return ((100 * partialValue) / totalValue).toFixed(2);
}

function updateFromUi() {
  // update the element selected when there are some changes in the UI form
  //if anchor top : keep top and bottom = unset
  //if anchor bottom : keep bottom and top = unset
  //if anchor right : keep right and left = unset
  //if anchor left : keep left and right = unset

  document.querySelector("#inputx").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.left =
      document.querySelector("#inputx").value + "%";
  });
  document.querySelector("#inputx").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.left =
      document.querySelector("#inputx").value + "%";
  });
  document.querySelector("#inputy").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.top =
      document.querySelector("#inputy").value + "%";
  });
  document.querySelector("#inputwidth").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.width =
      document.querySelector("#inputwidth").value + "%";
  });
  document.querySelector("#inputheight").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.height =
      document.querySelector("#inputheight").value + "%";
  });
}

function updateTheUI(element) {
  // update the ui from the selected element
  let previewScreen = document.querySelector("#previewScreen");
  let previewScreenSize = {
    height: previewScreen.offsetHeight,
    width: previewScreen.offsetWidth,
  };
  document.querySelector("#inputx").value = percentage(
    element.offsetLeft,
    previewScreenSize.width,
  );
  document.querySelector("#inputy").value = percentage(
    element.offsetTop,
    previewScreenSize.height,
  );
  document.querySelector("#inputwidth").value = percentage(
    element.width,
    previewScreenSize.width,
  );
  document.querySelector("#inputheight").value = percentage(
    element.height,
    previewScreenSize.height,
  );
}

export { deleteObject, moveToLayer, updateFromUi, updateTheUI };

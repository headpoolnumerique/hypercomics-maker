import { deselect, selectLink, activatePlan } from "./helpers.js";
import config from "../config/config.js";
import {
  sequenceNumber,
  sequencePreview,
  montageList,
  previewScreen,
  stylesWrapper,
  plandelay,
} from "./selectors.js";
import { createData, updateData } from "./dataManagement.js";
import axios from "axios";
import Sortable from "sortablejs/modular/sortable.complete.esm.js";
import { updateLayers } from "./layerManipulation.js";
import { cloneStylesheetRules, saveAllStylesheet } from "./stylesheet.js";

// reorder the plan, visually, then send an update to the order using set in the sequence, and reorder the whole blocks
//
//
//
//
//

function dragAndPlanReorder(wrappingElement, sequenceNumber) {
  var sortable = Sortable.create(wrappingElement, {
    animation: 300,
    multiDrag: true, // Enable the pluginsortable
    selectedClass: "toDrag",
    multiDragKey: "shift", // Key that must be down for items to be selected
    avoidImplicitDeselect: false, // true - if you don't want to deselect items on outside click
    onEnd: function (event) {
      resetOrder(wrappingElement);
      // reorder the sequence preview

      // let updatedData =

      // await updateData(
      //   config.strapi.url,
      //   "sequences",
      //   updatedData,
      //   Number(sequenceNumber.textContent)
      // );
      // send a new order to the server /
      // reorder the plan in the top bar
    },
  });
}

export function updateDelayUI() {
  plandelay.value = document.querySelector(".shown")
    ? document.querySelector(".shown").dataset.delay
    : "";
}

function resetOrder(wrappingElement) {
  let updatedOrder = [];
  wrappingElement.querySelectorAll("li").forEach((item) => {
    updatedOrder.push(item.id.replace("link-", ""));
  });
  updatedOrder.forEach((id) => {
    previewScreen.insertAdjacentElement(
      "beforeend",
      previewScreen.querySelector(`#plan-${id}`),
    );
  });
  let data = {
    plans: {
      set: updatedOrder,
    },
  };

  updateData(config.strapi.url, "sequences", data, sequenceNumber.textContent);
}
/*
// add plan to the sequence 
// montageList = montage list in the montage pane,
// sequence → sequence id, 
// select → if the new plan is selected by default
*/

async function deleteAllPlans() {
  let sequenceId = document.querySelector("#sequenceNumber").textContent;
  let data = {
    plans: {
      set: [],
    },
  };

  return axios
    .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
      data,
    })
    .then((response) => {
      document.querySelectorAll("#previewScreen article").forEach((article) => {
        article.remove();
      });
      document.querySelectorAll("#planOrder li").forEach((el) => {
        el.remove();
      });
    })
    .catch((err) => {
      return err;
    });
}

// todo delete multiple plan from the to drag

export async function deletePlan() {
  let sequenceId = document.querySelector("#sequenceNumber").textContent;
  let previousPlan = document
    .querySelector(".shown")
    .previousElementSibling?.id.split("-")[1];
  let planId = document.querySelector(".shown").dataset.strapId;
  let data = {
    plans: {
      disconnect: [
        {
          documentId: planId,
        },
      ],
    },
  };

  return axios
    .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
      data,
    })
    .then((response) => {
      document.querySelector(".shown").remove();
      document.querySelector(".selected").closest("li").remove();
      //show previousPlan if it exists
      if (previousPlan) {
        activatePlan(previousPlan);
        updateLayers();
      } else {
        let firstPlan = document.querySelector(".plan").id.split("-")[1];
        activatePlan(firstPlan);
        updateLayers();
      }
    })
    .catch((err) => {
      return err;
    });
}

async function addPlan(montageList, select = true) {
  // find the position of the plan
  //find the referencePlan: the one we’ll add to
  // define a position

  let position;
  let referencePlanLink = document.querySelector(".selected");
  let referencePlan = document.querySelector(".shown");
  if (!referencePlan) {
    //if no reference, add at the end
    position = { end: true };
  } else {
    position = { after: referencePlan.dataset.strapId };
  }

  //find out the reference plan and the position, check if we’re at the right place

  if (select) {
    deselect(".selected");
    deselect(".shown");
  }

  let data = {
    // create and link to the sequence to the sequence after
    sequence: sequenceNumber.textContent,
  };

  // create the plan, and set it to a sequence
  let response = await createData(config.strapi.url, "plans", data);
  console.log(response);

  // update the order of the plan in the sequence object
  let updatedData = {
    plans: {
      connect: [
        {
          documentId: response.data.data.documentId,
          position,
        },
      ],
    },
  };

  //reorder the sequence
  await updateData(
    config.strapi.url,
    "sequences",
    updatedData,
    sequenceNumber.textContent,
  );
  // insert the new plan at the end, unless there is a position
  if (!referencePlan) {
    montageList.insertAdjacentHTML(
      "beforeend",
      `<li class="created" id="link-${response.data.data.documentId}"><a class=${
        select ? "selected" : ""
      } href="#plan-${response.data.data.documentId}" >
    </a></li>`,
    );
    sequencePreview.insertAdjacentHTML(
      "beforeend",
      `<article class="${select ? "shown" : ""}" id="plan-${
        response.data.data.documentId
      }" data-strap-id="${response.data.data.documentId}"></article>`,
    );
  } else {
    referencePlanLink.closest("li").insertAdjacentHTML(
      "afterend",
      `<li class="created" id="link-${response.data.data.documentId}"><a class=${
        select ? "selected" : ""
      } href="#plan-${response.data.data.documentId}" >
    </a></li>`,
    );
    referencePlan.insertAdjacentHTML(
      "afterend",
      `<article  class="created ${select ? "shown" : ""}" id="plan-${
        response.data.data.documentId
      }" data-strap-id="${response.data.data.documentId}"></article>`,
    );
  }
  updateDelayUI();
}

// duplicate the plan
// get the data from the plan, create a new one with the exact same data, push it to the UI
export async function duplicatePlan(
  montageList,
  planToDuplicateId,
  sequenceId,
  select = true,
) {
  // show the loading while we duplicate because there may be a bit of back and forth
  document.querySelector("#loading").classList.remove("hide");

  // 1. duplicate the plan and put it at its right place
  let position;
  let referencePlan = document.querySelector(".shown");
  let referencePlanLink = document.querySelector(".selected");
  if (!referencePlan) {
    //if no reference, add at the end
    position = { end: true };
  } else {
    position = { after: referencePlan.dataset.strapId };
  }

  //deselect all block
  if (select) {
    deselect(".selected");
    deselect(".shown");
  }

  // create a new plan and connect it right after the plan you’re ducplicating
  let data = {
    data: {
      sequence: sequenceId,
    },
  };

  // Create a plan and add it to the sequence number.
  const newPlanId = await axios
    .post(`${config.strapi.url}/api/plans/`, data)
    .then(async (response) => {
      // TOFIX here!
      // update the order of the plan in the sequence object
      let updatedData = {
        plans: {
          connect: [
            {
              documentId: response.data.data.documentId,
              position: position,
            },
          ],
        },
      };

      // update the location of the plan if the plan isn’t at the end
      console.log("is position end ? ", position);
      if (!position.end) {
        await axios
          .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
            data: updatedData,
          })
          .then((response) => {
            // console.log(response)
            // console.log(response);
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      }

      // insert the new plan at the end, unless there is a position
      if (!referencePlan) {
        montageList.insertAdjacentHTML(
          "beforeend",
          `<li class="created" id="link-${response.data.data.documentId}"><a class=${
            select ? "selected" : ""
          } href="#plan-${response.data.data.documentId}" >
    </a></li>`,
        );
        sequencePreview.insertAdjacentHTML(
          "beforeend",
          `<article class="plan ${select ? "shown" : ""}" id="plan-${
            response.data.data.documentId
          }" data-strap-id="${response.data.data.documentId}"></article>`,
        );
      } else {
        referencePlanLink.closest("li").insertAdjacentHTML(
          "afterend",
          `<li  class="created" id="link-${response.data.data.documentId}"><a class=${
            select ? "selected" : ""
          } href="#plan-${response.data.data.documentId}" >
    </a></li>`,
        );
        referencePlan.insertAdjacentHTML(
          "afterend",
          `<article class="plan ${select ? "shown" : ""}" id="plan-${
            response.data.data.documentId
          }" data-strap-id="${response.data.data.documentId}"></article>`,
        );
      }
      return response.data.data.documentId;
    });

  // manage object of the plan
  let objectsOfThePlan = referencePlan.querySelectorAll("img");
  for (const el of objectsOfThePlan) {
    //remove the unused
    //
    //
    let newData = {
      previousId: el.id,
      previousPlanId: el.dataset.planid,
      previousAssetId: el.dataset.assetid,
      previousAssetLocation: el.src,
      newPlanId: newPlanId,
    };
    const managingData = {
      data: {
        plan: newPlanId,
        assets: el.dataset.assetid,
      },
    };

    await axios
      .post(`${config.strapi.url}/api/objects/?populate=*`, managingData)
      .then((response) => {
        let asset = response.data.data.assets[0];
        let plan = response.data.data.plan;
        let object = response.data.data;

        // updateAfterCreation

        // console.log(response);
        let newElement = `<img id="inuse-${plan.documentId}-${object.documentId}" data-objectId="${object.documentId}" data-planid="${plan.documentId}"
        data-assetid="${asset.documentId}" src="${asset.location}" class="asset">`;

        preview
          .querySelector(`#plan-${newPlanId}`)
          .insertAdjacentHTML("beforeend", newElement);
        stylesWrapper.querySelectorAll("style").forEach((styleObj) => {
          // console.log(
          //   styleObj,
          //   managingData.data.previousId,
          //   `inuse-${managingData.data.plan}-${response.data.data.documentId}`,
          // );
          cloneStylesheetRules(
            styleObj,
            //where is the previous ID of the element
            newData.previousId,
            `inuse-${managingData.data.plan}-${response.data.data.documentId}`,
          );
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // whatever happen update the layer and save the stylesheet
        updateLayers();
        saveAllStylesheet();
        updateDelayUI();
        document.querySelector("#loading").classList.add("hide");
      });
  }
}

// render a plan when loading up the app: add it to the preview, and the sequence bar
async function renderPlan(plan, montageList, sequencePreview, select = false) {
  let previewedPlan = document.createElement(`article`);
  previewedPlan.documentId = `plan-${plan.documentId}`;
  previewedPlan.insertAdjacentHTML(
    "afterbegin",
    `<span class="plan-name">${plan.order}</span>`,
  );

  // insert a link to the plan in the montage panel
  montageList.insertAdjacentHTML(
    "beforeend",
    `<li class="created"  id="link-${plan.documentId}"><a class="${
      select ? "selected" : ""
    }" href="#plan-${plan.documentId}"> 

  </a></li>`,
  );

  // insert the plan in the preview plan
  sequencePreview.insertAdjacentHTML(
    "beforeend",
    `<article data-strap-id=${plan.documentId} class="plan ${
      select ? "shown" : ""
    }" id="plan-${plan.documentId}"
       data-delay="${plan.delay}">
    </article>`,
  );
}

// move plan using drag and drop

export function switchMontageModel(model) {
  return model;
}

export { addPlan, deleteAllPlans, selectLink, renderPlan, dragAndPlanReorder };

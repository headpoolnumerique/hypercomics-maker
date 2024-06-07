import { deselect, selectLink, activatePlan } from "./helpers.js";
import config from "../config/config.js";
import {
  sequenceNumber,
  sequencePreview,
  montageList,
  previewScreen,
  stylesWrapper,
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
    avoidImplicitDeselect: true, // true - if you don't want to deselect items on outside click
    onEnd: function(event) {
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

function resetOrder(wrappingElement) {
  let updatedOrder = [];
  wrappingElement.querySelectorAll("li").forEach((item) => {
    updatedOrder.push(Number(item.id.replace("link-", "")));
  });
  updatedOrder.forEach((id) => {
    previewScreen.insertAdjacentElement(
      "beforeend",
      previewScreen.querySelector(`#plan-${id}`),
    );
  });
  // console.log(updatedOrder);
  let data = {
    plans: {
      set: updatedOrder,
    },
  };

  updateData(
    config.strapi.url,
    "sequences",
    data,
    Number(sequenceNumber.textContent),
  );
}
/*
// add plan to the sequence 
// montageList = montage list in the montage pane,
// sequence → sequence id, 
// select → if the new plan is selected by default
*/

async function deleteAllPlans() {
  let sequenceId = Number(
    document.querySelector("#sequenceNumber").textContent,
  );
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
  let sequenceId = Number(
    document.querySelector("#sequenceNumber").textContent,
  );
  let previousPlan = document
    .querySelector(".shown")
    .previousElementSibling.id.split("-")[1];
  console.log(previousPlan);
  let planId = Number(document.querySelector(".shown").dataset.strapId);
  let data = {
    plans: {
      disconnect: [
        {
          id: planId,
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
    position = { after: Number(referencePlan.dataset.strapId) };
  }

  //find out the reference plan and the position, check if we’re at the right place
  // console.log("referencePlan", referencePlan);
  // console.log("position", position);

  if (select) {
    deselect(".selected");
    deselect(".shown");
  }

  let data = {
    // create and link to the sequence to the sequence after
    sequence: Number(sequenceNumber.textContent),
  };

  // create the plan, and set it to a sequence
  let response = await createData(config.strapi.url, "plans", data);

  // update the order of the plan in the sequence object
  let updatedData = {
    plans: {
      connect: [
        {
          id: Number(response.data.data.id),
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
    Number(sequenceNumber.textContent),
  );
  // insert the new plan at the end, unless there is a position
  if (!referencePlan) {
    montageList.insertAdjacentHTML(
      "beforeend",
      `<li id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
      } href="#plan-${response.data.data.id}" >
    </a></li>`,
    );
    sequencePreview.insertAdjacentHTML(
      "beforeend",
      `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
      }" data-strap-id="${response.data.data.id}"></article>`,
    );
  } else {
    referencePlanLink.closest("li").insertAdjacentHTML(
      "afterend",
      `<li  id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
      } href="#plan-${response.data.data.id}" >
    </a></li>`,
    );
    referencePlan.insertAdjacentHTML(
      "afterend",
      `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
      }" data-strap-id="${response.data.data.id}"></article>`,
    );
  }
}

// TODO
// duplicate plan may be more useful:
// get the same object
// create a new plan
// get all the object from the plan and add them again
//
//
//duplicate each rules for each stylesheet
//
//
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
    position = { after: Number(referencePlan.dataset.strapId) };
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
        data: {
          plans: {
            connect: [
              {
                id: Number(response.data.data.id),
                position,
              },
            ],
          },
        },
      };

      // update the location of the plan if the plan isn’t at the end
      if (position.end != true) {
        await axios
          .put(
            `${config.strapi.url}/api/sequences/${sequenceId}?populate=deep,3`,
            {
              data: { updatedData },
            },
          )
          .then((response) => {
            // console.log(response)
            console.log(response);
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
          `<li  id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
          } href="#plan-${response.data.data.id}" >
    </a></li>`,
        );
        sequencePreview.insertAdjacentHTML(
          "beforeend",
          `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
          }" data-strap-id="${response.data.data.id}"></article>`,
        );
      } else {
        referencePlanLink.closest("li").insertAdjacentHTML(
          "afterend",
          `<li  id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
          } href="#plan-${response.data.data.id}" >
    </a></li>`,
        );
        referencePlan.insertAdjacentHTML(
          "afterend",
          `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
          }" data-strap-id="${response.data.data.id}"></article>`,
        );
      }
      return response.data.data.id;
    });

  // manage object
  let objectsOfThePlan = referencePlan.querySelectorAll("img");
  objectsOfThePlan.forEach(async (el) => {
    const managingData = {
      data: {
        plan: newPlanId,
        assets: el.dataset.assetid,

        previousId: el.id,
        previousObjectId: el.dataset.objectid,
        previousPlanId: el.dataset.planid,
        previousAssetId: el.dataset.assetid,
        previousAssetLocation: el.src,
        newPlanId: newPlanId,
      },
    };

    await axios
      .post(` ${config.strapi.url}/api/objects/?populate=deep,3`, managingData)
      .then((response) => {
        console.log(response);
        let newElement = `<img id="inuse-${managingData.data.plan}-${response.data.data.id}" data-objectId="${response.data.data.id}" data-planid="${managingData.data.newPlanId}"
        data-assetid="${managingData.data.previousAssetId}" src="${managingData.data.previousAssetLocation}" class="asset">`;

        preview
          .querySelector(`#plan-${newPlanId}`)
          .insertAdjacentHTML("beforeend", newElement);
        stylesWrapper.querySelectorAll("style").forEach((styleObj) => {
          console.log(
            styleObj,
            managingData.data.previousId,
            `inuse-${managingData.data.plan}-${response.data.data.id}`,
          );
          cloneStylesheetRules(
            styleObj,
            managingData.data.previousId,
            `inuse-${managingData.data.plan}-${response.data.data.id}`,
          );
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        updateLayers();
        saveAllStylesheet();
      });
  });

  document.querySelector("#loading").classList.add("hide");
  // console.log(newObjects);
  // debugger

  // await axios
  //   .get(`${config.strapi.url}/api/plans/${newPlanId}?populate=deep,3`)
  //   .then((response) => {
  //     // let plan = response.data.data;
  //     let planToFill = preview.querySelector(`#plan-${plan.id}`);
  //     let objectsToFillWith = plan.attributes.objects.data;
  //
  //     // // fill the asset manager with the images
  //     objectsToFillWith.forEach((object) => {
  //       object.attributes.assets.data.forEach((asset) => {
  //         planToFill.insertAdjacentHTML(
  //           "beforeend",
  //           `<img id="inuse-${plan.id}-${object.id}" data-objectId="${object.id}" data-planid="${plan.id}"
  //       data-assetid="${asset.id}" src="${asset.attributes.location}" class="asset">`,
  //         );
  //       });
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  //update the layers block
}

// render a plan when loading up the app
async function renderPlan(plan, montageList, sequencePreview, select = false) {
  let previewedPlan = document.createElement(`article`);
  previewedPlan.id = `plan-${plan.id}`;
  previewedPlan.insertAdjacentHTML(
    "afterbegin",
    `<span class="plan-name">${plan.attributes.order}</span>`,
  );

  // insert a link to the plan in the montage panel
  montageList.insertAdjacentHTML(
    "beforeend",
    `<li  id="link-${plan.id}"><a class="${select ? "selected" : ""
    }" href="#plan-${plan.id}"> 

  </a></li>`,
  );

  // insert the plan in the preview plan
  sequencePreview.insertAdjacentHTML(
    "beforeend",
    `<article data-strap-id=${plan.id} class="plan ${select ? "shown" : ""
    }" id="plan-${plan.id}">
    </article>`,
  );
}

// move plan using drag and drop

export { addPlan, deleteAllPlans, selectLink, renderPlan, dragAndPlanReorder };

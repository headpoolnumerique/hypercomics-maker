import { deselect, selectLink, activatePlan } from "./helpers.js";
import config from "../config/config.js";
import { sequenceNumber, sequencePreview, montageList, previewScreen } from "./selectors.js";
import { createData, updateData } from "./dataManagement.js";
import axios from "axios";
import Sortable from "sortablejs/modular/sortable.complete.esm.js";
import { updateLayers } from "./layerManipulation.js";

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
  updatedOrder.forEach(id => {
    previewScreen.insertAdjacentElement("beforeend", previewScreen.querySelector(`#plan-${id}`))
  })
  console.log(updatedOrder);
  let data = {
    plans: {
      set: updatedOrder,
    },
  };

  updateData(
    config.strapi.url,
    "sequences",
    data,
    Number(sequenceNumber.textContent)
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
    document.querySelector("#sequenceNumber").textContent
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




async function deletePlan() {



  let sequenceId = Number(
    document.querySelector("#sequenceNumber").textContent
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
    Number(sequenceNumber.textContent)
  );
  // insert the new plan at the end, unless there is a position
  if (!referencePlan) {
    montageList.insertAdjacentHTML(
      "beforeend",
      `<li id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
      } href="#plan-${response.data.data.id}" >
    </a></li>`
    );
    sequencePreview.insertAdjacentHTML(
      "beforeend",
      `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
      }" data-strap-id="${response.data.data.id}"></article>`
    );
  } else {
    referencePlanLink.closest("li").insertAdjacentHTML(
      "afterend",
      `<li  id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
      } href="#plan-${response.data.data.id}" >
    </a></li>`
    );
    referencePlan.insertAdjacentHTML(
      "afterend",
      `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
      }" data-strap-id="${response.data.data.id}"></article>`
    );
  }
}

async function duplicatePlan(
  montageList,
  planToDuplicateId,
  sequenceId,
  select = true
) {
  // find the position of the plan in the listing
  let position;

  // get the element to find the positions
  let referencePlanLink = document.querySelector(".selected");
  let referencePlan = document.querySelector(".shown");
  if (!referencePlan) {
    //if no reference, add at the end
    position = { end: true };
  } else {
    position = { after: Number(referencePlan.dataset.strapId) };
  }
  if (select) {
    deselect(".selected");
    deselect(".shown");
  }

  // create a new plan and connect it right after the plan you’re ducplicating
  // 1. load the plan
  let data = {
    data: {
      sequence: sequenceId,
    },
  };

  // Create a plan and add it to the sequence number.
  const newPlanId = await axios
    .post(`${config.strapi.url}/api/plans/`, data)
    .then(async (response) => {
      // find the position of the plan
      //find the referencePlan: the one we’ll add to
      // define a position

      // move the block in the sequence
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

      await updateData(
        config.strapi.url,
        "sequences",
        updatedData,
        Number(sequenceNumber.textContent)
      );

      // insert the new plan at the end, unless there is a position
      if (!referencePlan) {
        montageList.insertAdjacentHTML(
          "beforeend",
          `<li  id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
          } href="#plan-${response.data.data.id}" >
    </a></li>`
        );
        sequencePreview.insertAdjacentHTML(
          "beforeend",
          `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
          }" data-strap-id="${response.data.data.id}"></article>`
        );
      } else {
        referencePlanLink.closest("li").insertAdjacentHTML(
          "afterend",
          `<li  id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
          } href="#plan-${response.data.data.id}" >
    </a></li>`
        );
        referencePlan.insertAdjacentHTML(
          "afterend",
          `<article class="${select ? "shown" : ""}" id="plan-${response.data.data.id
          }" data-strap-id="${response.data.data.id}"></article>`
        );
      }
      return response.data.data.id;
    });

  // console.log('new plan', newPlanId)

  // 2. load all object with filter of the previous plan ID,
  const objectsOfThePlan = await axios
    .get(
      `${config.strapi.url}/api/objects?populate=deep,5&filters[plan]=${planToDuplicateId}`
    )
    .then((response) => {
      return response;
    })
    .catch((err) => {
      console.log(err);
    });

  objectsOfThePlan.data.data.forEach(async (obj) => {
    let oldData = obj.attributes;
    let data = { ...oldData };
    data.plan = newPlanId;
    data.assets = [];

    //set assets
    for (let asset of oldData.assets.data) {
      data.assets.push(asset.id);
    }

    // Push the new objects ! /
    await axios
      .post(`${config.strapi.url}/api/objects`, { data })
      .then((response) => {
        console.log(response);
      })

      .catch((err) => {
        console.log(err);
      });
  });

  axios
    .get(`${config.strapi.url}/api/plans/${newPlanId}?populate=deep,5`)
    .then((response) => {
      let plan = response.data.data;
      let planToFill = preview.querySelector(`#plan-${plan.id}`);
      let objectsToFillWith = plan.attributes.objects.data;

      // // fill the asset manager with the images
      objectsToFillWith.forEach((object) => {
        object.attributes.assets.data.forEach((asset) => {
          planToFill.insertAdjacentHTML(
            "beforeend",
            `<img id="inuse-${plan.id}-${object.id}" data-objectId="${object.id
            }" data-planid="${plan.id}"
        data-assetid="${asset.id}" src="${asset.attributes.location
            }" class="asset" style="${object.attributes.width ? `width:${object.attributes.width}` : ""
            }
        ${object.attributes.height ? `height:${object.attributes.height}` : ""}
        ${object.attributes.top ? `top:${object.attributes.top}` : ""}
        ${object.attributes.left ? `left:${object.attributes.left}` : ""}" >`
          );
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

// render a plan when loading up the app
function renderPlan(plan, montageList, sequencePreview, select = false) {
  let previewedPlan = document.createElement(`article`);
  previewedPlan.id = `plan-${plan.id}`;
  previewedPlan.insertAdjacentHTML(
    "afterbegin",
    `<span class="plan-name">${plan.attributes.order}</span>`
  );

  // insert a link to the plan in the montage panel
  montageList.insertAdjacentHTML(
    "beforeend",
    `<li  id="link-${plan.id}"><a class="${select ? "selected" : ""
    }" href="#plan-${plan.id}"> 

  </a></li>`
  );

  // insert the plan in the preview plan
  sequencePreview.insertAdjacentHTML(
    "beforeend",
    `<article data-strap-id=${plan.id} class="${select ? "shown" : ""
    }" id="plan-${plan.id}">
    </article>`
  );

}

// move plan using drag and drop

export {
  addPlan,
  deletePlan,
  deleteAllPlans,
  duplicatePlan,
  selectLink,
  renderPlan,
  dragAndPlanReorder,
};

import { deselect, selectLink, activatePlan } from "./helpers.js";
import config from "../config/config.js";
import { sequenceNumber, sequencePreview } from "./selectors.js";
import { createData, updateData } from "./dataManagement.js";
import axios from "axios";
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
  //
  //find the referencePlan: the one we’ll add to

  // define a position
  //
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
  console.log("referencePlan", referencePlan);
  console.log("position", position);

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

  // console.log(response)

  console.log("response", response.data.data.id);

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

  updateData

  await updateData(
    config.strapi.url,
    "sequences",
    updatedData,
    Number(sequenceNumber.textContent),
  );

  //reorder the sequence
  //

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
      `<li id="link-${response.data.data.id}"><a class=${select ? "selected" : ""
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

async function duplicatePlan(montageList, planToDuplicateId, sequenceId) {
  // create a new plan and connect it right after the plan you’re ducplicating
  // 1. load the plan

  let data = {
    data: {
      sequence: sequenceId,
    },
  };

  //  1.b create a plan based on the loading plan, and select it.
  const newPlanId = await axios
    .post(`${config.strapi.url}/api/plans/`, data)
    .then((response) => {
      let oldplan = document.querySelector(".shown");

      deselect(".selected");
      deselect(".shown");

      montageList.insertAdjacentHTML(
        "beforeend",
        `<li id="link-${response.data.data.id}"><a class='selected' href="#plan-${response.data.data.id}" > </a></li>`
      );

      sequencePreview.insertAdjacentHTML(
        "beforeend",
        `<article class="shown" id="plan-${response.data.data.id}" data-strap-id="${response.data.data.id}"></article>`
      );
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
      .then((response) => { })

      .catch((err) => {
        console.log(err);
      });
  });
  console.log(newPlanId);
  axios
    .get(`${config.strapi.url}/api/plans/${newPlanId}?populate=deep,5`)
    .then((response) => {
      let plan = response.data.data;
      let planToFill = preview.querySelector(`#plan-${plan.id}`);
      let objectsToFillWith = plan.attributes.objects.data;
      // console.log(objectsToFillWith)
      //
      // // fill the asset manager with the images
      objectsToFillWith.forEach((object) => {
        // console.log(object)

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
  console.log(plan);
  let previewedPlan = document.createElement(`article`);
  previewedPlan.id = `plan-${plan.id}`;
  previewedPlan.insertAdjacentHTML(
    "afterbegin",
    `<span class="plan-name">${plan.attributes.order}</span>`
  );

  // insert a link to the plan in the montage panel
  montageList.insertAdjacentHTML(
    "beforeend",
    `<li id="link-${plan.id}"><a class="${select ? "selected" : ""
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

export {
  addPlan,
  deletePlan,
  deleteAllPlans,
  duplicatePlan,
  selectLink,
  renderPlan,
};

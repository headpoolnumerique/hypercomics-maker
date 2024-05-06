import config from "../config/config.js";
import { loadSingle, createData } from "../modules/dataManagement.js";

const toc = document.querySelector("#sequence-toc");
const story = document.querySelector("#story");

async function generateStory() {
  // get the story number from the url
  let seqnum = getSequenceNumberFromUrl(window.location);

  // get the data for the sequence
  // for now, seqnum.projectID is not used. but it would be quite nice to have them managed from the top bar
  let sequencedata = await loadProject(
    config.strapi.url,
    seqnum.projectId,
    seqnum.sequenceId,
  );

  // get the data for the plans (with the weirdest ui from strapi. maybe filtering would make more sense.)
  const plans = sequencedata.data.data.attributes.plans.data;
  let firstPlan = renderPlans(plans, toc, story);

  // show the first plan
  window.location.hash = firstPlan;
}

function getSequenceNumberFromUrl(url) {
  let sequenceUrl = new URL(url);
  const projectId = sequenceUrl.searchParams.get("project");
  const sequenceId = sequenceUrl.searchParams.get("sequence");
  return { sequenceId, projectId };
}

async function loadProject(apiUrl, projectId, sequenceId) {
  // for now only use the sequenceID from the api
  return await loadSingle(apiUrl, "sequences", sequenceId);
}

function fillPlan(plan) {
  console.log(`fill the plan ${plan.id} on load from the objects`);

  // fill the plan with all the existing images
  // find the plan
  let planToFill = story.querySelector(`#plan-${plan.id}`);
  let objectsToFillWith = plan.attributes.objects?.data;
  // console.log(plan.attributes, objectsToFillWith);

  // // fill the asset manager with the images
  objectsToFillWith.forEach((object) => {
    // console.log(object)

    object.attributes.assets.data.forEach((asset) => {
      planToFill.insertAdjacentHTML(
        "beforeend",
        `<img 
        id="inuse-${plan.id.replace("#", "")}-${object.id}" 
        data-objectId="${object.id}" data-planid="${plan.id}"
        data.verticalAnchor ="${object.attributes.verticalAnchor ?object.attributes.verticalAnchor : "top" }"
        data.horizontalAnchor ="${object.attributes.horizontalAnchor ?object.attributes.horizontalAnchor : "left" }"

        data-assetid="${asset.id}" src="${
          asset.attributes.location
        }" class="asset"
        style="${
          object.attributes.width ? `width:${object.attributes.width}` : ""
        }
        ${object.attributes.height ? `height:${object.attributes.height}` : ""}
        ${object.attributes.top ? `top:${object.attributes.top}` : ""}
        ${object.attributes.left ? `left:${object.attributes.left}` : ""}" >`,
      );
    });
  });
}
//
//

function renderPlans(plans, toc, story) {
  let firstPlan = "";
  plans.forEach((plan, index) => {
    if (index === 0) {
      firstPlan = `#plan-${plan.id}`;
    }
    let newPlan = document.createElement(`article`);
    newPlan.classList.add("plan");
    newPlan.id = `plan-${plan.id}`;

    const previousPlan = plans[index - 1]
      ? `#plan-${plans[index - 1].id}`
      : false;
    const nextPlan = plans[index + 1] ? `#plan-${plans[index + 1].id}` : false;

    // insert a link to the plan in the montage panel
    toc.insertAdjacentHTML(
      "beforeend",
      `<li ${index == 0 ? `class="selected"` : ""} id="link-${
        plan.id
      }"><a class="" href="#plan-${plan.id}">${index + 1}</a></li>`,
    );

    // insert the plan in the preview plan
    story.insertAdjacentHTML(
      "beforeend",
      `<article ${
        plan.attributes.delay
          ? `data-story-delay="${plan.attributes.delay}"`
          : ""
      } data-strap-id="${plan.id}" class="plan" id="plan-${plan.id}">
        ${
          previousPlan
            ? `<a class="previousPlan" href="${previousPlan}">←</a>`
            : ""
        }
        ${nextPlan ? `<a class="nextPlan" href="${nextPlan}">→</a>` : ""}

    </article>`,
    );
    fillPlan(plan);
  });

  return firstPlan;
}
export { generateStory };

import config from "../config/config.js";
import { loadSingle, createData } from "../modules/dataManagement.js";
import { loadStylesForPreview } from "./loadstyles.js";

const toc = document.querySelector("#sequence-toc");
const story = document.querySelector("#story");
const ratioElement = document.querySelector("#ratioElement");

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

  let arrayRatios = loadStylesForPreview(
    sequencedata.data.data.attributes.stylesheets.data,
  );

  // check the ratio on the screen
  screenSizeManipulation(story, arrayRatios);

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
        id="inuse-${plan.id}-${object.id}" 
        data-objectId="${object.id}" data-planid="${plan.id}"
        data.verticalAnchor ="${object.attributes.verticalAnchor ? object.attributes.verticalAnchor : "top"}"
        data.horizontalAnchor ="${object.attributes.horizontalAnchor ? object.attributes.horizontalAnchor : "left"}"
        data-assetid="${asset.id}" src="${asset.attributes.location}" class="asset">`,
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

/*
 * existingRatios: type array
 * */

export function screenSizeManipulation(story, existingRatios) {
  // change screen at startup
  changeScreenSize(existingRatios);

  window.addEventListener("resize", function () {
    changeScreenSize(existingRatios);
  });
}

function changeScreenSize(existingRatios) {
  // 1. Get the browser ratio (width/height)
  let browserWidth = window.innerWidth;
  let browserHeight = window.innerHeight;
  let browserRatio = browserWidth / browserHeight; // This is the browser ratio

  // 2. Store the ratio in a variable
  let ratio = browserRatio;

  // 3. Create an array with some predefined ratios

  // 4. Get the element with the ID of 'story'

  // 5. Choose the closest value from the array based on the ratio
  let closestValue = existingRatios.reduce((prev, curr) => {
    return Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev;
  });

  // 6. Determine new width and height for the #story element
  if (browserWidth / closestValue <= browserHeight) {
    // Width is the limiting factor
    let newHeight = browserWidth / closestValue;
    story.style.width = browserWidth - 200 + "px";
    story.style.height = newHeight - 200 + "px";
  } else {
    // Height is the limiting factor
    let newWidth = browserHeight * closestValue;
    story.style.width = newWidth - 200 + "px";
    story.style.height = browserHeight - 200 + "px";
  }

  ratioElement.innerHTML = `${ratio} (used: ${closestValue})`;
}

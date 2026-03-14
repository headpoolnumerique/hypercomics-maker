import config from "../config/config.js";
import { loadSequenceData } from "../modules/dataManagement.js";
import { loadStylesForPreview } from "./loadstyles.js";

const toc = document.querySelector("#sequence-toc");
const story = document.querySelector("#story");
const ratioElement = document.querySelector("#ratioElement");

export async function generateStory() {
  // get the story number from the url
  let seqnum = getSequenceNumberFromUrl(window.location);

  // get the data for the sequence
  // for now, seqnum.projectID is not used. but it would be quite nice to have them managed from the top bar
  let sequencedata = await loadProject(
    config.strapi.url,
    seqnum.projectId,
    seqnum.sequenceId,
  );
  // console.log(sequencedata);

  console.log(sequencedata.data[0].stylesheets);
  let arrayRatios = loadStylesForPreview(sequencedata.data[0].stylesheets);

  // check the ratio on the screen
  screenSizeManipulation(story, arrayRatios);

  // get the data for the plans (with the weirdest ui from strapi. maybe filtering would make more sense.)
  const plans = sequencedata.data[0].plans;

  let firstPlan = renderPlans(plans, toc, story, sequencedata.data[0].assets);

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
  return await loadSequenceData(apiUrl, sequenceId);
}

//fill plan
function fillPlan(plan, assets) {
  // fill the plan with all the existing images
  let planToFill = story.querySelector(`#plan-${plan.documentId}`);
  let objectsToFillWith = plan.objects;

  // Loop through each object that needs to be filled into the plan
  objectsToFillWith.forEach((object) => {
    // Check if the object has already been added to the plan
    if (
      planToFill.querySelector(`#inuse-${plan.documentId}-${object.documentId}`)
    ) {
      return; // Skip adding if the object is already present
    }

    // Find the corresponding asset for the object
    let foundasset = object.assets[0];
    // If no asset was found, log "nothing" and return
    if (!foundasset) {
      return console.log("nothing found for object:", object.documentId);
    }

    // Insert the image into the plan if the asset is found
    planToFill.insertAdjacentHTML(
      "beforeend",
      `<img id="inuse-${plan.documentId}-${object.documentId}" data-objectId="${object.documentId}" 
      data-planid="${plan.documentId}" data-assetid="${foundasset.documentId}" 
      src="${foundasset.location}" class="asset">`,
    );
  });
}

function renderPlans(plans, toc, story, assets) {
  let firstPlan = "";
  plans.forEach((plan, index) => {
    if (index === 0) {
      firstPlan = `#plan-${plan.documentId}`;
    }
    let newPlan = document.createElement(`article`);
    newPlan.classList.add("plan");
    newPlan.documentId = `plan-${plan.documentId}`;

    const previousPlan = plans[index - 1]
      ? `#plan-${plans[index - 1].documentId}`
      : false;
    const nextPlan = plans[index + 1]
      ? `#plan-${plans[index + 1].documentId}`
      : false;

    // insert a link to the plan in the montage panel
    toc.insertAdjacentHTML(
      "beforeend",
      `<li ${index == 0 ? `class="selected"` : ""} id="link-${
        plan.documentId
      }"><a class="" href="#plan-${plan.documentId}">${index + 1}</a></li>`,
    );

    // insert the plan in the preview plan
    story.insertAdjacentHTML(
      "beforeend",
      `<article ${
        plan.delay ? `data-story-delay="${plan.delay}"` : ""
      } data-strap-id="${plan.documentId}" class="plan" id="plan-${plan.documentId}">
        ${
          previousPlan
            ? `<a class="previousPlan" href="${previousPlan}">←</a>`
            : ""
        }
        ${nextPlan ? `<a class="nextPlan" href="${nextPlan}">→</a>` : ""}

    </article>`,
    );
    fillPlan(plan, assets);
  });

  return firstPlan;
}

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
  let browserWidth = window.innerWidth;
  let browserHeight = window.innerHeight;
  let browserRatio = browserWidth / browserHeight;

  // Safety check: make sure existingRatios is sorted from highest to lowest
  existingRatios.sort((a, b) => b - a);

  if (existingRatios.length > 1) {
    let validRatios = existingRatios.filter((r) => r <= browserRatio);

    // Choose the closest ratio that fits in the browser
    let closestValue =
      validRatios.length > 0
        ? Math.max(...validRatios)
        : existingRatios[existingRatios.length - 1]; // fallback to smallest

    // Try fitting by width
    let tempHeight = browserWidth / closestValue;

    if (tempHeight <= browserHeight) {
      // Width is limiting factor
      story.style.width = browserWidth - 96 + "px";
      story.style.height = (browserWidth - 96) / closestValue + "px";
    } else {
      // Height is limiting factor
      story.style.height = browserHeight - 96 + "px";
      story.style.width = (browserHeight - 96) * closestValue + "px";
    }

    // Optional: Show ratio info
    let finalWidth = parseFloat(story.style.width);
    let finalHeight = parseFloat(story.style.height);
    let actualRatio = finalWidth / finalHeight;

    ratioElement.innerHTML = `browser-ratio: ${browserRatio.toFixed(4)} | used: ${closestValue} | story ratio: ${actualRatio.toFixed(4)}`;
  }
}

function fillPlanWithAssets(plan, assets) {
  let planToFill = preview.querySelector(`#plan-${plan.documentId}`);
  let objectsToFillWith = plan.objects?.data;

  objectsToFillWith.forEach((object) => {
    // Check if the object has already been added to the plan
    if (
      planToFill.querySelector(`#inuse-${plan.documentId}-${object.documentId}`)
    ) {
      return; // Skip adding if the object is already present
    }

    // Find the corresponding asset for the object
    let foundasset;
    assets.data.forEach((a) => {
      a.objects.data.forEach((obj) => {
        if (obj.documentId == object.documentId) {
          foundasset = a;
        }
      });
    });

    if (!foundasset) return;

    // Add the image to the plan if the object is not already added
    planToFill.insertAdjacentHTML(
      "beforeend",
      `<img id="inuse-${plan.documentId}-${object.documentId}" data-objectId="${object.documentId}" 
        data-planid="${plan.documentId}" data-assetid="${foundasset.documentId}" 
        src="${foundasset.location}" class="asset">`,
    );

    // Hide loading indicator if all objects are filled
    document.querySelector("#loading")?.classList.add("hide");
  });
}

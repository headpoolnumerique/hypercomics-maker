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

  let arrayRatios = loadStylesForPreview(
    sequencedata.data.data.attributes.stylesheets.data,
  );

  // check the ratio on the screen
  screenSizeManipulation(story, arrayRatios);

  // get the data for the plans (with the weirdest ui from strapi. maybe filtering would make more sense.)
  const plans = sequencedata.data.data.attributes.plans.data;

  console.log("down sa mère", sequencedata.data.data.attributes.assets);

  let firstPlan = renderPlans(
    plans,
    toc,
    story,
    sequencedata.data.data.attributes.assets,
  );

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
  let planToFill = story.querySelector(`#plan-${plan.id}`);
  let objectsToFillWith = plan.attributes.objects?.data;

  // Loop through each object that needs to be filled into the plan
  objectsToFillWith.forEach((object) => {
    // Check if the object has already been added to the plan
    if (planToFill.querySelector(`#inuse-${plan.id}-${object.id}`)) {
      return; // Skip adding if the object is already present
    }

    // Find the corresponding asset for the object
    let foundasset;
    assets.data.forEach((a) => {
      a.attributes.objects?.data.forEach((obj) => {
        // If the object ID matches, set the found asset
        if (obj.id === object.id) {
          foundasset = a;
        }
      });
    });

    // If no asset was found, log "nothing" and return
    if (!foundasset) {
      return console.log("nothing found for object:", object.id);
    }

    // Insert the image into the plan if the asset is found
    planToFill.insertAdjacentHTML(
      "beforeend",
      `<img id="inuse-${plan.id}-${object.id}" data-objectId="${object.id}" 
      data-planid="${plan.id}" data-assetid="${foundasset.id}" 
      src="${foundasset.attributes.location}" class="asset">`,
    );
  });
}

function renderPlans(plans, toc, story, assets) {
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
  let planToFill = preview.querySelector(`#plan-${plan.id}`);
  let objectsToFillWith = plan.attributes.objects?.data;

  objectsToFillWith.forEach((object) => {
    // Check if the object has already been added to the plan
    if (planToFill.querySelector(`#inuse-${plan.id}-${object.id}`)) {
      return; // Skip adding if the object is already present
    }

    // Find the corresponding asset for the object
    let foundasset;
    assets.data.forEach((a) => {
      a.attributes.objects.data.forEach((obj) => {
        if (obj.id == object.id) {
          foundasset = a;
        }
      });
    });

    if (!foundasset) return;

    // Add the image to the plan if the object is not already added
    planToFill.insertAdjacentHTML(
      "beforeend",
      `<img id="inuse-${plan.id}-${object.id}" data-objectId="${object.id}" 
        data-planid="${plan.id}" data-assetid="${foundasset.id}" 
        src="${foundasset.attributes.location}" class="asset">`,
    );

    // Hide loading indicator if all objects are filled
    document.querySelector("#loading")?.classList.add("hide");
  });
}

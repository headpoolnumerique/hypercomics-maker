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

function fillPlan(plan, assets) {
  // fill the plan with all the existing images
  // find the plan
  let planToFill = story.querySelector(`#plan-${plan.id}`);
  // let objectsToFillWith = plan.attributes.objects?.data;
  //
  let objectsToFillWith = plan.attributes.objects?.data;
  // console.log("obj", objectsToFillWith);
  // // fill the asset manager with the images
  objectsToFillWith.forEach((object) => {
    // Check if the asset's objects.data contains an object with the same id
    let foundasset;
    assets.data.forEach((a) => {
      a.attributes.objects?.data.forEach((obj) => {
        if (obj.id == object.id) {
          // console.log("obj", obj.id);
          foundasset = a;
        }
      });

      // console.log("foundasset", foundasset);
      if (!foundasset) return;
      // console.log(plan.attributes, objectsToFillWith);

      planToFill.insertAdjacentHTML(
        "beforeend",
        `<img id="inuse-${plan.id}-${object.id}" data-objectId="${
          object.id
        }" data-planid="${plan.id}"
        data-assetid="${foundasset.id}" src="${foundasset.attributes.location}"
        class= "asset" >`,
      );
    });
  });
}

//
//

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
  // 1. Get the browser ratio (width/height)
  let browserWidth = window.innerWidth;
  let browserHeight = window.innerHeight;
  let browserRatio = browserWidth / browserHeight; // This is the browser ratio

  // 2. Store the ratio in a variable
  let ratio = browserRatio;

  // 5. Choose the closest value from the array based on the ratio
  if (existingRatios.length > 1) {
    let validRatios = existingRatios.filter((r) => r <= ratio);

    let closestValue = Math.max(...validRatios);

    // use the first ratio if you’re smaller than any existing ratio
    if (validRatios.length < 1) {
      closestValue = existingRatios[existingRatios.length - 1];
    }

    if (browserWidth / closestValue <= browserHeight) {
      // let closestValue = existingRatios.reduce((prev, curr) => {
      //   return Math.abs(curr - ratio) < Math.abs(prev - ratio) ? curr : prev;
      // });

      // 6. Determine new width and height for the #story element
      // Width is the limiting factor
      let newHeight = browserWidth / closestValue;
      story.style.width = browserWidth - 96 + "px";
      story.style.height = newHeight - 96 + "px";
    } else {
      // Height is the limiting factor
      let newWidth = browserHeight * closestValue;
      story.style.width = newWidth - 96 + "px";
      story.style.height = browserHeight - 96 + "px";
    }
    ratioElement.innerHTML = `browser-ratio:${ratio} (used: ${closestValue},  ratio du cadre: ${parseFloat(story.offsetWidth) / parseFloat(story.offsetHeight)})`;
  }
}

function fillPlanWithAssets(plan, assets) {
  // console.log(`fill the plan ${plan.id} on load from the objects`);
  let planToFill = preview.querySelector(`#plan-${plan.id}`);
  let objectsToFillWith = plan.attributes.objects?.data;
  // // fill the asset manager with the images
  objectsToFillWith.forEach((object) => {
    // Check if the asset's objects.data contains an object with the same id
    let foundasset;
    assets.data.forEach((a) => {
      a.attributes.objects.data.forEach((obj) => {
        if (obj.id == object.id) {
          foundasset = a;
        }
      });
    });
    // console.log(a.attributes.objects.data);
    // (obj) => obj.id === object.id,

    if (!foundasset) return;
    //check if asset is top or bottom
    planToFill.insertAdjacentHTML(
      "beforeend",
      `<img id="inuse-${plan.id}-${object.id}" data-objectId="${
        object.id
      }" data-planid="${plan.id}"
        data-assetid="${foundasset.id}" src="${foundasset.attributes.location}"
        class= "asset" >`,
    );
    document.querySelector("#loading")?.classList.add("hide");
  });
}

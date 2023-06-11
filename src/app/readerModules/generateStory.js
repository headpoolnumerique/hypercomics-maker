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
    seqnum.sequenceId
  );

  // get the data for the plans (with the weirdest ui from strapi. maybe filtering would make more sense.)
  const plans = sequencedata.data.data.attributes.plans.data;
  let firstPlan = renderPlans(plans, toc, story);
  window.location.hash = firstPlan;
  // create a preview
  // put all the plan in the preview
  // create a toc with link
  // use css to show / hide :target
  // import image
  // import css
  //
}

function getSequenceNumberFromUrl(url) {
  let sequenceUrl = new URL(url);
  const projectId = sequenceUrl.searchParams.get("project");
  const sequenceId = sequenceUrl.searchParams.get("sequence");
  return { sequenceId, projectId };
  // then use the project id and the sequence id to generate the pages
}

async function loadProject(apiUrl, projectId, sequenceId) {
  // for now only use the sequenceID from the api
  return await loadSingle(apiUrl, "sequences", sequenceId);
}

// fill the sequence with all the plans, and for each plan, fill it with the assets, and object
async function fillSequence(plans) {
  //create the plan
  plans.data.forEach((plan, index) => {
    console.log("renderPlan", plan);
    renderPlan(
      plan,
      montageList,
      sequencePreview,
      index + 1 == plans.data.length ? true : false
    );
    fillPlan(plan);
  });
}

// async function startup(url = document.location.href) {
//     fillSequence(response.data.data.id);
//     document.querySelector(".plan").classList.add("shown");
//   }
// }
//
//
function fillPlan(plan) {
  console.log(`fill the plan ${plan.id} on load from the objects`);

  // fill the plan with all the existing images
  // find the plan
  let planToFill = story.querySelector(`#plan-${plan.id}`);
  let objectsToFillWith = plan.attributes.objects?.data;
  console.log(plan.attributes, objectsToFillWith);

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

    const previousPlan = plans[index - 1] ? `#plan-${plans[index - 1].id}` : false;
    const nextPlan = plans[index + 1] ? `#plan-${plans[index + 1].id}` : false;

    // insert a link to the plan in the montage panel
    toc.insertAdjacentHTML(
      "beforeend",
      `<li id="link-${plan.id}"><a class="" href="#plan-${plan.id}"></a></li>`
    );

    // insert the plan in the preview plan
    story.insertAdjacentHTML(
      "beforeend",
      `<article data-strap-id=${plan.id} class="plan" id="plan-${plan.id}">
        ${previousPlan ? `<a href="${previousPlan}"> <- </a>` : ""}
        ${nextPlan ? `<a href="${nextPlan}"> -> </a>` : ""}

    </article>`
    );
    fillPlan(plan);
  });

  return firstPlan;
}
export { generateStory };

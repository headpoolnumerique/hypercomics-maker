import config from "../config/config.js";
import { loadSingle, createData } from "./dataManagement.js";
import { addPlan, dragAndPlanReorder, renderPlan } from "./montage.js";
import {
  layerList,
  montageList,
  sequenceNumber,
  sequencePreview,
} from "./selectors.js";
import { addAssetToTheAssetManager } from "./assetManager";
import {
  moveToolbars,
  resizeMontagePaneVertically,
  toggleToolbars,
} from "./toolbarsManipulations.js";
import {
  layerInteract,
  reorderLayer,
  updateLayers,
} from "./layerManipulation.js";
import { handleDelays } from "./delay.js";
import { updatefromui } from "./objectManipulations";
import { stylesheetmanager } from "./stylesheet.js";
import { setAnchor } from "./assetManipulation.js";

async function startup(url = document.location.href) {
  // use parameters to define the url of the project
  // url =  server.com/?sequence=SEQID&project=projectid
  // find what to load here
  let sequenceUrl = new URL(url);
  const sequenceId = sequenceUrl.searchParams.get("sequence");
  document.body.id = `sequence-${sequenceId}`;

  // then load the sequence
  let response = await loadSingle(config.strapi.url, `sequences`, sequenceId);

  // console.log(response);
  updateSequenceMeta(
    response.data?.data?.id,
    response.data?.data?.attributes?.title,
  );

  fillSequence(response.data.data.attributes.plans);
  moveToolbars();
  toggleToolbars();
  dragAndPlanReorder(montageList, sequenceNumber);
  reorderLayer(layerList);
  layerInteract();
  resizeMontagePaneVertically();
  handleDelays();
  setAnchor();
  updatefromui();
  await stylesheetmanager(response.data);
}

async function fillSequence(plans) {
  // let response = await loadSingle(config.strapi.url, "sequences", sequence);
  // let plans = response.data.data.attributes.plans;
  //if there is no plan, create a plan
  if (plans.data.length < 1) {
    addPlan(montageList, sequence);
  }
  //create the plan
  plans.data.forEach(async (plan, index) => {
    // console.log("renderPlan", plan);
    await renderPlan(
      plan,
      montageList,
      sequencePreview,
      index + 1 == plans.data.length ? true : false,
    );
    await fillPlan(plan);
    updateLayers();
  });
  // check for each plan. add them to the view
}

async function updateSequenceMeta(id, title) {
  const meta = {
    projectName: document.querySelector("#projectName"),
    sequenceNumber: document.querySelector("#sequenceNumber"),
  };
  meta.projectName.innerHTML = title;
  meta.sequenceNumber.innerHTML = id;
}

async function fillPlan(plan) {
  // console.log(`fill the plan ${plan.id} on load from the objects`);

  // fill the plan with all the existing images
  // find the plan
  let planToFill = preview.querySelector(`#plan-${plan.id}`);
  let objectsToFillWith = plan.attributes.objects?.data;
  // console.log(plan.attributes, objectsToFillWith);

  // // fill the asset manager with the images
  objectsToFillWith.forEach((object) => {
    // console.log(object)

    object.attributes.assets.data.forEach((asset) => {
      addAssetToTheAssetManager(
        asset.attributes.location,
        asset.id,
        asset.attributes.filename,
        document.querySelector("#assetsList"),
      );
      //check if asset is top or bottom

      planToFill.insertAdjacentHTML(
        "beforeend",
        `<img id="inuse-${plan.id}-${object.id}" data-objectId="${
          object.id
        }" data-planid="${plan.id}"
        data-assetid="${asset.id}" src="${asset.attributes.location}"
        data-anchor-horizontal="${
          asset.attributes.anchorVertical
            ? asset.attributes.anchorVertical
            : "left"
        }" 
        data-anchor-vertical="${
          asset.attributes.anchorHorizontal
            ? asset.attributes.anchorHorizontal
            : "top"
        }"
        class= "asset" style = " " >`,

      );
    });
  });

  document.querySelector("#loading")?.remove();
}

export { startup, fillPlan };

// function parseStylesheet(stylesheet) {
//   cssContent.textContent = stylesheet;
//   let styles = parse(stylesheet);
// }

function updateStylesheet(stylesheet, object, rules) {
  let styles = parse(stylesheet);
  // get the value for the selector
  let ruleToUpdate = parsedCSS.stylesheet.rules.filter((a) => {
    // return the stylesheet without the inuse block;
    return !a.selectors.includes(object.id);
  });
  ruleToUpdate.push({
    type: "rule",
    selectors: [`#${object.id}`],
    declarations: [
      {
        type: "declaration",
        property: "height",
        value: `${object.style.height}`,
      },
      {
        type: "declaration",
        property: "width",
        value: `${object.style.width}`,
      },
      {
        type: "declaration",
        property: "top",
        value: `${object.style.top ? object.style.top : "unset"}`,
      },
      {
        type: "declaration",
        property: "bottom",
        value: `${object.style.bottom ? object.style.bottom : "unset"}`,
      },
      {
        type: "declaration",
        property: "left",
        value: `${object.style.left ? object.style.left : "unset"}`,
      },
      {
        type: "declaration",
        property: "right",
        value: `${object.style.right ? object.style.right : "unset"}`,
      },
    ],
  });
  return stringify(styles);

  // update the rules
  // return the updated stylesheet
}

import config from "../config/config.js";
import { loadSingle, createData } from "./dataManagement.js";
import { addPlan, dragAndPlanReorder, renderPlan } from "./montage.js";
import {
  buttonShowGrid,
  layerList,
  montageList,
  sequenceNumber,
  sequencePreview,
} from "./selectors.js";
import {
  addAssetToTheAssetManager,
  addUnusedAssetToTheAssetManager,
  liveSearch,
  removeAsset,
} from "./assetManager";
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
import { handleVisilibity, updatefromui } from "./objectManipulations";
import { setPropertyInStylesheet, stylesheetmanager } from "./stylesheet.js";
import { deleteObject, setAnchor } from "./assetManipulation.js";

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
  //
  updateSequenceMeta(
    response.data?.data?.id,
    response.data?.data?.attributes?.title,
    response.data?.data?.attributes.project.data.attributes.author,
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
  handleVisilibity();

  await addUnusedAssetToTheAssetManager(response.data);
  await stylesheetmanager(response.data);

  document
    .querySelector("#deleteObject")
    .addEventListener("click", deleteObject);

  //filters to put in their own function
  document.querySelector("#filterreset").addEventListener("click", (e) => {
    document.querySelector("#assetsFilter").value = "";
    liveSearch();
  });
  document.querySelector("#assetsFilter").addEventListener("change", (e) => {
    liveSearch();
  });

  // remove asset from a button
  window.removeAsset = removeAsset;
}

export function toggleGrid() {
  buttonShowGrid.addEventListener("click", () => {
    previewScreen.classList.toggle("show-grid");
  });
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

async function updateSequenceMeta(id, title, authorname) {
  const meta = {
    projectName: document.querySelector("#projectName"),
    sequenceNumber: document.querySelector("#sequenceNumber"),
    authorname: document.querySelector("#authorName"),
  };
  meta.sequenceNumber.innerHTML = id;
  meta.projectName.innerHTML = title;
  meta.authorname.innerHTML = authorname;
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
        class= "asset" >`,
      );
    });
  });

  document.querySelector("#loading")?.classList.add("hide");
}

export { startup, fillPlan };

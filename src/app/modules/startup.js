import config from "../config/config.js";
import { loadSingle, createData, loadSequenceData } from "./dataManagement.js";
import { addPlan, dragAndPlanReorder, renderPlan } from "./montage.js";
import {
  buttonShowGrid,
  layerList,
  montageList,
  previewScreen,
  sequenceNumber,
  sequencePreview,
} from "./selectors.js";
import {
  sortAssets,
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
  //
  // what if we load the sequence, then the
  //

  // console.log(stuff);
  // debugger;
  // let response = await loadSingle(config.strapi.url, `sequences`, sequenceId);

  let response = await loadSequenceData(config.strapi.url, sequenceId);

  //
  //
  //
  updateSequenceMeta(
    response.data?.data?.id,
    response.data?.data?.attributes?.title,
    response.data?.data?.attributes.project.data.attributes.author,
  );

  fillSequence(
    response.data.data.attributes.plans,
    response.data.data.attributes.assets,
  );
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

  toggleGrid();

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

  sortAssets();
  // remove asset from a button
  window.removeAsset = removeAsset;
}

export function toggleGrid() {
  buttonShowGrid.addEventListener("click", () => {
    previewScreen.classList.toggle("show-grid");
  });
}

async function fillSequence(plans, assets) {
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
    await fillPlan(plan, assets);
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

function fillPlan(plan, assets) {
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
          console.log("fang");
          foundasset = a;
        }
      });
    });
    // console.log(a.attributes.objects.data);
    // (obj) => obj.id === object.id,

    console.log(foundasset);
    if (!foundasset) return;
    addAssetToTheAssetManager(
      foundasset.attributes.location,
      foundasset.id,
      foundasset.attributes.filename,
      foundasset.attributes.createdAt,

      document.querySelector("#assetsList"),
    );
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

export { startup, fillPlan };

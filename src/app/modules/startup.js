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

  // debugger;
  // let response = await loadSingle(config.strapi.url, `sequences`, sequenceId);
  //

  let response = await loadSequenceData(config.strapi.url, sequenceId);

  // sequence data in an object

  let seqData = response.data[0];

  updateSequenceMeta(seqData.id, seqData.title, seqData.author);

  //seqDataClean
  let newData = cleanData(seqData);

  fillSequence(seqData.plans, seqData.assets);
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
  if (plans.length < 1) {
    addPlan(montageList, sequence);
  }
  //create the plan
  plans.forEach(async (plan, index) => {
    await renderPlan(
      plan,
      montageList,
      sequencePreview,
      index + 1 == plans.length ? true : false,
    );

    //let’s try to move things around

    fillPlan(plan, assets);
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
  let planToFill = preview.querySelector(`#plan-${plan.id}`);

  let objectsToFillWith = plan.objects;

  // // fill the asset manager with the images

  objectsToFillWith.forEach((object) => {
    // Check if the asset's objects.data contains an object with the same id
    let foundasset;

    console.log(object);

    assets.forEach((a) => {
      if (a.id == object.id) {
        foundasset = a;
      }
    });

    console.foundasset;

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

function cleanData(seqData) {
  let newData = seqData;

  // rebuild the data in here i think it’s eqasier

  // seqData.plans.forEach((plan) => {
  //
  //
  //
  //   console.log(plan.id);
  //   seqData.objects.forEach((obj) => {
  //     console.log(obj.id);
  //   });
  // });
  return newData;
}

export { startup, fillPlan };

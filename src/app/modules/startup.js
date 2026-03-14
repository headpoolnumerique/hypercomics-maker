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
  document.body.documentId = `sequence-${sequenceId}`;

  // then load the sequence
  // what if we load the sequence, then the

  // debugger;
  // let response = await loadSingle(config.strapi.url, `sequences`, sequenceId);
  //

  let response = await loadSequenceData(config.strapi.url, sequenceId);

  // sequence data in an object

  let seqData = response.data[0];

  updateSequenceMeta(seqData.documentId, seqData.title, seqData.author);

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

  addUnusedAssetToTheAssetManager(response.data);

  await stylesheetmanager(response.data[0].stylesheets);

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
  const planToFill = preview.querySelector(`#plan-${plan.documentId}`);
  if (!planToFill) return;

  const assetsList = document.querySelector("#assetsList");

  plan.objects.forEach((object) => {
    const foundasset = assets.find((a) => {
      return a.documentId == object.assets[0].documentId;
    });

    if (!foundasset) return;

    addAssetToTheAssetManager(
      foundasset.location,
      foundasset.documentId,
      foundasset.filename,
      foundasset.createdAt,
      assetsList,
    );

    planToFill.insertAdjacentHTML(
      "beforeend",
      `<img id="inuse-${plan.documentId}-${object.documentId}"
        data-objectId="${object.documentId}"
        data-planid="${plan.documentId}"
        data-assetid="${foundasset.documentId}"
        src="${foundasset.location}"
        class="asset">`,
    );
  });

  document.querySelector("#loading")?.classList.add("hide");
}

function cleanData(seqData) {
  let newData = seqData;

  // rebuild the data in here i think it’s eqasier

  // seqData.plans.forEach((plan) => {
  //
  //
  //
  //   seqData.objects.forEach((obj) => {
  //     console.log(obj.documentId);
  //   });
  // });
  return newData;
}

export { startup, fillPlan };

import config from "../config/config.js";
import { loadSingle, createData } from "./dataManagement.js";
import { addPlan, dragAndPlanReorder, renderPlan } from "./montage.js";
import {
  layerList,
  montageList,
  previewScreen,
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
import { getSize, setAnchor } from "./resize.js";
import { addStyleSheetToList, manageStyleSheets } from "./preview.js";

async function startup(url = document.location.href) {
  // use parameters to define the url of the project
  // url =  server.com/?sequence=SEQID&project=projectid
  let sequenceUrl = new URL(url);
  const projectId = sequenceUrl.searchParams.get("project");
  const sequenceId = sequenceUrl.searchParams.get("sequence");

  document.body.id = `sequence-${sequenceId}`;

  // if there is no sequence id, create a new sequence
  if (!sequenceId) {
    let response = await createData(config.strapi.url, `sequences`, {
      title: "Title X",
      projectId: projectId ? projectId : "",
    });

    // add the sequence to the URL and show it in the url bar (damn you safari)
    sequenceUrl.searchParams.set("sequence", response.data.data.id);

    // TODO → generate projectId before otherwise, it will create a new page.

    history.pushState({}, null, sequenceUrl);
    window.location = sequenceUrl;
    updateSequenceMeta(
      response.data?.data?.id,
      response.data?.data?.attributes?.title,
    );

    await fillSequence(response.data.data.id);
    console.log("fill sequence finished");
  } else {
    // if there is a sequenceID in the url, load the sequence from strapi
    let response = await loadSingle(config.strapi.url, `sequences`, sequenceId);

    if (response.data.data) {
      document.querySelector("#loading")?.remove();
    }

    // if the sequence number doesnt exist in strapi, create it
    if (response.data == null) {
      let response = await createData(config.strapi.url, `sequences`, {
        title: "this sequence has no name yet",
        projectId: projectId ? projectId : "",
        id: sequenceId,
      });

      //update the sequence url and write in the url bar
      sequenceUrl.sequenceId = response.data.data.id;
      // history.pushState({}, null, sequenceUrl)
      // window.location.href = sequenceUrl
    }
    await updateSequenceMeta(
      response.data?.data?.id,
      response.data?.data?.attributes?.title,
    );

    //fillStylesheet

    const stylesheets = response.data.data.attributes.stylesheets.data;
    // for stylesheet
    // addStyleSheetToList
    console.log(stylesheets);

    // sort: show all
    const orderedstylesheets = stylesheets.sort((a, b) => {
      console.log(a.attributes.maxwidth);
      return a.attributes.maxwidth - b.attributes.maxwidth;
    });
    orderedstylesheets.forEach((stylesheet) => {
      stylesheet.attributes.strapid = stylesheet.id;
      // add the stylesheets to the list
      addStyleSheetToList(stylesheet.attributes);
    });

    console.log(response.data.data);

    fillSequence(response.data.data.id);
  }

  moveToolbars();
  toggleToolbars();
  dragAndPlanReorder(montageList, sequenceNumber);
  reorderLayer(layerList);
  layerInteract();
  resizeMontagePaneVertically();
  handleDelays();
  getSize();
  setAnchor();
  manageStyleSheets();
  // recreate the layer list from the selected plan
}

async function fillSequence(sequence) {
  let response = await loadSingle(config.strapi.url, "sequences", sequence);
  let plans = response.data.data.attributes.plans;
  //if there is no plan, create a plan
  if (plans.data.length < 1) {
    addPlan(montageList, sequence);
  }
  //create the plan
  plans.data.forEach(async (plan, index) => {
    console.log("renderPlan", plan);
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
  console.log(`fill the plan ${plan.id} on load from the objects`);

  // fill the plan with all the existing images
  // find the plan
  let planToFill = preview.querySelector(`#plan-${plan.id}`);
  let objectsToFillWith = plan.attributes.objects?.data;
  console.log(plan.attributes, objectsToFillWith);

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
        `<img id="inuse-${plan.id}-${object.id}" data-objectId="${object.id
        }" data-planid="${plan.id}"
        data-assetid="${asset.id}" src="${asset.attributes.location}"
        data-anchor-horizontal="${asset.attributes.anchorVertical
          ? asset.attributes.anchorVertical
          : "left"
        }" 
        data-anchor-vertical="${asset.attributes.anchorHorizontal
          ? asset.attributes.anchorHorizontal
          : "top"
        }"


class= "asset" style = "
        ${object.attributes.width ? `width:${object.attributes.width}` : ""}
        ${object.attributes.height ? `height:${object.attributes.height}` : ""}

        ${object.attributes.anchor == "top"
          ? `top:${object.attributes.top};`
          : `bottom:${object.attributes.bottom};`
        }
        ${object.attributes.anchor == "left"
          ? `left:${object.attributes.left};`
          : `right:${object.attributes.right};`
        }
        ${object.attributes.left ? `left:${object.attributes.left}` : ""}" >`,
      );
    });
  });
}

export { startup, fillPlan };

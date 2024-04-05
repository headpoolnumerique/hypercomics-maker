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
import { setAnchor} from "./assetManipulation";
import { getSize, loadStylesheets, stylesheetmanager } from "./stylesheet.js";

async function startup(url = document.location.href) {
  // use parameters to define the url of the project
  // url =  server.com/?sequence=SEQID&project=projectid
  let sequenceUrl = new URL(url);
  const projectId = sequenceUrl.searchParams.get("project");
  const sequenceId = sequenceUrl.searchParams.get("sequence");

  document.body.id = `sequence-${sequenceId}`;
  // if there is no sequence id, create a new sequence

  // with the new system there will always a url
  // if there is a sequenceID in the url, load the sequence from strapi
  let response = await loadSingle(config.strapi.url, `sequences`, sequenceId);

  //update the sequence url and write in the url bar
  // sequenceUrl.sequenceId = response.data.data.id;
  // history.pushState({}, null, sequenceUrl)
  // window.location.href = sequenceUrl

  // console.log(response);
  await updateSequenceMeta(
    response.data?.data?.id,
    response.data?.data?.attributes?.title,
  );

  fillSequence(response.data.data.id);

  // console.log("start");
  // parseStylesheet(response.data.data.attributes.css);

  moveToolbars();
  toggleToolbars();
  dragAndPlanReorder(montageList, sequenceNumber);
  reorderLayer(layerList);
  layerInteract();
  resizeMontagePaneVertically();
  handleDelays();
  getSize();
  setAnchor();

  // manageStyleSheets(response.data)
  // load stylesheet
  loadStylesheets(response.data.data.attributes.stylesheets.data);
  await stylesheetmanager(response.data)

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

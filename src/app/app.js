import {
  deletePlan,
  deleteAllPlans,
  addPlan,
  duplicatePlan,
} from "./modules/montage.js";
import { startup } from "./modules/startup.js";
import { uploadToStrapi } from "./modules/assetNetwork.js";
import { deselect, selectLink } from "../app/modules/helpers";
import { showHideBlock } from "./modules/helpers.js";
import {
  applyToOtheRatios,
  interactObject,
  stickElement,
  updateTheUI,
} from "./modules/assetManipulation.js";
import {
  previewScreen,
  montageScreen,
  montageList,
  imageUploadInputs,
  imageUpload,
  assetsList,
  contextUI,
  layerList,
  saveStylesheetButton,
  buttonDeselectAsset,
  buttonStick,
  buttonCloneToLowerRatio,
  buttonCloneToHigherRatio,
  stylesWrapper,
} from "./modules/selectors.js";
import { addImg } from "./modules/createPreviewElement.js";
import { connectObjectToPlan } from "./modules/dataManagement.js";
import config from "./config/config.js";
import {
  appendLayer,
  selectLayer,
  updateLayers,
} from "./modules/layerManipulation.js";
import { updateDelayUI } from "./modules/delay.js";
import {
  previewLayers,
  resizePreviewBasedOnScreenSize,
  zooming,
} from "./modules/preview.js";
import { hideLogin, isLoggedIn } from "./api/login.js";
import { reloadAssetsSetup } from "./modules/assetManager.js";
import { startPreviewMode } from "./modules/previewmode.js";
import { addRuleToObject } from "./modules/objectManipulations.js";
import { parse, stringify } from "./vendors/css/css.js";
import { saveAllStylesheet, saveStylesheet } from "./modules/stylesheet.js";

startApp();

// list all the things
//Event and binds
function listeners() {
  previewLayers();
  // zoom system
  zooming();
  startPreviewMode();
  reloadAssetsSetup();
  resizePreviewBasedOnScreenSize();
  //show hide contextual id
  document
    .querySelectorAll("#showContextualUI, #closeContextualUI")
    .forEach((caller) => {
      caller.addEventListener("click", () => {
        showHideBlock(contextUI);
      });
    });

  document.querySelector("#addPlan").addEventListener("click", () => {
    addPlan(montageList, previewScreen);
  });

  document.querySelector("#deletePlan").addEventListener("click", () => {
    deletePlan();
  });

  document.querySelector("#deleteAllPlans")?.addEventListener("click", () => {
    deleteAllPlans();
  });

  // deselect when click the deselect button
  buttonDeselectAsset.addEventListener("click", function (event) {
    deselect(".asset-selected");
  });

  buttonStick.addEventListener("click", function () {
    stickElement(previewScreen.querySelector(".asset-selected"));
  });

  buttonCloneToLowerRatio.addEventListener("click", function () {
    applyToOtheRatios(previewScreen.querySelector(".asset-selected"), "lower");
  });
  buttonCloneToHigherRatio.addEventListener("click", function () {
    applyToOtheRatios(previewScreen.querySelector(".asset-selected"), "higher");
  });

  document
    .querySelector("#duplicatePlan")
    .addEventListener("click", async () => {
      const sequenceId = Number(
        document.querySelector("#sequenceNumber").textContent,
      );
      await duplicatePlan(
        montageList,
        document.querySelector(".shown")?.dataset.strapId,
        sequenceId,
      );
    });
  imageUpload.addEventListener("click", function (e) {
    e.preventDefault();
    uploadToStrapi(imageUploadInputs);
  });

  montageList.addEventListener("click", (e) => {
    if (e.target.tagName == "A") {
      //dont change the url of the page because it’s used to define the sequence
      e.preventDefault();
      deselect(".selected");

      selectLink(e.target);
      updateLayers();
      updateDelayUI();
      // update the Layers pane
    }
  });

  //when clicking an image in the asset list
  assetsList.addEventListener("click", async (e) => {
    // if it’s an image
    if (e.target.tagName == "IMG") {
      // add the image to the plan
      let planNumber = document
        .querySelector(".selected")
        .hash.replace("#plan-", "");

      const assetId = e.target.dataset.assetid;

      let strapisResponse = await connectObjectToPlan(
        config.strapi.url,
        planNumber,
        assetId,
      );

      if (strapisResponse) {
        // console.log(strapisResponse);
        let objid = addImg(
          e.target,
          document.querySelector(".selected").hash,
          strapisResponse.data.data.id,
          strapisResponse.data.data,
        );

        // create the css here for the image.
        // create img with a width of 50%;
        let declarations = [
          {
            type: "declaration",
            property: "top",
            value: `unset`,
          },
          {
            type: "declaration",
            property: "width",
            value: `unset`,
          },
          {
            type: "declaration",
            property: "height",
            value: `unset`,
          },
          {
            type: "declaration",
            property: "bottom",
            value: `unset`,
          },
          {
            type: "declaration",
            property: "left",
            value: `unset`,
          },
          {
            type: "declaration",
            property: "right",
            value: `unset`,
          },
        ];

        let style = stylesWrapper.querySelector("style");

        let parsedCSS = parse(style.textContent);

        // find the css and append the new rule, then send the css
        // save stylesheet

        parsedCSS.stylesheet.rules[0].rules.push({
          type: "rule",
          selectors: [`#${objid}`],
          declarations: declarations,
        });

        style.textContent = stringify(parsedCSS);

        await saveStylesheet(style.dataset.strapid, style.textContent);

        // select the image, create the css
        appendLayer(strapisResponse.data.data.id, layerList, false);
      }
    }
  });

  // select object if it’s an image
  preview.addEventListener("click", (event) => {
    if (event.target.tagName == "IMG") {
      deselect(".confirm");

      if (
        event.target.dataset.objectid !=
        document.querySelector(".selectedLayer")?.dataset.objectid
      ) {
        deselect(".selectedLayer");
      }

      document.querySelector("#selectedId").textContent = `#${event.target.id}`;
      // the element is already selected
      if (event.target.classList.contains("asset-selected")) return;

      deselect(".asset-selected");

      // console.log(event.target.closest(".shown"));
      if (!event.target.closest(".shown")) {
        return;
        // console.log("i can’t move this it’s on the other plan");
      }
      event.target.classList.add("asset-selected");

      updateTheUI(event.target);

      selectLayer(layerList, event.target.dataset.objectid);

      interactObject(event.target);
    } else {
      document.querySelector("#selectedId").textContent = ``;
      deselect(".asset-selected");
      deselect(".confirm");
      deselect(".selectedLayer");
    }
  });

  // show hide/plan
  document
    .querySelector("#previewPrevious")
    .addEventListener("click", function () {
      let shownPlan = document.querySelector(".shown");
      let shownLink = document.querySelector(".selected");

      if (!shownPlan.previousElementSibling) {
        return false;
      }

      document.querySelector(".oldshown")?.classList.remove("oldshown");
      shownPlan.classList.remove("shown");
      shownLink.classList.remove("selected");
      shownPlan.previousElementSibling.classList.add("shown");
      shownPlan.previousElementSibling?.previousElementSibling?.classList.add(
        "oldshown",
      );
      shownLink
        .closest("li")
        .previousElementSibling.querySelector("a")
        .classList.add("selected");

      updateLayers();
      updateDelayUI();
    });

  //save all styleshett
  saveStylesheetButton.addEventListener("click", function (event) {
    saveAllStylesheet();
  });

  document.querySelector("#previewNext").addEventListener("click", function () {
    let shownPlan = document.querySelector(".shown");
    let shownLink = document.querySelector(".selected");
    if (!shownPlan.nextElementSibling) {
      return false;
    }
    shownPlan.classList.remove("shown");
    shownLink.classList.remove("selected");
    document.querySelector(".oldshown")?.classList.remove("oldshown");
    shownPlan.nextElementSibling.classList.add("shown");
    shownPlan.classList.add("oldshown");
    shownLink
      .closest("li")
      .nextElementSibling.querySelector("a")
      .classList.add("selected");

    updateLayers();
    updateDelayUI();
  });
}

//start the app
async function startApp() {
  // check for the jwt cookie
  // else login with user name password.
  // if username / password is done and jwt is ok,
  // start the app, and you’ll be ok everywhere

  // check for jwt.
  // followting https://forum.strapi.io/t/how-to-set-jwt-expiration-to-years/5490 we can have the jwt last for 10 days?
  // and force the login every 7 days could be an interesting solution

  // if not connected, dont show anything? or create an account?

  if (isLoggedIn()) {
    // if not logged, go back to home page
    await startup();
    listeners();
    document.querySelector("#loading")?.classList.add("hide");
  } else {
    window.location = config.appurl;
  }
}

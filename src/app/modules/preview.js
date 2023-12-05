/* when clicking on a button, create a screen, and set the right size#height*/

import axios from "axios";
import config from "../config/config";
import { createData, loadCollection, updateData } from "./dataManagement";
import {
  maxwidthInput,
  newScreenButton,
  newScreenForm,
  previewScreen,
  screensList,
  sequenceNumber,
} from "./selectors";

const serverUrl = config.strapi.url;

// the output of the style element
const stylesheetNewEl = (data, itemclasses, newest) => `
<li data-strapid="${data.strapid}" 
data-maxwidth=${data.maxwidth} 
data-default-height=${data.defaultHeight} 
class="${itemclasses} ${newest ? `activeStylesheet` : ``}" id="screen-${data.strapid
  }>
<span class="name">${data.strapid}</span>
<span class="width">w: ${data.maxwidth}</span>
<span class="height">h: ${data.defaultHeight}</span>
<span class="remove">R</span>
</li>`;

async function manageStyleSheets() {
  // load all stylesheet. TODO: only load filtered stylesheets!
  // loadStyleSheet(sequenceNumber.innerText);

  /*check existing stylesheet and merge them? */
  /*create a screen = create a stylesheet*/

  /*remove a stylesheet*/
  screensList.addEventListener("click", function(event) {
    if (event.target.classList == "remove") {
      // removeStylesheet(event.target);
      event.target.closest("li").classList.toggle("disabled");
    } else if (event.target.closest("li")) {
      activateStylesheet(event.target.closest("li"));
      resizePreview(
        previewScreen,
        event.target.closest("li").dataset.maxwidth,
        event.target.closest("li").dataset.defaultHeight,
      );
    } else if (event.target.tagName == "LI") {
      activateStylesheet(event.target);
      resizePreview(
        previewScreen,
        event.target.closest("li").dataset.maxwidth,
        event.target.closest("li").dataset.defaultHeight,
      );
    }
  });

  // check if inputs are valid
  newScreenForm.addEventListener("input", validateInputs());
  function validateInputs() {
    if (newScreenForm.checkValidity()) {
      newScreenButton.disabled = false;
    } else {
      newScreenButton.disabled = true;
    }
  }

  newScreenForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    // if (!validateInputs()) return;
    // get the data from the form and from the inputs
    const data = {
      maxwidth: Number(maxwidthInput.value),
      sequenceId: sequenceNumber.textContent,
      defaultHeight: previewScreen.dataset.height,
    };

    // create the stylesheet
    const response = await createData(serverUrl, "stylesheets", data);
    if (!response.data) return console.log(`nothing got saved`);

    // add stylesheet to the sequence,
    const responsedata = response.data.data.attributes;
    const strapid = response.data.data.id;
    responsedata.strapid = response.data.data.id;

    insertStylesheetToList(responsedata);
    // use that attribute to manipulate the css you need
  });
}

function insertStylesheetToList(data) {
  console.log(data);
  const itemclasses = data.disabled ? "disabled" : "";
  // find where to place the stylesheet base on size
  //
  // get the max-width of the element
  const newMaxWidth = data.maxwidth;

  // () and place the element just before the stylesheet with a bigger screen
  let nextMaxWidth = [...screensList.querySelectorAll("li")].filter((el) => {
    return Number(el.dataset.maxwidth) > Number(newMaxWidth);
  });

  console.log(nextMaxWidth);

  if (nextMaxWidth.length > 0) {
    // create a item in the screens list
    screensList
      .querySelector(".activeStylesheet")
      ?.classList.remove("activeStylesheet");
    nextMaxWidth[0]?.insertAdjacentHTML(
      "beforebegin",
      stylesheetNewEl(data, itemclasses, true),
    );
  } else {
    screensList
      .querySelector(".activeStylesheet")
      ?.classList.remove("activeStylesheet");
    screensList.insertAdjacentHTML(
      "beforeend",
      stylesheetNewEl(data, itemclasses, true),
    );
  }

  // selectAdded;
}

function addStyleSheetToList(data) {
  const itemclasses = data.disabled ? "disabled" : "";
  // find where to place the stylesheet base on size
  // get the max-height() and place the element just before the bigger screen

  screensList.insertAdjacentHTML(
    "beforeend",
    stylesheetNewEl(data, itemclasses),
    //     `<li data-strapid="${data.strapid}" data-maxwidth=${data.maxwidth} class="${itemclasses}" id="screen-${data.strapid}>
    // <span class="name">${data.strapid}</span>
    // <span class="width">w: ${data.maxwidth}</span>
    // <span class="height">h: ${data.defaultHeight}</span>
    // <span class="remove">R</span>
    // </li>`,
  );
}

function changeOrientation(previewEl) {
  const width = previewEl.style.getPropertyValue("width");
  const height = previewEl.style.getPropertyValue("height");
  previewEl.style.setProperty("width", height);
  previewEl.style.setProperty("height", width);
}

function fullPageWatcher(preview) {
  preview.classList.toggle("fullscreen");
}

function resizePreview(previewEl, width, height) {
  if (!previewEl) return console.log("no preview El!");
  // previewEl.querySelector().style.width
  previewEl.style.width = "var(--preview-width)";
  previewEl.style.height = "var(--preview-height)";
  previewEl.style.setProperty("--preview-width", width + `px`);
  previewEl.style.setProperty("--preview-height", height + `px`);
}

function activateStylesheet(stylesheet) {
  screensList
    .querySelector(".activeStylesheet")
    ?.classList.remove("activeStylesheet");
  stylesheet.classList.add("activeStylesheet");

  // pour une raison inconnue, les layers disparaissent à certaine moment après un double click
}

//resize event observer!
function previewResize() {
  const screens = document.querySelector("#previewScreen");
  const screenshotObserver = new ResizeObserver((screenshots) => {
    for (const screenshot of screenshots) {
      if (screenshot.contentBoxSize) {
        screens.forEach((screen) => {
          screen.dataset.width = Math.round(
            screenshot.contentBoxSize[0].inlineSize,
          );
          screen.dataset.height = Math.round(
            screenshot.contentBoxSize[0].blockSize * 0.9,
          );
        });
      }
      // screenshot.dataset.width = screenshot.contentBoxSize
    }
  });
  screenshotObserver.observe(screen);
}

// add image → save dataset
// move image → save dataset
// do something → save all the time.

// function resizeWatcher(preview) {
//   // to get the preview size
//   const screenshotObserver = new ResizeObserver((preview) => {
//     if (preview.contentBoxSize) {
//       preview.dataset.width = Math.round(preview.contentBoxSize[0].inlineSize)
//       preview.dataset.height = Math.round(
//         preview.contentBoxSize[0].blockSize * 0.9
//       )
//     }
//     console.log(preview)
//     screenshotObserver.observe(preview)
//   })
// }

// function changePreviewSize(width, height) {}

// async function removeStylesheet(target) {
//   const id = target.closest("li").dataset.strapid;
//
//   const data = {
//     disabled: true,
//   };
//
//   const response = await updateData(serverUrl, "stylesheets", data, id);
//   c
// }

export {
  changeOrientation,
  fullPageWatcher,
  resizePreview,
  manageStyleSheets,
  addStyleSheetToList,
};

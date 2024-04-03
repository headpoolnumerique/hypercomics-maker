/* when crcking on a button, create a screen, and set the right size#height*/

import axios from "axios";
import config from "../config/config";
import { createData, loadCollection, updateData } from "./dataManagement";
import {
  populateStylesheetButton,
  screenWidthInput,
  screenHeightInput,
  newScreenButton,
  newScreenForm,
  previewScreen,
  screensList,
  sequenceNumber,
} from "./selectors";

const serverUrl = config.strapi.url;

// the output of the style element
const stylesheetNewEl = (data, itemclasses, newest) => `
<li
data-strapid="${data.strapid}" 
data-maxwidth="${data.maxwidth}"
data-default-height="${data.defaultHeight}"
class="stylesheet ${itemclasses} ${newest ? `activeStylesheet` : ``}"
id="screen-${data.strapid}">
<span class="name">#${data.strapid}</span>
<span class="width">Width: ${data.maxwidth}</span>
<span class="height">Height: ${data.defaultHeight}</span>
<span class="ratio">Ratio: ${(data.maxwidth / data.defaultHeight).toFixed(2)} (${data.maxwidth}/${data.defaultHeight})</span>
<span class="remove">R</span>
</li>`;

// ${data.default ? "" : `<span class="remove">R</span>`}
async function manageStyleSheets(response) {
  console.log("response here", response);
  // console.log(screensList.querySelectorAll(".stylesheet"))
  if (screensList.querySelectorAll(".stylesheet").length < 1) {
    await kickstartStylesheet();
  }
  populateStylesheetButton.addEventListener("click", kickstartStylesheet);

  document.querySelector("#fullPageWatcher").addEventListener("click", () => {
    previewScreen.classList.toggle("fullscreen");
  });

  // check for existing stylesheet with the following width/height

  // if there is no stylesheet, createone
  // by default, else activate one

  // set default stylesheet if it doesnt exist

  // first screens:

  // load all stylesheet. TODO: only load filtered stylesheets!
  // loadStyleSheet(sequenceNumber.innerText);

  /*check existing stylesheet and merge them? */
  /*create a screen = create a stylesheet*/

  /*remove a stylesheet*/
  screensList.addEventListener("click", function (event) {
    // if (document.querySelector(".disabled") && !event.target.classList.contains("remove")) {
    //   document.querySelector(".disabled").classList.remove("disabled")
    // }

    if (!event.target.classList.contains("remove")) {
      document.querySelector(".toremove")?.classList.remove("toremove");
    }

    // dont remove with R only
    if (event.target.classList == "remove") {
      if (event.target.closest("li").classList.contains("toremove")) {
        removeStylesheet(event.target);
        event.target.remove();
      } else {
        document.querySelector(".toremove")?.classList.remove("toremove");
        event.target.closest("li").classList.add("toremove");
      }
    } else if (event.target.closest(".stylesheet")) {
      activateStylesheet(event.target.closest(".stylesheet"));
      resizePreview(
        previewScreen,
        event.target.closest(".stylesheet").dataset.maxwidth,
        event.target.closest(".stylesheet").dataset.defaultHeight,
        event.target.closest(".stylesheet").dataset.strapid,
      );
    } else if (event.target.classList.contains(".stylesheet")) {
      activateStylesheet(event.target);
      resizePreview(
        previewScreen,
        event.target.closest(".stylesheet").dataset.maxwidth,
        event.target.closest(".stylesheet").dataset.defaultHeight,
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

  // add stylesheet
  newScreenForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    // if (!validateInputs()) return;
    // get the data from the form and from the inputs
    const data = {
      maxwidth: Number(screenWidthInput.value),
      sequenceId: sequenceNumber.textContent,
      defaultHeight: Number(screenHeightInput.value),
    };

    // create the stylesheet
    const response = await createData(serverUrl, "stylesheets", data);
    if (!response.data) return console.log(`nothing got saved`);

    // add stylesheet to the sequence,
    const responsedata = response.data.data.attributes;
    const strapid = response.data.data.id;
    // set the screensize id on the preview to know where to save the data
    previewScreen.dataset.screensize = strapid;
    responsedata.strapid = response.data.data.id;

    await insertStylesheetToList(responsedata);

    // use that attribute to manipulate the css you need
  });
}

async function kickstartStylesheet() {
  // onloading, check if there is the following screen:
  // https://gs.statcounter.com/screen-resolution-stats/
  // screenwidth: resolution de base
  // ratio de base
  // screen: 360 * 800

  // 1 stylesheet per size per sequence
  // 1 set of css rule per object per stylesheet

  // tablet: 1024 * 768
  // tablev: 768 * 1024
  // desktop: 1920 * 1080 (found less for smaller screen?)
  // desktop: 1368 * 768 (found less for smaller screen?)
  // default = not removable, add class

  // add resolution you want here and it will create them by default
  const resolutions = [
    {
      maxwidth: "360",
      defaultHeight: "880",
      default: true,
      sequenceId: sequenceNumber.textContent,
    },
    {
      maxwidth: "1024",
      defaultHeight: "768",
      default: true,
      sequenceId: sequenceNumber.textContent,
    },
    {
      maxwidth: "768",
      defaultHeight: "1024",
      default: true,
      sequenceId: sequenceNumber.textContent,
    },
    {
      maxwidth: "1920",
      defaultHeight: "1080",
      default: true,
      sequenceId: sequenceNumber.textContent,
    },
    {
      maxwidth: "1368",
      defaultHeight: "768",
      default: true,
      sequenceId: sequenceNumber.textContent,
    },
  ];

  // check stylesheet

  resolutions.map(async (rez) => {
    const response = await createData(serverUrl, "stylesheets", rez);
    if (!response.data) return console.log(`nothing got saved`);

    // add stylesheet to the sequence,
    const responsedata = response.data.data.attributes;
    const strapid = response.data.data.id;

    previewScreen.dataset.screensize = strapid;
    responsedata.strapid = response.data.data.id;

    insertStylesheetToList(responsedata);
  });

  console.log("add some stylesheet now!");

  // on load check if the table with the content is empty
  // if empty, add stylesheet
}



function changeOrientation(previewEl) {
  const width = previewEl.style.getPropertyValue("width");
  const height = previewEl.style.getPropertyValue("height");
  previewEl.style.setProperty("width", height);
  previewEl.style.setProperty("height", width);
}

function resizePreview(previewEl, width, height, strapid) {
  if (!previewEl) return console.log("no preview El!");
  // previewEl.querySelector().style.width
  previewEl.style.width = "var(--preview-width)";
  previewEl.style.height = "var(--preview-height)";
  previewEl.style.setProperty("--preview-width", width + `px`);
  previewEl.style.setProperty("--preview-height", height + `px`);
  // screensize let you know where to save the data
  previewEl.dataset.screensize = strapid;
}

function activateStylesheet(stylesheet) {
  screensList
    .querySelector(".activeStylesheet")
    ?.classList.remove("activeStylesheet");
  // deselect any object when changing stylesheet
  document.querySelector(".asset-selected")?.classList.remove("asset-selected");
  stylesheet.classList.add("activeStylesheet");

  // pour une raison inconnue, les layers disparaissent à certaine moment après un double click
}

//resize event observer!
//// this doesnt seem to be used :think:
// function previewResize() {
//   const screens = document.querySelector("#previewScreen");
//   const screenshotObserver = new ResizeObserver((screenshots) => {
//     for (const screenshot of screenshots) {
//       if (screenshot.contentBoxSize) {
//         screens.forEach((screen) => {
//           screen.dataset.width = Math.round(
//             screenshot.contentBoxSize[0].inlineSize,
//           );
//           screen.dataset.height = Math.round(
//             screenshot.contentBoxSize[0].blockSize * 0.9,
//           );
//         });
//       }
//       // screenshot.dataset.width = screenshot.contentBoxSize
//     }
//   });
//   screenshotObserver.observe(screen);
// }

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

async function removeStylesheet(target) {
  const id = target.closest("li").dataset.strapid;

  const data = {
    disabled: true,
  };

  const response = await updateData(serverUrl, "stylesheets", data, id);
  console.log(response);
}

export {
  changeOrientation,
  resizePreview,
  manageStyleSheets,
  // addStyleSheetToList,
};

// bring back from app.js
// resize the preview (should )

// document.querySelectorAll(".previewResizer").forEach((resizeButton) => {
//   resizeButton.addEventListener("click", () => {
//     resizePreview(
//       previewScreen,
//       resizeButton.dataset.previewWidth,
//       resizeButton.dataset.previewHeight,
//     );
//   });
// });

// document.querySelector("#orientationChanger").addEventListener("click", () => {
//   changeOrientation(previewScreen);
// });
//

async function loadSingle(serverUrl, sequenceid, populatedeep = true) {
  return axios
    .get(
      `${serverUrl}/api/${collection}/${id}${
        populatedeep ? `?populate=deep,5` : ``
      }`,
    )
    .then((response) => {
      // console.log(response)
      return response;
    })
    .catch((err) => {
      return err;
    });
}

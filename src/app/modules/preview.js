// Preview js must disappear because it should be inside stylesheet.js

/* when crcking on a button, create a screen, and set the right size#height*/

import axios from "axios";
import config from "../config/config";
import { createData, loadCollection, updateData } from "./dataManagement";
import {
  screenWidthInput,
  screenHeightInput,
  newScreenButton,
  newScreenForm,
  previewScreen,
  screensList,
  sequenceNumber,
} from "./selectors";

const serverUrl = config.strapi.url;

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

    responsedata;
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

export {
  // changeOrientation,
  resizePreview,
  // manageStyleSheets,
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
      `${serverUrl}/api/${collection}/${id}${populatedeep ? `?populate=deep,5` : ``
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



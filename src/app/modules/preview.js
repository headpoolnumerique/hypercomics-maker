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

// kickstart
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



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

async function manageStyleSheets() {
  // load all stylesheet. TODO: only load filtered stylesheets!
  console.log(sequenceNumber);

  loadStyleSheet(sequenceNumber.innerText);

  async function loadStyleSheet(sequenceId) {
    //load all style sheet and bring them on the table
    const response = await axios
      .get(`${serverUrl}/api/stylesheets?populate=deep,2`)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        return err;
      });

    // get the stylesheet
    response.data.data.forEach((stylesheet) => {
      // const data = stylesheet.attributes;
      // data.strapid = stylesheet.id;
      // console.log(data);
      // console.log(parseInt(sequenceNumber.textContent, 10))
      // console.log(parseInt(data.sequenceId.data.id,10))
      // console.log(parseInt(data.sequenceId ,10) = parseInt(sequenceNumber.textContent, 10))
      // if (data.sequenceId == sequenceNumber.textContent) {
      //   addStyleSheetToList(data);
      // }
    });
  }

  /*check existing stylesheet and merge them? */
  /*create a screen = create a stylesheet*/

  /*remove a stylesheet*/
  screensList.addEventListener("click", function(event) {
    if (event.target.classList == "remove") {
      removeStylesheet(event.target);
      event.target.closest("li").classList.toggle("disabled");
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

    // create the data
    const response = await createData(serverUrl, "stylesheets", data);
    if (!response.data) return console.log(`nothing got saved`);

    // show the response in the log

    // add screen to the list
    // add stylesheet to the sequence,
    const responsedata = response.data.data.attributes;
    const strapid = response.data.data.id;
    responsedata.strapid = response.data.data.id;

    addStyleSheetToList(responsedata);
    // use that attribute to manipulate the css you need
  });
}

function addStyleSheetToList(data) {
  const itemclasses = data.disabled ? "disabled" : "";

  // create a item in the screens list
  screensList.insertAdjacentHTML(
    "beforeend",
    `<li data-strapid="${data.strapid}" class="${itemclasses}" id="screen-${data.strapid}>
<span class="name">${data.strapid}</span>
<span class="width">w: ${data.maxwidth}</span>
<span class="height">h: ${data.defaultHeight}</span>
<span class="remove">R</span>
</li>`,
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

async function removeStylesheet(target) {
  const id = target.closest("li").dataset.strapid;

  const data = {
    disabled: true,
  };

  const response = await updateData(serverUrl, "stylesheets", data, id);
}
export { changeOrientation, fullPageWatcher, resizePreview, manageStyleSheets, addStyleSheetToList };

import axios from "axios";
import config from "../config/config.js";
import {
  previewScreen,
  anchors,
  screenRatioInput,
  screenWidthInput,
  screenHeightInput,
} from "./selectors.js";

// the code that describe what happens when a new size is found

// responsive screen
// function createSize() {
//   // send data to strapi
//   // create a marmer to show the size (100px portrait, on top of the page)
//   //
// }

function setAnchor() {
  anchors.forEach((input) =>
    addEventListener("change", function () {
      // make sure an object is selected
      let selected = document.querySelector(".asset-selected");
      if (!selected) {
        return;
      }

      // Get references to the radio button elements
      const verticalRadioButtons = document.getElementsByName("verticalAnchor");
      const horizontalRadioButtons =
        document.getElementsByName("horizontalAnchor");

      // Add event listeners to the radio buttons to detect changes
      verticalRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", function () {
          // Update the selected vertical anchor value
          selected.dataset.anchorVertical = this.value;
        });
      });

      horizontalRadioButtons.forEach(function (radioButton) {
        radioButton.addEventListener("change", function () {
          // Update the selected horizontal anchor value
          selected.dataset.anchorHorizontal = this.value;
          this.value;
        });
      });
    }),
  );
}

function getSize() {
  const screenshotObserver = new ResizeObserver((screenshots) => {
    for (const screenshot of screenshots) {
      if (screenshot.contentBoxSize) {
        let newWidth = Math.round(screenshot.contentBoxSize[0].inlineSize);
        let newHeight = Math.round(screenshot.contentBoxSize[0].blockSize);

        // update ui
        // screenWidthInput.value = newWidth;
        // screenHeightInput.value = newHeight;

        //update the ui
        //set the new add screen wax width
        screenWidthInput.value = newWidth;
        screenHeightInput.value = newHeight;
        console.log(screenRatioInput);
        screenRatioInput.value = (newWidth / newHeight).toFixed(2);
        console.log(`${newWidth / newHeight}`);

        // instead of the ratio tell if it’s portrait or landscape
        // and save that information
        // update preview dataset
        previewScreen.dataset.width = newWidth;
        previewScreen.dataset.height = newHeight;

        // let use the input ratio to generate the css.
        // .value = newHeight > newWidth ? "portrait" : "landscape";
      }
    }
  });

  screenshotObserver.observe(previewScreen);
}

export { getSize, setAnchor, updateStylesheet };

async function updateStylesheet(stylesheetLi) {
  const stylesheet = stylesheetLi
    ? stylesheetLi
    : document.querySelector(".activeStylesheet");
  console.log("dang");

  if(!stylesheet) return console.log("aint no stylesheet")

  const stylesheetId = stylesheet.dataset.strapid;

  axios
    .get(`${config.strapi.url}/api/stylesheets/${stylesheetId}?populate=deep,5`)
    .then((response) => {
      console.log(response.data.data.attributes.declarations);
    });

  // get stylesheet data
  // if(!stylesheetLi) {stylesheet = document.querySelector(".activeStylesheet")}

  console.log(stylesheet);
  // load stylesheet
  // for each declaration
  // find object
  // set style property from the db
  // use this instead of the object data
}

import { previewScreen, anchors } from "./selectors.js";


// the code that describe what happens when a new size is found

const inputScreenWidth = document.querySelector("#screenWidth");
const inputScreenHeight = document.querySelector("#screenHeight");
const inputRatio = document.querySelector("#screenRatio");

// responsive screen
function createSize() {
  // send data to strapi
  // create a marmer to show the size (100px portrait, on top of the page)
  //
}
function updateSize() {}
function removeSize() {}

function activateSize() {}
// when the page is activated, activate the size}

// set anchor (
// anchor for top/bottom and left/rigth
// when switching anchor, get the bottom / top in % and use it
// when switching anchor, get the left / right in % and use it
// remove the other styles.
// )

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




      // then send the data to the strapi api.
      // and set the size of the element accordingly 
      //
      // send data to strapi get the value of the top / left // right / bottom,

      // set the anchor to the object,

      // remove the other anchor style point

      // check the value of anchor
      // save and push.
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
        inputScreenWidth.value = newWidth;
        inputScreenHeight.value = newHeight;

        // instead of the ratio tell if it’s portrait or landscape
        // and save that information
        // update preview dataset
        previewScreen.dataset.width = newWidth;
        previewScreen.dataset.height = newHeight;

        // let use the input ratio to generate the css.
        inputRatio.value = newHeight > newWidth ? "portrait" : "landscape";
      }
    }
  });

  screenshotObserver.observe(previewScreen);
}

export { getSize, setAnchor };

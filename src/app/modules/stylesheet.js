// stylesheet v5
//
// CREATE A STYLE ELEMENT FOR EACH STYLESHEET, AND GIVE IT AN ID.
//
// AND MANIPULATE THAT STYLE SHEET ONLY
// the style element must have data attributes: id (the style sheet id), the width, height, and the ratio, so each of them is editable easily.
// when we click on an element, the width / height, x y top and bottom are loaded in the ui, BUT the main changes comes from the css stylesheet.
// we dont keep the attribute for each object, we just load it when clickin on an element, as an inspector would be.
// the stylesheet is a string saved
// everytime we load a sequence, we load the whole stylesheet
// this stylesheet is parsed with cssjs
// for each @container, we define a stylesheet ?
// or do we define the stylesheet first, and push that to the container when needed?
// aspect ratio need to be added in order!
// or use each stylesheet to build the final style sheet: on every change, update the bit of the stylesheet, update the whole stylesheet

// TOC
//
// loadstylesheet -> create a styleelement, with the right attribute
// createStylesheet -> create a stylesheet based on the preview size ratio. (warning if multiple ratio)
// update element inside stylesheet
//
//
import axios from "axios";
import { deselect, updateDataset } from "./helpers";
import { resizePreview } from "./preview";
import {
  screenHeightInput,
  screensList,
  screenWidthInput,
  screenRatioInput,
  newScreenForm,
  newScreenButton,
} from "./selectors";
import { screenListItem } from "./stylesheets/screenListItem";

/** function that will manage the stylesheet List:
 * - create the list, activate the list, and include the events listener for each item
 */

export async function stylesheetmanager(obj) {
  let stylesheets = obj.data.attributes.stylesheets.data;
  const orderedStylesheets = stylesheets.sort((a, b) => {
    // sort by ratio
    if (
      a.attributes.maxwidth / a.attributes.defaultHeight <
      b.attributes.maxwidth / b.attributes.defaultHeight
    ) {
      return -1;
    } else {
      return 1;
    }
  });
  orderedStylesheets.forEach((stylesheet) => {
    stylesheet.attributes.strapid = stylesheet.id;
    addStyleSheetToList(stylesheet.attributes);
  });
  activateFirstStylesheet();
  stylesheetListeners();
}

/** event listener for the stylesheet ui
 */
async function stylesheetListeners() {
  screensList.addEventListener("click", function(event) {
    /* remove stylesheet (disable in 2 times )*/
    if (!event.target.classList.contains("remove")) {
      document.querySelector(".toremove")?.classList.remove("toremove");
    }
    if (event.target.classList == "remove") {
      if (event.target.closest("li").classList.contains("toremove")) {
        removeStylesheet(event.target);
        event.target.remove();
      } else {
        document.querySelector(".toremove")?.classList.remove("toremove");
        event.target.closest("li").classList.add("toremove");
      }
    } else if (event.target.closest(".stylesheet")) {
      // activate stylesheet if clicking on a stylesheet
      activateStylesheet(
        event.target.closest(".stylesheet") ||
        event.target.classList.contains(".stylesheet"),
      );
      resizePreview(
        previewScreen,
        event.target.closest(".stylesheet").dataset.maxwidth,
        event.target.closest(".stylesheet").dataset.defaultHeight,
        event.target.closest(".stylesheet").dataset.strapid,
      );
    }
  });
}
// console.log(screensList.querySelectorAll(".stylesheet"))
// if (screensList.querySelectorAll(".stylesheet").length < 1) {
//   await kickstartStylesheet();
// }

// populateStylesheetButton.addEventListener("click", kickstartStylesheet);

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
newScreenForm.addEventListener("submit", async function(event) {
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
});

async function loadStylesheets(response) {
  // load the stylesheets
  //fillStylesheet
  const stylesheets = response.data.data.attributes.stylesheets.data;
  // for stylesheet
  // addStyleSheetToList

  // sort: show all
  const orderedstylesheets = stylesheets.sort((a, b) => {
    // console.log(a.attributes.maxwidth);
    return a.attributes.maxwidth - b.attributes.maxwidth;
  });
  orderedstylesheets.forEach((stylesheet, index) => {
    stylesheet.attributes.strapid = stylesheet.id;
    // add the stylesheets to the list
    // console.log("noe", stylesheet)
    addStyleSheetToList(stylesheet.attributes);
  });

  // get the first stylesheet and activate it.
}

function activateFirstStylesheet() {
  let stylesheetToActivate = document.querySelector("#screens .header + li");
  stylesheetToActivate?.classList.add("activeStylesheet");

  if (stylesheetToActivate) {
    // resize the preview once activated
    resizePreview(
      previewScreen,
      stylesheetToActivate.dataset.maxwidth,
      stylesheetToActivate.dataset.defaultHeight,
      stylesheetToActivate.dataset.strapid,
    );
  }
}

// this is different from the add list? how? why?
async function insertStylesheetToList(data) {
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
      screenListItem(data, itemclasses, true),
    );
  } else {
    screensList
      .querySelector(".activeStylesheet")
      ?.classList.remove("activeStylesheet");
    screensList.insertAdjacentHTML(
      "beforeend",
      screenListItem(data, itemclasses, true),
    );
  }

  // selectAdded;
}

/** add the stylesheet to the list UI */
function addStyleSheetToList(data) {
  const itemclasses = data.disabled ? "disabled" : "";
  /*if the stylesheet has been disabled*/
  if (data.disabled) return;
  screensList.insertAdjacentHTML(
    "beforeend",
    screenListItem(data, itemclasses),
  );
}

async function removeStylesheet(target) {
  const id = target.closest("li").dataset.strapid;

  const data = {
    disabled: true,
  };

  const response = await updateData(serverUrl, "stylesheets", data, id);
  console.log(response);
}

// this should also go into stylesheet.js
export function getSize() {
  const screenshotObserver = new ResizeObserver((screenshots) => {
    for (const screenshot of screenshots) {
      if (screenshot.contentBoxSize) {
        let newWidth = Math.round(screenshot.contentBoxSize[0].inlineSize);
        let newHeight = Math.round(screenshot.contentBoxSize[0].blockSize);

        //update the ui
        screenWidthInput.value = newWidth;
        screenHeightInput.value = newHeight;
        screenRatioInput.value = (newWidth / newHeight).toFixed(2);

        // update preview dataset
        previewScreen.dataset.width = newWidth;
        previewScreen.dataset.height = newHeight;

        // select the stylesheet on resize
        let stylesheetToEdit = selectScreen(screenRatioInput.value);
        console.log(stylesheetToEdit);
        //
      }
    }
  });
  screenshotObserver.observe(previewScreen);
}

function activateStylesheet(stylesheet) {
  screensList
    .querySelector(".activeStylesheet")
    ?.classList.remove("activeStylesheet");
  // deselect any object when changing stylesheet
  document.querySelector(".asset-selected")?.classList.remove("asset-selected");
  stylesheet.classList.add("activeStylesheet");
}

function selectScreen(ratio) {
  // deselect(".closeTo");
  // console.log(ratio);
  deselect(".activeStylesheet");

  let toActivate = [...screensList.querySelectorAll(".stylesheet")].findLast(
    (li) => li.dataset.maxwidth / li.dataset.defaultHeight <= ratio,
  );

  console.log(toActivate);

  // active = stylesheet you’re writting on. 
  // so if you have 0.41 active, you write smaller than 0.41, then smaller than 0.75, then smaller
  // if first : up to 0.41, then between 0.41 and 0.76, .....  more than the last 
  if (toActivate && toActivate == undefined) {
    toActivate = screens.querySelector(".stylesheet");
    toActivate.classList.add("activeStylesheet");
    return toActivate.dataset.strapid;
  } else {
    toActivate.classList.add("activeStylesheet");
    return toActivate.dataset.strapid;
  }
}

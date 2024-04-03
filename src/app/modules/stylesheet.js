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
import { updateDataset } from "./helpers";
import { screensList } from "./selectors";

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

async function stylesheetmanager(obj) {
  let stylesheets = obj.data.attributes.stylesheets.data;
  const orderedStylesheets = stylesheets.sort((a, b) => {
    console.log(a)
    console.log(
      "ratio",
      a.attributes.maxwidth / a.attributes.defaultHeight,
    );
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

  // downloadStylesheet
  /* load existing stylesheet*/
  // downloadStylesheets(obj);
}

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

export { stylesheetmanager };

async function insertStylesheetToList(data) {
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

/** add the stylesheet to the list UI */
function addStyleSheetToList(data) {
  const itemclasses = data.disabled ? "disabled" : "";
  /*if the stylesheet has been disabled*/
  if (data.disabled) return;
  screensList.insertAdjacentHTML(
    "beforeend",
    stylesheetNewEl(data, itemclasses),
  );
}

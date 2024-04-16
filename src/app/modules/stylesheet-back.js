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

function loadStylesheet(stylesheetId) {
  axios
    .get(`${config.strapi.url}/api/stylesheets/${stylesheetId}`)
    .then((response) => {
      if (response.data.data.attributes.cssrules == null) {
        response.data.data.attributes.cssrules = "";
      }

      genereateStyleElement(response.data.data);

      // load the stylesheet and add the content to the style object
    });
}



function genereateStyleElement(stylesheet) {
  // create style and include the content of the css of the stylesheet
  const style = document.createElement("style");
  style.id = stylesheet.id;
  style.textContent = stylesheet.css;
  const newdataset = {
    width: stylesheet.maxwidth,
    height: stylesheet.defaultHeight,
    strapid: stylesheet.id,
  };

  updateDataset(newdataset, style);

  addStyleSheetToList(stylesheet.attributes);
}

function updateTheStylesheet(styleId, stylesheetContent) {
  // update the stylesheet
  document.querySelector(`#${stylesheetid}`);
  //
}

function updateTheLayoutFromTheStylesheet() {}

// load the stylesheets
//fillStylesheet
// const stylesheets = response.data.data.attributes.stylesheets.data;
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

async function switchStylesheet(stylesheetLi) {
  // get the selected stylesheet if there is one
  const stylesheet = stylesheetLi
    ? stylesheetLi
    : document.querySelector(".activeStylesheet");

  if (!stylesheet) return console.log("aint no stylesheet");

  const stylesheetId = stylesheet.dataset.strapid;
  loadStylesheet(stylesheetId);
}
function selectScreen(ratio) {
  // deselect(".closeTo");
  // console.log(ratio);
  deselect(".activeStylesheet");

  let toActivate = [...screens.querySelectorAll("li")].findLast(
    (li) => li.dataset.maxwidth / li.dataset.defaultHeight <= ratio,
  );

  if (toActivate && toActivate == undefined) {
    toActivate = screens.querySelector(".stylesheet");
    toActivate.classList.add("activeStylesheet");
    return toActivate.dataset.strapid;
  } else {
    return console.log("there is no stylesheet!");
  }
}

function loadStylesheet(stylesheetId) {
  axios
    .get(`${config.strapi.url}/api/stylesheets/${stylesheetId}`)
    .then((response) => {
      let cssObj = parseCss(response.data.data.attributes.cssrules);
      if (response.data.data.attributes.cssrules == null) {
        response.data.data.attributes.cssrules = cssContent.textContent;
      }

      // load the stylesheet and add the content to the style object
      cssContent.textContent = stringify(cssObj);

      // should we parse the css here?
      return cssObj;
    });
}

function parseCss(cssString) {
  // create a js object
  // parse that object
  let cssObj = parse(cssString);

  // render it to the code block
  return stringify(cssObj);
}

// async function stylesheetmanager(obj) {
//   console.log(obj);
//   // downloadStylesheet
//   /* load existing stylesheet*/
//   downloadStylesheets(sequenceId);
// }

// async function downloadStylesheets(sequenceobj) {
//   axios.get(
//     `${config.strapi.url}/api/stylesheets?filters[sequence][id][$eq]=${sequenceId}`,
//   );
// }

// export { stylesheetmanager };

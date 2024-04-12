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
import config from "../config/config.js";
import { parse, stringify } from "../vendors/css/css.js";
import { deselect, percentage, updateDataset } from "./helpers";
import { resizePreview } from "./preview";
import {
  screenHeightInput,
  screensList,
  screenWidthInput,
  screenRatioInput,
  newScreenForm,
  newScreenButton,
  stylesWrapper,
  previewScreen,
} from "./selectors";
import { screenListItem } from "./stylesheets/screenListItem";
/** function that will manage the stylesheet List:
 * - create the list, activate the list, and include the events listener for each item
 */

export async function stylesheetmanager(obj) {
  let stylesheets = obj.data.attributes.stylesheets.data;
  const orderedStylesheets = sortByRatio(stylesheets);

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
  screensList.addEventListener("click", function (event) {
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
});

async function loadStylesheets(response) {
  // load the stylesheets
  //fillStylesheettext-align:justify
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

        deselect(".activatedStyle");
        stylesWrapper
          .querySelector(`#style-${stylesheetToEdit}`)
          .classList.add("activatedStyle");

        // reload the style by turning it off and on again after a change of container size.
        let back = styleWrapper.innerHTML;
        // styleWrapper.innerHTML = ""
        styleWrapper.innerHTML = "";
        styleWrapper.innerHTML = back;
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

  let toActivate = [...screensList.querySelectorAll(".stylesheet")].find(
    (li) => li.dataset.maxwidth / li.dataset.defaultHeight >= ratio,
  );
  // active = stylesheet you’re writting on.
  // so if you have 0.41 active, you write smaller than 0.41, then smaller than 0.75, then smaller
  // if first : up to 0.41, then between 0.41 and 0.76, .....  more than the last
  if (toActivate == undefined) {
    toActivate = screens.querySelector(".stylesheet");
    toActivate.classList.add("activeStylesheet");
    return toActivate.dataset.strapid;
  } else {
    toActivate.classList.add("activeStylesheet");
    return toActivate.dataset.strapid;
  }
}

/* load an array of stylesheets */
export function loadStylesheets(stylesheets) {
  const sortedStylesheets = sortByRatio(stylesheets, true);
  sortedStylesheets.forEach((stylesheet, index) => {
    stylesheet.prev = stylesheets[index - 1];
    stylesheet.next = stylesheets[index + 1];

    loadStylesheet(stylesheet);
  });
}

export function loadStylesheet(stylesheet) {
  console.log(stylesheet.prev);
  console.log(stylesheet.next);
  // prev,next
  /* the style element */

  const styleEl = `<style data-strapid="${stylesheet.id}" type="text/css" contenteditable id="style-${stylesheet.id}" 
data-height="${stylesheet.attributes.defaultHeight}"
data-width="${stylesheet.attributes.maxwidth}">

${stylesheet.attributes.cssrules?.length > 1 ? stylesheet.attributes.cssrules : `@container preview (max-aspect-ratio: ${getRatioFromStylesheet(stylesheet)}) {  }`} </style>`;

  // for each stylesheet, create a style element and feel it up
  stylesWrapper.insertAdjacentHTML("beforeend", styleEl);

  // on startup load all style sheet and create styles element
}

/* let’s make it work! */
// export function updateStylesheet(stylesheetId, object, css) {
//   // get the style element from the stylesheet id
//   // parse the style element? (or should we keep a global object for it?)
//   // update the css in the style
//   // push the css to strapi (but wait a little bit to make sure there is no other changes.)
// }
//
function getRatioFromStylesheet(stylesheet) {
  return (
    stylesheet.attributes.maxwidth / stylesheet.attributes.defaultHeight
  ).toFixed(2);
}

export function sortByRatio(stylesheets, reverse) {
  const sortedStylesheets = stylesheets.sort((a, b) => {
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
  if (reverse) return sortedStylesheets.reverse();

  return sortedStylesheets;
}

function isSelectorExistInContainers(parsedCSS, selector) {
  // console.log(selector);
  let selectorExists = false;
  parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
    if (rule.selectors && rule.selectors.includes(`#${selector}`)) {
      selectorExists = true;
    }
  });

  return selectorExists;
}

/**
 * function to find the object in a stylesheet, and if it doesnt exist, create it
 * @param stylesheet: style Element to update
 * @param obj: html object to update
 */
export function setObjInStylesheet(stylesheet, obj) {
  console.log("i did something");
  let parsedCSS = parse(stylesheet.textContent);

  // if there is no rule for the object, create one
  if (!isSelectorExistInContainers(parsedCSS, obj.id)) {
    // console.log("obj font exit, creating now");
    // create the obj in the stylesheet
    // TODONOW: cqw and cqh from the element
    // console.log(parsedCSS);
    parsedCSS.stylesheet.rules[0].rules.push({
      type: "rule",
      selectors: [`#${obj.id}`],
      declarations: [
        // heigbht is always auto for now
        // {
        //   type: "declaration",
        //   property: "height",
        //   value: `${percentage(obj.offsetHeight, previewScreen.offsetHeight)}cqh`,
        // },
        {
          type: "declaration",
          property: "width",
          value: `${percentage(obj.offsetWidth, previewScreen.offsetWidth)}cqw`,
        },
        {
          type: "declaration",
          property: "top",
          value: `${obj.dataset.anchorVertical == "top" ? `${percentage(obj.offsetTop, previewScreen.offsetHeight)}cqh` : "unset"}`,
        },
        {
          type: "declaration",
          property: "bottom",
          value: `${obj.dataset.anchorVertical == "bottom" ? `${percentage(obj.offsetTop + obj.offsetHeight, previewScreen.offsetHeight)}cqh` : "unset"}`,
        },
        {
          type: "declaration",
          property: "left",
          value: `${obj.dataset.anchorHorizontal == "left" ? `${percentage(obj.offsetLeft, previewScreen.offsetHeight)}cqw` : "unset"}`,
        },
        {
          type: "declaration",
          property: "right",
          value: `${obj.dataset.anchorHorizontal == "right" ? `${percentage(obj.offsetLeft + obj.offsetWidth, previewScreen.offsetHeight)}cqw` : "unset"}`,
        },
      ],
    });
  } else {
    // console.log("hte")
    // why does it doesnt update the content
    // updte the declarations
    // let ruleToUpdate = parsedCSS.stylesheet.rules[0].rules.filter((rule) => {
    //   // return the stylesheet without the inuse block;
    //   return rule.selectors.includes(obj.id);
    // });

    let updatedDeclarations = [
      {
        property: "height",
        value: `${percentage(obj.offsetHeight, previewScreen.offsetHeight)}cqh`,
      },
      {
        property: "width",
        value: `${percentage(obj.offsetWidth, previewScreen.offsetWidth)}cqw`,
      },
      {
        property: "top",
        value:
          obj.dataset.anchorVertical == "top"
            ? `${percentage(obj.offsetTop, previewScreen.offsetHeight)}cqh`
            : "unset",
      },
      {
        property: "bottom",
        value:
          obj.dataset.anchorVertical == "bottom"
            ? `${percentage(obj.offsetTop + obj.offsetHeight, previewScreen.offsetHeight)}cqh`
            : "unset",
      },
      {
        property: "left",
        value:
          obj.dataset.anchorHorizontal == "left"
            ? `${percentage(obj.offsetLeft, previewScreen.offsetWidth)}cqw`
            : "unset",
      },
      {
        property: "right",
        value:
          obj.dataset.anchorHorizontal == "right"
            ? `${percentage(obj.offsetLeft + obj.offsetWidth, previewScreen.offsetWidth)}cqw`
            : "unset",
      },
    ];

    // console.log(parsedCSS.stylesheet.rules[0].rules)
    parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
      if (rule.selectors && rule.selectors.includes(`#${obj.id}`)) {
        // Update existing declarations for the selectorToUpdate
        rule.declarations.forEach((declaration) => {
          updatedDeclarations.forEach((updatedDeclaration) => {
            if (declaration.property === updatedDeclaration.property) {
              declaration.value = updatedDeclaration.value;
            }
          });
        });
      }
    });

    // modifiedCSS = stringify(parsedCSS);
  }

  stylesheet.textContent = stringify(parsedCSS);

  // update rules

  //  if (parsedCSS.stylesheet.rules.length > 1) {
  //    console.log("there are rules yeah");
  //
  //     } else {
  //    console.log(`${obj} has no rule yet, let’s make one!`);
  //    // update  with the new data
  //    // // if the rule doesnt exist create a new one,
  //    // and return rule to update
  //  }
  //

  // parsedCSS.stylesheet.style.background = "red";
  // // console.log("parsedCSS", parsedCSS)
  // // console.log(obj, ruleToUpdate)
  // // console.log("1", parsedCSS.stylesheet.rules);
  // // parsedCSS.splice(rule)
  //
  // // // if the rule  exist update it a new one,
}

export function updateStylesheet(stylesheetContent, obj) {
  // parsestylesheet
  // TODO : check if there is the object in the global stylesheet object so.
  // const cssRules = parse(stylesheetContent);

  // console.log(isSelectorExistInContainers(cssRules, obj));

  //

  // rule.declarations.forEach(declaration => {
  // updatedDeclarations.forEach(updatedDeclaration => {
  //   if (declaration.property === updatedDeclaration.property) {
  //     declaration.value = updatedDeclaration.value;
  //   }
  // });

  // get the cssrule for the item, and change the width/heigh/left/right/top/bottom based on the  anchor.
  // anchor == stuff.anchor

  return console.log(
    `${obj} has been updated in stylesheet ${stylesheetContent}`,
  );

  // when selecting an object, look for its place in the stylesheet

  // get the new rule for the object.
  // find the object in the object
  // update the styles your need
  // reexport it
}

//chatgpt update declaration:
//
//
//
export function saveStylesheet(stylesheetId, data) {
  return axios
    .put(`${config.strapi.url}/api/stylesheets/${stylesheetId}`, {
      data: {
        cssrules: data,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
}

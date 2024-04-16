import axios from "axios";
import config from "../config/config.js";
import { parse, stringify } from "../vendors/css/css.js";
import { createData, updateData } from "./dataManagement.js";
import { deselect, percentage, updateDataset } from "./helpers";
import {
  screenHeightInput,
  screensList,
  screenWidthInput,
  screenRatioInput,
  newScreenForm,
  newScreenButton,
  stylesWrapper,
  previewScreen,
  populateStylesheetButton,
} from "./selectors";
import { screenListItem } from "./stylesheets/screenListItem";

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

/** stylesheet manager: create stylesheet listeners, load the existing stylesheet
 * @obj = stylesheet object
 */
export async function stylesheetmanager(obj) {
  let stylesheets = obj.data.attributes.stylesheets.data;
  const orderedStylesheets = sortByRatio(stylesheets);

  // load the stylesheets: add the style element and the screen object
  loadAllStylesheets(orderedStylesheets);

  // if there is no style sheet, create 4 basics
  if (orderedStylesheets.length == 0) {
    await kickstartStylesheet();
  }

  activateFirstStylesheet();

  // listen to the style stylesheet inputs
  // and the ui to switchstylesheet
  stylesheetListeners();

  //follow the resizing of the screen
  getSize();
}

/** event listener for the stylesheet ui
 */
export async function stylesheetListeners() {
  screensList.addEventListener("click", function(event) {
    /* remove stylesheet (disable in 2 times )*/
    // cancel remove if you click on something else
    if (!event.target.classList.contains("remove")) {
      document.querySelector(".toremove")?.classList.remove("toremove");
    }
    // remove stylesheet url
    if (event.target.classList == "remove") {
      // if remove is already selected, remove
      if (event.target.closest("li").classList.contains("toremove")) {
        removeStylesheet(event.target);
        // removfe the style object frtom the style block
        // document
        //   .querySelector(
        //     `#style-${event.target.closest(".stylesheet").dataset.strapid}`,
        //   )
        //   .remove();

        // remove the stylesheet from the ui
        event.target.closest("li").remove();
      } else {
        // delock the remove
        document.querySelector(".toremove")?.classList.remove("toremove");
        event.target.closest("li").classList.add("toremove");
      }
    } else if (event.target.classList.contains(".stylesheet")) {
      // activateStylesheet(event.target);
      // activate stylesheet if clicking on a stylesheet
      // style sheet activatiohn comes from the update of the preview
      resizePreview(
        previewScreen,
        event.target.closest(".stylesheet").dataset.maxwidth,
        event.target.closest(".stylesheet").dataset.defaultHeight,
        event.target.closest(".stylesheet").dataset.strapid,
      );
    } else if (event.target.closest(".stylesheet")) {
      // activateStylesheet(event.target.closest(".stylesheet"));
      // activate stylesheet if clicking on a stylesheet
      // style sheet activatiohn comes from the update of the preview
      resizePreview(
        previewScreen,
        event.target.closest(".stylesheet").dataset.maxwidth,
        event.target.closest(".stylesheet").dataset.defaultHeight,
        event.target.closest(".stylesheet").dataset.strapid,
      );
    }
  });
}

// set the button to add the default stylesheets
populateStylesheetButton.addEventListener("click", kickstartStylesheet);

// create a stylesheet: add it to the stylesheet list, and push content
newScreenForm.addEventListener("submit", async function(event) {
  event.preventDefault();
  // if (!validateInputs()) return console.log("screen size input are not valid");
  // validation is done in the html, and we don’t use the ratio
  // get the data from the form and from the inputs
  const data = {
    maxwidth: Number(screenWidthInput.value),
    sequenceId: sequenceNumber.textContent,
    defaultHeight: Number(screenHeightInput.value),
  };

  // create the stylesheet
  // const response = await createData(config.strapi.url, "stylesheets", data);
  await axios
    .post(`${config.strapi.url}/api/stylesheets/`, {
      data,
    })
    .then(async (response) => {
      const responsedata = response.data.data;
      const strapid = response.data.data.id;
      // set the screensize id on the preview to know where to save the data
      previewScreen.dataset.screensize = strapid;
      responsedata.strapid = response.data.data.id;

      responsedata.attributes.strapid = responsedata.id;

      // reorder the <style, following the ratio after added an element?
      await insertStylesheetToList(responsedata.attributes);
      // add stylesheet to the sequence,
      createStyleElement(responsedata);
    })
    .catch((err) => {
      if (err) return console.log(`nothing got saved`);
      return err;
    });
});

// set all the stylesheets: add them to the list, create the style elements
// export async function loadAllStylesheets(response) {
//   const stylesheets = response.data.data.attributes.stylesheets.data;
//
//   // sort: show all
//   const orderedstylesheets = stylesheets.sort((a, b) => {
//     // console.log(a.attributes.maxwidth);
//     return a.attributes.maxwidth - b.attributes.maxwidth;
//   });
//   orderedstylesheets.forEach((stylesheet, index) => {
//     stylesheet.attributes.strapid = stylesheet.id;
//     // add the stylesheets to the list
//     // console.log("noe", stylesheet)
//   });

// get the first stylesheet and activate it.
// }

/* load an array of stylesheets */
export function loadAllStylesheets(stylesheets) {
  const sortedStylesheets = sortByRatio(stylesheets, true);
  sortedStylesheets.forEach((stylesheet, index) => {
    stylesheet.prev = stylesheets[index - 1];
    stylesheet.next = stylesheets[index + 1];

    addStyleSheetToList(stylesheet);
    createStyleElement(stylesheet);
  });
}

function activateFirstStylesheet() {
  let stylesheetToActivate = document.querySelector("#screens .stylesheet");

  if (stylesheetToActivate) {
    // resize the preview once activated
    resizePreview(
      previewScreen,
      stylesheetToActivate.dataset.maxwidth,
      stylesheetToActivate.dataset.defaultHeight,
      stylesheetToActivate.dataset.strapid,
    );
    stylesheetToActivate.classList.add("activeStylesheet");
  } else {
    // TODO: create a default stylesheet?
  }
}

// this is different from the add list? how? why?
// because we send to strapi before adding it, so the content we have
// is the final one
async function insertStylesheetToList(data) {
  // deactivate the stylesheet and active the new one
  deselect(".activeStylesheet");
  const itemclasses = data.disabled ? "disabled" : "";

  const ratio = data.maxwidth / data.defaultHeight;

  let ratioBefore = [...screensList.querySelectorAll(".stylesheet")].findLast(
    (el) => {
      return el.dataset.maxwidth / el.dataset.defaultHeight > ratio;
    },
  );

  if (!ratioBefore) {
    // include the element at the beginning of the block
    screensList
      .querySelector("li")
      .insertAdjacentHTML("afterend", screenListItem(data, itemclasses, true));
  } else {
    ratioBefore.insertAdjacentHTML(
      "afterend",
      screenListItem(data, itemclasses, true),
    );
  }

  // get the max-width of the element

  // () and place the element just before the stylesheet with a bigger screen
  // place the element to the ratio!

  // let nextMaxWidth = [...screensList.querySelectorAll("li")].findLast((el) => {
  //   return Number(el.dataset.maxwidth) < Number(newMaxWidth);
  // });
  // console.log("next", nextMaxWidth);

  // if (nextMaxWidth.length > 0) {
  //   // create a item in the screens list
  //   screensList
  //     .querySelector(".activeStylesheet")
  //     ?.classList.remove("activeStylesheet");
  //   nextMaxWidth[0]?.insertAdjacentHTML(
  //     "beforebegin",
  //     screenListItem(data, itemclasses, true),
  //   );
  // } else {
  //   screensList
  //     .querySelector(".activeStylesheet")
  //     ?.classList.remove("activeStylesheet");
  //   screensList.insertAdjacentHTML(
  //     "beforeend",
  //     screenListItem(data, itemclasses, true),
  //   );
  // }

  // selectAdded;
}

/** add the stylesheet to the list UI */
export function addStyleSheetToList(data) {
  console.log(data.attributes.disabled);
  const itemclasses = data.attributes.disabled ? "disabled" : "";
  /*if the stylesheet has been disabled*/
  if (data.disabled) return;

  data.attributes.strapid = data.id;

  screensList.insertAdjacentHTML(
    "beforeend",
    screenListItem(data.attributes, itemclasses),
  );

  //set the whole thing
}

export async function removeStylesheet(target) {
  const id = target.closest("li").dataset.strapid;

  const data = {
    disabled: true,
  };

  const response = axios
    .put(`${config.strapi.url}/api/stylesheets/${id}`, {
      data,
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      return err;
    });

  // remove the style element from the screen
  document.querySelector(`#style-${id}`).remove();

  activateFirstStylesheet();
  return response;
}

export function updateScreenSizeFromUi(screenWidthInput, screenHeightInput) {
  // update ratio
  // update previewsize
}

// this should also go into stylesheet.js
export function getSize() {
  const screenSizeObserver = new ResizeObserver((screensizes) => {
    for (const screensize of screensizes) {
      if (!screensList.querySelector(".stylesheet"))
        return console.log("there is no stylesheet, dont try");
      if (screensize.contentBoxSize) {
        let newWidth = Math.round(screensize.contentBoxSize[0].inlineSize);
        let newHeight = Math.round(screensize.contentBoxSize[0].blockSize);

        //update the ui
        screenWidthInput.value = newWidth;
        screenHeightInput.value = newHeight;
        screenRatioInput.value = (newWidth / newHeight).toFixed(2);

        // update preview dataset
        previewScreen.dataset.width = newWidth;
        previewScreen.dataset.height = newHeight;

        // select the stylesheet on resize
        let stylesheetToEdit = selectScreen(newWidth / newHeight);

        // hightlight the stylesheet in the wrapper.
        deselect(".activatedStyle");

        // this is not working there
        stylesWrapper
          .querySelector(`#style-${stylesheetToEdit}`)
          .classList.add("activatedStyle");
      }
    }
  });
  screenSizeObserver.observe(previewScreen);
}

function activateStylesheet(stylesheet) {
  screensList
    .querySelector(".activeStylesheet")
    ?.classList.remove("activeStylesheet");
  deselect(".activatedStyle");
  stylesWrapper
    .querySelector(`#style-${stylesheet.dataset.strapid}`)
    .classList.add("activatedStyle");

  // deselect any object when changing stylesheet
  document.querySelector(".asset-selected")?.classList.remove("asset-selected");
  stylesheet.classList.add("activeStylesheet");
}

function selectScreen(ratio) {
  // deselect(".closeTo");
  // console.log(ratio);
  deselect(".activeStylesheet");

  let toActivate = [...screensList.querySelectorAll(".stylesheet")].findLast(
    (el) => {
      return ratio <= el.dataset.maxwidth / el.dataset.defaultHeight;
    },
  );

  // active = stylesheet you’re writting on.
  // so if you have 0.41 active, you write smaller than 0.41, then smaller than 0.75, then smaller
  // if first : up to 0.41, then between 0.41 and 0.76, .....  more than the last
  if (!toActivate) {
    toActivate = screens.querySelector(".stylesheet");
    // oif there is no stylesheet to activate do nothing.
    if (!toActivate) return;
    toActivate.classList.add("activeStylesheet");
    return toActivate.dataset.strapid;
  } else {
    toActivate.classList.add("activeStylesheet");
    return toActivate.dataset.strapid;
  }
}

export function createStyleElement(stylesheet) {
  console.log(stylesheet);
  // if the stylesheet is deactivated
  if (stylesheet.attributes.disabled) return;
  // prev,next
  /* the style element */

  const styleEl = `<style data-strapid="${stylesheet.id}" type="text/css" contenteditable id="style-${stylesheet.id}" 
data-height="${stylesheet.attributes.defaultHeight}"
data-width="${stylesheet.attributes.maxwidth}">

${stylesheet.attributes.cssrules?.length > 1 ? stylesheet.attributes.cssrules : `@container preview (max-aspect-ratio: ${getRatioFromStylesheet(stylesheet)}) {  }`} </style>`;

  const stylelist = stylesWrapper.querySelectorAll("style");

  console.log("list", stylelist);

  if (stylelist > 0) {
    const beforeStyle = [...stylesWrapper.querySelectorAll("style")].findLast(
      (style) => {
        style.dataset.width / style.dateset.height >=
          stylesheet.attributes.maxwidth / stylesheet.attributes.defaultHeight;
      },
    );
    beforeStyle.insertAdjacentHTML("afterend", styleEl);

    // if (stylelist < 1) {
  } else {
    //
    //   console.log(beforeStyle);

    stylesWrapper.insertAdjacentHTML("beforeend", styleEl);
  }
  // for each stylesheet, create a style element and feel it up
  //

  // find the previous element to add the style sheet at  teh right place

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
  const sortedStylesheets = stylesheets
    .filter((sheet) => {
      return !sheet.attributes.disabled;
    })
    .sort((a, b) => {
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
  console.log(stylesheet);

  // console.log("i did something");
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
}

export async function saveStylesheet(stylesheetId, data) {
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

/** change the orientation of the preview
 */
export function changeOrientation(previewEl) {
  const width = previewEl.style.getPropertyValue("width");
  const height = previewEl.style.getPropertyValue("height");
  previewEl.style.setProperty("width", height);
  previewEl.style.setProperty("height", width);
}

export function resizePreview(previewEl, width, height, strapid) {
  if (!previewEl) return console.log("no preview El!");
  // previewEl.querySelector().style.width
  previewEl.style.width = "var(--preview-width)";
  previewEl.style.height = "var(--preview-height)";
  previewEl.style.setProperty("--preview-width", width + `px`);
  previewEl.style.setProperty("--preview-height", height + `px`);
  // screensize let you know where to save the data
  previewEl.dataset.screensize = strapid;
}

export async function kickstartStylesheet() {
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
    // {
    //   maxwidth: "1368",
    //   defaultHeight: "768",
    //   default: true,
    //   sequenceId: sequenceNumber.textContent,
    // },
  ];

  // check stylesheet

  resolutions.map(async (rez) => {
    const response = await createData(config.strapi.url, "stylesheets", rez);
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

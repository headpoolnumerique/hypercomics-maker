import axios from "axios";
import { hideLogin } from "../api/login.js";
import config from "../config/config.js";
import { parse, stringify } from "../vendors/css/css.js";
import { deepSearchByKey } from "./assetManipulation.js";
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
  cleanStylesheetButton,
} from "./selectors";
import { screenListItem } from "./stylesheets/screenListItem";

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
<<<<<<< HEAD

    hideLogin();
  }

  activateFirstStylesheet();

  // listen to the style stylesheet inputs
  // and the ui to switchstylesheet
  stylesheetListeners();

  //follow the resizing of the screen
  getSize();

=======
  }

  activateFirstStylesheet();

  // listen to the style stylesheet inputs
  // and the ui to switchstylesheet
  stylesheetListeners();

  //follow the resizing of the screen
  getSize();

>>>>>>> main
  cleanStylesheetButton.addEventListener("click", cleanStyleSheet);
}

/** event listener for the stylesheet ui
 */
export async function stylesheetListeners() {
  // set the button to add the default stylesheets
  populateStylesheetButton.addEventListener("click", kickstartStylesheet);

  screensList.addEventListener("click", function (event) {
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

  // create a stylesheet: add it to the stylesheet list, and push content
  newScreenForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    // if (!validateInputs()) return console.log("screen size input are not valid");
    // validation is done in the html, and we don’t use the ratio
    // get the data from the form and from the inputs
    const data = {
      maxwidth: screenWidthInput.value,
      sequenceId: sequenceNumber.textContent,
      defaultHeight: screenHeightInput.value,
    };

    // create the stylesheet
    // const response = await createData(config.strapi.url, "stylesheets", data);
    await axios
      .post(`${config.strapi.url}/api/stylesheets/`, {
        data,
      })
      .then((response) => {
        console.log(response);
        const responsedata = response.data.data;
        const strapid = response.data.data.id;
        // set the screensize id on the preview to know where to save the data
        previewScreen.dataset.screensize = strapid;
        responsedata.strapid = response.data.data.id;

        responsedata.attributes.strapid = responsedata.id;

        console.log("now", responsedata);
        // reorder the <style, following the ratio after added an element?
        // reorder the <style, following the ratio after added an element?
        createStyleElement(response.data.data);
        insertStylesheetToList(response.data.data);
      })
      .catch((err) => {
        if (err) return console.log(`nothing got saved because:`, err);
      });
  });
}
/* load an array of stylesheets */
export function loadAllStylesheets(stylesheets) {
  const sortedStylesheets = sortByRatio(stylesheets, true);
  sortedStylesheets.forEach((stylesheet, index) => {
    stylesheet.prev = stylesheets[index - 1];
    stylesheet.next = stylesheets[index + 1];

    // if the stylesheet is the first, change the ratio size to be more than the previous inste
    // set min instead of max
    //
    addStyleSheetToList(stylesheet);
    createStyleElement(stylesheet);

    // create the stylesheet that will be use when no stylesheet is available?
    createDefaultStylesheet();
    //function to add a default stylesheet = the content will always be the same as the first Style element
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
    // there is no stylesheet here. would you mind creating a new one?
    // let question = document.createElement("div");
    // question.innerHTML = `<p>create a stylesheet?</p><button id="yescreate">yes</button><button id="createNo">no</button></p>`
    // create a modal: do you want to create a stylesheet? yes? create?
    // no go back to the previous ratio.
  }
}

// this is different from the add list? how? why?
// because we send to strapi before adding it, so the content we have
// is the final one
function insertStylesheetToList(data) {
  // deactivate the stylesheet and active the new one
  deselect(".activeStylesheet");
  const itemclasses = data.attributes.disabled ? "disabled" : "";

  const ratio = data.attributes.maxwidth / data.attributes.defaultHeight;

  let ratioBefore = [...screensList.querySelectorAll(".stylesheet")].findLast(
    (el) => {
      return el.dataset.maxwidth / el.dataset.defaultHeight > ratio;
    },
  );

  if (!ratioBefore) {
    // include the element at the beginning of the block
    screensList
      .querySelector("li")
      .insertAdjacentHTML(
        "afterend",
        screenListItem(data.attributes, itemclasses, true),
      );
  } else {
    ratioBefore.insertAdjacentHTML(
      "afterend",
      screenListItem(data.attributes, itemclasses, true),
    );
  }
}

/** add the stylesheet to the list UI */
export function addStyleSheetToList(data) {
  // console.log(data.attributes.disabled);
  const itemclasses = data.attributes.disabled ? "disabled" : "";
  /*if the stylesheet has been disabled*/
  if (data.disabled) return;

  data.attributes.strapid = data.id;

  //add the stylesheet to the stylesheet block
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
      // console.log(response);
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
<<<<<<< HEAD
        return console.log("there is no stylesheet, do nothing");
=======
        return console.log("there is no stylesheet, dont try");
>>>>>>> main
      if (screensize.contentBoxSize) {
        let newWidth = Math.round(screensize.contentBoxSize[0].inlineSize);
        let newHeight = Math.round(screensize.contentBoxSize[0].blockSize);

        //update the ui
        screenWidthInput.value = newWidth;
        screenHeightInput.value = newHeight;
        screenRatioInput.value = (newWidth / newHeight).toFixed(3);

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
  deselect(".activatedStyle");
  // check if the stylesheet is the first. if true= then max-aspect needs to become min-from before

  // console.log(stylesheet);
  // if the stylesheet is deactivated
  if (stylesheet.attributes.disabled) return;
  // prev,next
  /* the style element */

  const styleEl = `<style class="activatedStyle"  data-strapid="${stylesheet.id}" type="text/css" contenteditable id="style-${stylesheet.id}" 
data-height="${stylesheet.attributes.defaultHeight}"
data-width="${stylesheet.attributes.maxwidth}">

${stylesheet.attributes.cssrules?.length > 1 ? stylesheet.attributes.cssrules : `@container preview (max-aspect-ratio: ${getRatioFromStylesheet(stylesheet)}) {  }`} </style>`;

  const stylelist = stylesWrapper.querySelectorAll("style");

  if (stylelist.length > 0) {
    const beforeStyle = [...stylesWrapper.querySelectorAll("style")].find(
      (style) => {
        // return el.dataset.maxwidth / el.dataset.defaultHeight > ratio;
        return (
          style.dataset.width / style.dataset.height <
          stylesheet.attributes.maxwidth / stylesheet.attributes.defaultHeight
        );
      },
    );

    if (beforeStyle) {
      beforeStyle.insertAdjacentHTML("beforebegin", styleEl);
    } else {
      stylesWrapper.insertAdjacentHTML("beforeend", styleEl);
    }
  } else {
    stylesWrapper.insertAdjacentHTML("beforeend", styleEl);
  }
}

export function getRatioFromStylesheet(stylesheet) {
  return (
    stylesheet.attributes.maxwidth / stylesheet.attributes.defaultHeight +
    0.01
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

export function isSelectorExistInContainers(parsedCSS, selector) {
  // check if the selector exists in the parsesCSS
  // maybe add a check to find the type of the parsedCSS object?
  // if it’s a string parse it?
  let selectorExists = false;
  parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
    if (rule.selectors && rule.selectors.includes(`#${selector}`)) {
      selectorExists = true;
    }
  });

  return selectorExists;
}

/*find anchor for an object*/

export function findAnchors(objID, parsedCSS) {
  let anchors = {};

  parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
    if (rule.selectors && rule.selectors.includes(`#${objID}`)) {
      rule.declarations.forEach((declaration) => {
        if (declaration.property == "--anchor-horizontal") {
          anchors.horizontal = declaration.value;
        }
        if (declaration.property == "--anchor-vertical") {
          anchors.vertical = declaration.value;
        }
      });
    }
  });
  anchors = {
    vertical: anchors.vertical ? anchors.vertical : "top",
    horizontal: anchors.horizontal ? anchors.horizontal : "left",
  };
  return anchors;
}

/**
 * function to find the object in a stylesheet, and if it doesnt exist, create it
 * @param stylesheet: style Element to update
 * @param obj: html object to update
 */
export function setObjInStylesheet(stylesheet, obj) {
  let parsedCSS = parse(stylesheet.textContent);

  // console.log(obj);
  // console.log(obj.id);
  // find vertical anchor

  let anchors = findAnchors(obj.id, parsedCSS);

  //check anchor: if there is a left, if there is a right

  const anchorVertical = anchors.vertical;
  const anchorHorizontal = anchors.horizontal;

  const declarations = [
    {
      type: "declaration",
      property: "width",
      value: `${parseFloat(percentage(obj.offsetWidth, previewScreen.offsetWidth)).toFixed(2)}cqw`,
    },
    {
      type: "declaration",
      property: "height",
      value: `${parseFloat(percentage(obj.offsetHeight, previewScreen.offsetHeight)).toFixed(2)}cqh`,
    },
  ];

  // find the verticalanchor and horizontalanchor
  //

  //check anchor vertical

  switch (anchorVertical) {
    case "top":
      declarations.push({
        type: "declaration",
        property: "bottom",
        value: `unset`,
      });
      declarations.push({
        type: "declaration",
        property: "top",
        value: `${parseFloat(percentage(obj.offsetTop, previewScreen.offsetHeight)).toFixed(2)}cqh`,
      });
      break;
    case "bottom":
      declarations.push({
        type: "declaration",
        property: "top",
        value: `unset`,
      });
      declarations.push({
        type: "declaration",
        property: "bottom",
        value: `${parseFloat(100 - percentage(obj.offsetTop + obj.offsetHeight, previewScreen.offsetHeight)).toFixed(2)}cqh`,
      });
  }

  switch (anchorHorizontal) {
    case "left":
      declarations.push({
        type: "declaration",
        property: "right",
        value: `unset`,
      });
      declarations.push({
        type: "declaration",
        property: "left",
        value: `${parseFloat(percentage(obj.offsetLeft, previewScreen.offsetWidth)).toFixed(2)}cqw`,
      });
      break;

    case "right":
      declarations.push({
        type: "declaration",
        property: "left",
        value: `unset`,
      });

      declarations.push({
        type: "declaration",
        property: "right",
        value: `${parseFloat(100 - percentage(obj.offsetLeft + obj.offsetWidth, previewScreen.offsetWidth)).toFixed(2)}cqw`,
      });
      break;
  }

  // if there is no rule for the object, create one
  if (!isSelectorExistInContainers(parsedCSS, obj.id)) {
    // create the obj in the stylesheet
    // we get the data from the stylesheet
    //
    // UPDATE ICI: CHECK the stylehseet here
    parsedCSS.stylesheet.rules[0].rules.push({
      type: "rule",
      selectors: [`#${obj.id}`],
      declarations: declarations,
    });
  } else {
    // why does it doesnt update the content
    // updte the declarations
    // let ruleToUpdate = parsedCSS.stylesheet.rules[0].rules.filter((rule) => {
    //   // return the stylesheet without the inuse block;
    //   return rule.selectors.includes(obj.id);
    // });
    // console.log(parsedCSS.stylesheet.rules[0].rules)
    //
    parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
      if (rule.selectors && rule.selectors.includes(`#${obj.id}`)) {
        // check if the declaration exist
        // deepSearchByKey(rule.declaration.prorperydf)
        // Update existing declarations for the selectorToUpdate
        rule.declarations.forEach((declaration) => {
          declarations.forEach((updatedDeclaration) => {
            if (
              deepSearchByKey(rule, "property", updatedDeclaration.property)
            ) {
              if (declaration.property === updatedDeclaration.property) {
                declaration.value = updatedDeclaration.value;
              }
            } else {
              //create the declaration if it doesnt exist
              rule.declarations.push({
                type: "declaration",
                property: updatedDeclaration.property,
                value: updatedDeclaration.value,
              });
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
<<<<<<< HEAD
=======
  if (stylesheetId == stylesWrapper.querySelector("style").dataset.strapid) {
    updateDefaultStylesheet();
  }
>>>>>>> main
  return await axios
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
    {
      maxwidth: "2000",
      defaultHeight: "1000",
      default: true,
      sequenceId: sequenceNumber.textContent,
    },
    {
      maxwidth: "2500",
      defaultHeight: "1000",
      default: true,
      sequenceId: sequenceNumber.textContent,
    },

    // {
    //
    //   maxwidth: "1368",
    //   defaultHeight: "768",
    //   default: true,
    //   sequenceId: sequenceNumber.textContent,
    // },
  ];

  // check stylesheet

  resolutions.map(async (rez) => {
    // const response = await createData(config.strapi.url, "stylesheets", );

    const response = axios
      .post(`${config.strapi.url}/api/stylesheets/`, {
        data: rez,
      })
      .then((response) => {
        console.log("things got saved");

        const responsedata = response.data.data.attributes;
        const strapid = response.data.data.id;

        previewScreen.dataset.screensize = strapid;
        responsedata.strapid = response.data.data.id;
        // create styleElement and stylesheet
        // console.log(response.data.data);
        createStyleElement(response.data.data);
        insertStylesheetToList(response.data.data);

        // return response;
      })
      .catch((err) => {
        return console.log(`nothing got saved`);
      });

    // add stylesheet to the sequence,
  });

  // on load check if the table with the content is empty
  // if empty, add stylesheet
}

// clean the stylesheet: remove all the rules that have no elements.
export function cleanStyleSheet() {
  stylesWrapper.querySelectorAll("style").forEach((style) => {
    const styles = parse(style.textContent);

    styles.stylesheet.rules[0].rules = styles.stylesheet.rules[0].rules.filter(
      (rule) => {
        if (!document.querySelector(rule.selectors[0])) {
          return false; // Remove this rule
        }
        return true; // Keep other rules
      },
    );

    // clean the content
    style.textContent = stringify(styles);

    // update to strapi now
    saveStylesheet(style.dataset.strapid, style.textContent);
  });
}

// save all the stylesheet: send all the code to strapi!
export function saveAllStylesheet() {
  stylesWrapper.querySelectorAll("style").forEach((style) => {
    saveStylesheet(style.dataset.strapid, style.textContent);
  });
}

// set the property in the selected stylesheet
export function setPropertyInStylesheet(
  selectedObject,
  styleElement,
  property,
  value,
) {
  // make sure an object is selected
  let selected = selectedObject
    ? selectedObject
    : document.querySelector(".asset-selected");
  // if nothihng is selected, bye
  if (!selected) {
    return console.log("there is no element selected");
  }

  // parse le css, make it an object
  let parsedcss = parse(
    styleElement
      ? styleElement.innerHTML
      : document.querySelector(".activatedStyle").textContent,
  );

  // if the selector doesn’t exist, creates it and set the rule for the anchor?
  // so this is what should be checked:
  // first: found the declartion in the rule within
  // if there is a selector change this
  // if there is no selector, create it and add the declaration css

  if (!isSelectorExistInContainers(parsedcss, selected.id)) {
    // get the rule with the
    parsedcss.stylesheet.rules[0].rules.push({
      type: "rule",
      selectors: [`#${selected.id}`],
      declarations: [
        {
          type: "declaration",
          property: property,
          value: value,
        },
      ],
    });
  } else {
    // if the selector exist but there is no vertical / horizontal anchor, set both
    // check if the anchor vertical and horizontal exist
    parsedcss.stylesheet.rules[0].rules.forEach((rule) => {
      if (rule.selectors && rule.selectors.includes(`#${selected.id}`)) {
        //if there is a propery, return
        if (!deepSearchByKey(rule, "property", property)) {
          console.log(`there is no ${property}, we’re creating now`);
          rule.declarations.push({
            type: "declaration",
            property: property,
            value: value,
          });
        }
      }
    });
    // if selector exit
    // check if there is a rule with this selector
  }

  // else the stylesheet exist / now the stylesheet exist
  parsedcss.stylesheet.rules[0].rules.forEach((line) => {
    if (!line.selectors.includes(`#${selected.id}`)) return;
    line.declarations.forEach((declaration) => {
      if (declaration.property == property) {
        declaration.value = value;
      }
    });
  });
  document.querySelector(".activatedStyle").textContent = stringify(parsedcss);
  // save the stylesheet
  // saves
  saveStylesheet(
    document.querySelector(".activatedStyle").dataset.strapid,
    document.querySelector(".activatedStyle").textcontent,
  );
}

// create the default stylesheet that contains all the previous one
function createDefaultStylesheet() {
  if (!document.querySelector("#style-default")) {
    let style = document.createElement("style");
    style.id = "style-default";
    document.head.insertAdjacentElement("beforeend", style);
  }

  let defaultStylesheet = parse(
    stylesWrapper.querySelector("style").textContent,
  );
  defaultStylesheet.stylesheet.rules =
    defaultStylesheet.stylesheet.rules[0].rules;

  document.querySelector("#style-default").textContent =
    stringify(defaultStylesheet);

  // = stylesWrapper.querySelector("style").textContent).stylesheet.rules[0]))
<<<<<<< HEAD
=======
}

// update the default stylesheet everytimes the styles get changed?
// or only if the change happens in the first stylesheet
export function updateDefaultStylesheet() {
  let defaultStylesheet = parse(
    stylesWrapper.querySelector("style").textContent,
  );
  defaultStylesheet.stylesheet.rules =
    defaultStylesheet.stylesheet.rules[0].rules;
  document.querySelector("#style-default").textContent =
    stringify(defaultStylesheet);
>>>>>>> main
}

/*
selectedObj: selected html obj (not an array)
declarations: array of declarations
now set the declarations to the object/stylesheet on end on both resizable and moveable
*/

// NOW
// NOW DO THE LINE 4

export function updateDeclaration(selectedId, declarations) {
  const parsedCSS = parse(
    document.querySelector(".activatedStyle").textContent,
  );
  /* if there is no declarations for this id*/
  if (!isSelectorExistInContainers(parsedCSS, selectedId)) {
    // get the rule with the
    parsedCSS.stylesheet.rules[0].rules.push({
      type: "rule",
      selectors: [`#${selectedId}`],
      declarations: declarations,
    });
  } else {
    // if the selector exist but there is no declarations for those declaration
    parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
      if (rule.selectors && rule.selectors.includes(`#${selectedId}`)) {
        declarations.forEach((newRule) => {
          //if there is a propery, return
          if (!deepSearchByKey(rule, "property", newRule.property)) {
            rule.declarations.push(newRule);
          }

          if (!deepSearchByKey(rule, "property", newRule.property)) {
            rule.declarations.push({
              type: "declaration",
              property: newRule.property,
              value: newRule.value,
            });
          }
        });
      }
    });
    // if selector exit
    // check if there is a rule with this selector
  }

  declarations.forEach((newRule) => {
    // else the stylesheet exist / now the stylesheet exist
    parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
      if (!rule.selectors.includes(`#${selectedId}`)) return;
      rule.declarations.forEach((declaration) => {
        if (declaration.property == newRule.property) {
          declaration.value = newRule.value;
        }
      });
    });
  });
  document.querySelector(".activatedStyle").textContent = stringify(parsedCSS);
  // save the stylesheet
  saveStylesheet(
    document.querySelector(".activatedStyle").dataset.strapid,
    document.querySelector(".activatedStyle").textContent,
  );
}

// function to add the css for the duplicated elements
//to duplicate a function, duplicate the css of the stylesheet with the new id.
// use
export function cloneStylesheetRules(stylesheetObj, previousId, newId) {
  let parsedCSS = parse(stylesheetObj.textContent);

  let declarations = [];

  parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
    if (!rule.selectors.includes(`#${previousId}`)) return;
    rule.declarations.forEach((declaration) => {
      // console.log(declaration);
      declarations.push(declaration);
    });
  });

  parsedCSS.stylesheet.rules[0].rules.push({
    type: "rule",
    selectors: [`#${newId}`],
    declarations: declarations,
  });

  stylesheetObj.textContent = stringify(parsedCSS);
}

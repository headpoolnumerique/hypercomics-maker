import { reorderObjectInPlan, removeObjectFromPlan } from "./dataManagement.js";
import interact from "interactjs";
import config from "../config/config.js";
import axios from "axios";
import {
  findAnchors,
  isSelectorExistInContainers,
  saveStylesheet,
  setObjInStylesheet,
  setPropertyInStylesheet,
} from "./stylesheet.js";

import {
  inputBottom,
  inputHeight,
  inputLeft,
  inputRight,
  inputTop,
  inputWidth,
  previewScreen,
} from "./selectors.js";

import { parse, stringify } from "../vendors/css/css.js";

export function moveToLayer(object, plan, position) {
  // move any object to a specific layer

  switch (position) {
    case "farest":
      reorderObjectInPlan(
        config.strapi.url,
        plan.id.split("-")[1],
        object.dataset.objectid,
        "farest",
      )
        .then(plan.insertAdjacentElement("afterbegin", object))
        .catch((error) => {
          if (error) {
            console.log(error);
          }
        });
      break;

    case "closest":
      reorderObjectInPlan(
        config.strapi.url,
        plan.id.split("-")[1],
        object.dataset.objectid,
        "closest",
      )
        .then(plan.insertAdjacentElement("beforeend", object))
        .catch((error) => {
          if (error) {
            console.log(error);
          }
        });
      break;

    case "closer":
      if (object?.nextElementSibling != null) {
        reorderObjectInPlan(
          config.strapi.url,
          plan.id.split("-")[1],
          object.dataset.objectid,
          "after",
          object.nextElementSibling.dataset.objectid,
        )
          .then(
            object.nextElementSibling.insertAdjacentElement("afterend", object),
          )
          .catch((error) => {
            if (error) {
              console.log(error);
            }
          });
      }
      break;

    case "farther":
      if (object.previousElementSibling != null) {
        reorderObjectInPlan(
          config.strapi.url,
          plan.id.split("-")[1],
          object.dataset.objectid,
          "before",
          object.previousElementSibling.dataset.objectid,
        )
          .then(
            object.previousElementSibling.insertAdjacentElement(
              "beforebegin",
              object,
            ),
          )
          .catch((error) => {
            if (error) {
              console.log(error);
            }
          });
      }
      break;
  }

  // check plan total layer and save it as plan.dataset.layersTotal
  // do we need to know the total amount if we only move them and save their exact places?
  // not so sure. We can simply move thing, and not send if it’s first going back or last going top.

  if (!plan.dataset.layersTotal) {
    plan.dataset.layersTotal = plan.querySelectorAll(".object").length;
  }
  // console.log(plan.dataset.layersToral)
  const totalLayer = plan.dataset.layersTotal;
  // (is it really needed)

  // check asset layer
  // when added, and asset needs to have the layer (using the index of the relation when adding the image to the plan)
  // if you want to Zmove an asset. if the selected in the latest, it can only go toward 0, if it’s 0, it can oly go toward the final one.
  //

  // reorder layer
  // move the element at his position: position in the html = order
  // no z-index involve!

  // move the element on the right layer (moveAfter, moveBefore)
}

/*
deteleAsset
@params domObject asset - the removedasset 
*/
export async function deleteObject() {
  const plan = document.querySelector("#previewScreen article.shown");
  const object = document.querySelector(".asset-selected");
  // send info to strapi
  removeObjectFromPlan(
    config.strapi.url,
    plan.id.split("-")[1],
    object.dataset.objectid,
  ).then(
    // TODO remove the object from all the stylesheet? or add a clean button?
    // or clean on load?

    object.remove(),
  );
}

// not use anymore because we’re not saving the object now
export function addRuleToObject(objectid, data) {
  return axios
    .put(`${config.strapi.url}/api/objects/${objectid}`, {
      data,
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      return err;
    });
}

// get percentage
export function percentage(partialValue, totalValue) {
  return ((100 * partialValue) / totalValue).toFixed(2);
}

/**
 * update the locations of the element from the UI. warnin, it’s not set up to check the anchor */

export function updatefromui() {
  [
    inputTop,
    inputRight,
    inputLeft,
    inputBottom,
    inputHeight,
    inputWidth,
  ].forEach((el) => {
    el.addEventListener("change", (event) => {
      let selected = document.querySelector(".asset-selected");
      if (!selected) {
        return console.log("nothing to update");
      }

      setObjFromUi(document.querySelector(".activatedStyle"), selected);
      // const parsedCSS = parse(
      //   document.querySelector(".activatedStyle").textContent,
      // );

      // setObjInStylesheet(selected, stylesheet);
      //
      //
      //
    });
  });
}

export function checkPropertyValueFromStylesheet(
  selectedObject,
  styleElement,
  property,
) {
  // if there is no selection, select the object
  let selected = selectedObject
    ? selectedObject
    : document.querySelector(".asset-selected");

  // set parse style
  let parsedcss = parse(
    styleElement
      ? styleElement.innerHTML
      : document.querySelector(".activatedStyle").textContent,
  );

  if (!isSelectorExistInContainers(parsedcss, selected.id)) {
    // get the rule with the
    console.log("the selector n’existe pas");
    return undefined;
  }

  let out;
  // parsedcss.stylesheet.rules[0].rules.forEach((rule) => {
  parsedcss.stylesheet.rules[0].rules.forEach((line) => {
    if (!line.selectors.includes(`#${selected.id}`)) return undefined;
    line.declarations.forEach((declaration) => {
      if (declaration.property == property) out = declaration.value;
    });
  });
  return out;
  //if there is a propery, return
  //check for the declarations!

  // find the rule that has the selector
  // check if the rule has the propertydeclaration
  // return value or undefined
}

// keep
// parse le css, make it an object

// if the selector doesn’t exist, creates it and set the rule for the anchor?
// so this is what should be checked:
// first: found the declartion in the rule within
// if there is a selector change this
// if there is no selector, create it and add the declaration css

export function getValueOfNestedProperty(obj, key) {
  // Check if the key exists in the current object
  if (obj.hasOwnProperty(key)) {
    return obj[key];
  }

  // Iterate through nested objects to search for the key
  for (let prop in obj) {
    // If the property is an object, recursively search it
    if (typeof obj[prop] === "object") {
      const result = deepSearchForKey(obj[prop], key);
      if (result !== undefined) {
        return result;
      }
    }
  }

  // If the key is not found anywhere, return undefined
  return undefined;
}

export function setObjFromUi(stylesheet, obj) {
  let parsedCSS = parse(stylesheet.textContent);

  console.log(obj);
  console.log(obj.id);
  // find vertical anchor

  let anchors = findAnchors(obj.id, parsedCSS);

  console.log("anchres", anchors);
  //check anchor: if there is a left, if there is a right

  const anchorVertical = anchors.vertical;
  const anchorHorizontal = anchors.horizontal;

  const declarations = [
    {
      type: "declaration",
      property: "width",
      value: `${inputWidth.value}cqw`,
    },
    {
      type: "declaration",
      property: "height",
      value: `${inputHeight.value}cqh`,
    },
  ];

  // find the verticalanchor and horizontalanchor
  //

  //check anchor vertical

  switch (anchorVertical) {
    case "top":
      declarations.push(
        {
          type: "declaration",
          property: "bottom",
          value: `unset`,
        },
        {
          type: "declaration",
          property: "top",
          value: `${inputTop.value}cqh`,
        },
      );
      break;
    case "bottom":
      declarations.push(
        {
          type: "declaration",
          property: "top",
          value: `unset`,
        },
        {
          type: "declaration",
          property: "bottom",
          value: `${inputBottom.value}cqh`,
        },
      );
  }

  switch (anchorHorizontal) {
    case "left":
      declarations.push(
        {
          type: "declaration",
          property: "right",
          value: `unset`,
        },
        {
          type: "declaration",
          property: "left",
          value: `${inputLeft.value}cqw`,
        },
      );
      break;

    case "right":
      declarations.push(
        {
          type: "declaration",
          property: "left",
          value: `unset`,
        },
        {
          type: "declaration",
          property: "right",
          value: `${inputRight.value}cqw`,
        },
      );
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
        // Update existing declarations for the selectorToUpdate
        rule.declarations.forEach((declaration) => {
          declarations.forEach((updatedDeclaration) => {
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

  saveStylesheet(stylesheet.dataset.strapid, stylesheet.textContent);
}

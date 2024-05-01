import { reorderObjectInPlan, removeObjectFromPlan } from "./dataManagement.js";
import interact from "interactjs";
import config from "../config/config.js";
import axios from "axios";
import {
  isSelectorExistInContainers,
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

import { parse } from "../vendors/css/css.js";

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
  // set X
  document.querySelector("#inputx").addEventListener("change", (event) => {
    // check if the --anchor vertical is top or bottom first
    const anchorHorizontal = checkPropertyValueFromStylesheet(
      document.querySelector(".asset-selected"),
      document.querySelector(".activatedStylesheet"),
      "--anchor-horizontal",
    );
    if (anchorHorizontal == "right") {
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "right",
        `${event.target.value}cqw`,
      );
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "left",
        "unset",
      );
    } else {
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "left",
        `${event.target.value}cqw`,
      );
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "right",
        "unset",
      );
    }
  });

  document.querySelector("#inputy").addEventListener("change", (event) => {
    const anchorVertical = checkPropertyValueFromStylesheet(
      document.querySelector(".asset-selected"),
      document.querySelector(".activatedStylesheet"),
      "--anchor-vertical",
    );
    if (anchorVertical == "bottom") {
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "bottom",
        `${event.target.value}cqh`,
      );
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "top",
        "unset",
      );
    } else {
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "top",
        `${event.target.value}cqh`,
      );
      setPropertyInStylesheet(
        document.querySelector(".asset-selected"),
        document.querySelector(".activatedStylesheet"),
        "bottom",
        "unset",
      );
    }
  });

  document.querySelector("#inputwidth").addEventListener("change", (event) => {
    setPropertyInStylesheet(
      document.querySelector(".asset-selected"),
      document.querySelector(".activatedStylesheet"),
      "width",
      `${event.target.value}cqw`,
    );
  });
  document.querySelector("#inputheight").addEventListener("change", (event) => {
    setPropertyInStylesheet(
      document.querySelector(".asset-selected"),
      document.querySelector(".activatedStylesheet"),
      "height",
      `${event.target.value}cqh`,
    );
  });
}

export function updateTheUI(element) {
  // update the ui from the selected element
  let previewScreen = document.querySelector("#previewScreen");
  let previewScreenSize = {
    height: previewScreen.offsetHeight,
    width: previewScreen.offsetWidth,
  };
  document.querySelector("#inputx").value = percentage(
    element.offsetLeft,
    previewScreenSize.width,
  );
  document.querySelector("#inputy").value = percentage(
    element.offsetTop,
    previewScreenSize.height,
  );
  document.querySelector("#inputwidth").value = percentage(
    element.width,
    previewScreenSize.width,
  );
  document.querySelector("#inputheight").value = percentage(
    element.height,
    previewScreenSize.height,
  );
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

// this code is for when you move an object on the page.
// it handles the move and resize and push the data to strapi.

import { reorderObjectInPlan, removeObjectFromPlan } from "./dataManagement.js";
import interact from "interactjs";
import config from "../config/config.js";
import axios from "axios";
import {
  anchors,
  inputLeft,
  inputTop,
  inputBottom,
  inputRight,
  inputWidth,
  inputHeight,
  previewScreen,
  stylesWrapper,
  anchorLeft,
  anchorTop,
  anchorRight,
  inputMakeHidden,
  inputMakeVisible,
} from "./selectors.js";
import {
  findAnchors,
  isSelectorExistInContainers,
  saveAllStylesheet,
  saveStylesheet,
  setObjInStylesheet,
} from "./stylesheet.js";
import { parse, stringify } from "../vendors/css/css.js";
import { setObjFromUi } from "./objectManipulations.js";

async function interactObject(object) {
  // there is a trouble when non selected object are moving
  // get the id of the stylesheet to update

  // get the id of the sequence
  let sequenceId = Number(
    document.querySelector("#sequenceNumber").textContent,
  );
  // find the previewscreen
  let previewScreen = document.querySelector("#previewScreen");

  // find the screen size to get %
  let previewScreenSize = {
    height: previewScreen.offsetHeight,
    width: previewScreen.offsetWidth,
  };

  let position = { x: object.offsetLeft, y: object.offsetTop };

  // TODO: in case of a small element, add an icon to resize and one to move

  interact(object)
    .draggable({
      listeners: {
        start(event) {
          position = { x: object.offsetLeft, y: object.offsetTop };
        },
        move(event) {
          if (!object.classList.contains("asset-selected")) {
            console.log(object + "will not move mtfk");
            return;
          }
          // dont move the element on the back screen
          if (!object.closest(".shown")) {
            console.log(object + "will not move mtfk");
            return;
          }
          // ((if anchor is set to bottom, use the bottom else use top))
          // ((if anchor is set to left, use the left else use right))

          position.x += event.dx;
          position.y += event.dy;

          event.target.style.left = `${percentage(
            position.x,
            previewScreenSize.width,
          )}cqw`;
          event.target.style.top = `${percentage(
            position.y,
            previewScreenSize.height,
          )}cqh`;
        },
        end(event) {
          updateTheUI(event.target);

          const styleblock = stylesWrapper.querySelector(".activatedStyle");

          setObjInStylesheet(styleblock, event.target);

          saveStylesheet(styleblock.dataset.strapid, styleblock.textContent);
          event.target.style = null;
        },
      },
    })

    .resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      invert: "reposition",
      modifiers: [
        interact.modifiers.aspectRatio({
          // this is supposed to help making sure the ratio is preserved
          // why not aspect ratio from the css height auto?
          // and use only the width of the element?
          // ratio: "preserve",
          // WE DON’T NEED IT BECAUSE WE FIX THE HEIGHT WITH CSS
        }),
      ],

      listeners: {
        start(event) {},
        move: function (event) {
          // parse the css
          // find the location for wisth and height
          // listen to the resize
          //

          // get the parsecss to get the attribute from the css

          // should we get a better setup to change the style sheet instead of the rest?
          let { x, y } = event.target.dataset;

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${percentage(event.rect.width, previewScreenSize.width)}cqw`,
            height: `${percentage(
              event.rect.height,
              previewScreenSize.height,
            )}cqh`,
            // width: `event.rect.width `,
            // height: `event.rect.height`,
            // transform: `translate(${parseFloat(x)}px, ${parseFloat(y)}px)`,
          });

          Object.assign(event.target.dataset, { x, y });
        },
        end: function (event) {
          updateTheUI(event.target);
          // add ruel to object
          // addRuleToObject(event.target.dataset.objectid, data);

          // set the style when resize!
          setObjInStylesheet(
            stylesWrapper.querySelector(".activatedStyle"),
            event.target,
          );

          const styleblock = stylesWrapper.querySelector(".activatedStyle");

          setObjInStylesheet(styleblock, event.target);

          saveStylesheet(styleblock.dataset.strapid, styleblock.textContent);
          event.target.style = null;
          // saveStylesheet(id, cssContent);
        },
      },
    });
}

// export function saveStylesheet(stylesheetId, cssContent) {
//   // axios.put(config.strapi.url)
// }

function moveToLayer(object, plan, position) {
  // v2: get the order from the index of the element in the domObject
  // further ------ closest
  // first  ------- last

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

  // console.log(object);
  // send info to strapi
  removeObjectFromPlan(
    config.strapi.url,
    plan.id.split("-")[1],
    object.dataset.objectid,
  ).then(object.remove());
}

function addRuleToObject(objectid, data) {
  return axios
    .put(`${config.strapi.url}/api/objects/${objectid}?populate=deep,5`, {
      data,
    })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
}

export function percentage(partialValue, totalValue) {
  return ((100 * partialValue) / totalValue).toFixed(2);
}

export function getValueOf(elementObj, property, parsedCSS) {
  let value;
  parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
    if (rule.selectors && rule.selectors.includes(`#${elementObj.id}`)) {
      rule.declarations.forEach((declaration) => {
        if (declaration.property == property) {
          value = declaration.value;
        } else {
          value = false;
        }
      });
    }
  });
  return value;
}

export function setVisibilityUI(element, parsedCSS) {
  let visible = getValueOf(element, "opacity", parsedCSS);

  // console.log(visible);

  if (!visible || visible == 1) {
    inputMakeHidden.classList.remove("hide");
    inputMakeVisible.classList.add("hide");
  } else {
    inputMakeHidden.classList.add("hide");
    inputMakeVisible.classList.remove("hide");
  }
}

export function updateTheUI(element) {
  let parsedCSS = parse(
    stylesWrapper.querySelector(".activatedStyle").textContent,
  );
  let anchors = findAnchors(element.id, parsedCSS);

  // get the visible / hide value of the object
  //
  setVisibilityUI(element, parsedCSS);

  // screensize
  let previewScreen = document.querySelector("#previewScreen");
  let previewScreenSize = {
    height: previewScreen.offsetHeight,
    width: previewScreen.offsetWidth,
  };
  inputLeft.value = percentage(element.offsetLeft, previewScreenSize.width);
  inputRight.value =
    100 -
    percentage(
      element.offsetLeft + element.offsetWidth,
      previewScreenSize.width,
    );
  inputTop.value = percentage(element.offsetTop, previewScreenSize.height);
  inputBottom.value =
    100 -
    percentage(
      element.offsetTop + element.offsetHeight,
      previewScreenSize.height,
    );
  inputWidth.value = percentage(element.width, previewScreenSize.width);
  inputHeight.value = percentage(element.height, previewScreenSize.height);

  if (anchors.vertical == "top") {
    inputTop.previousElementSibling.classList.remove("hide");
    inputTop.classList.remove("hide");
    inputBottom.previousElementSibling.classList.add("hide");
    inputBottom.classList.add("hide");
    anchorTop.classList.add("hide");
    anchorBottom.classList.remove("hide");
  } else {
    inputTop.previousElementSibling.classList.add("hide");
    inputTop.classList.add("hide");
    inputBottom.previousElementSibling.classList.remove("hide");
    inputBottom.classList.remove("hide");
    anchorTop.classList.remove("hide");
    anchorBottom.classList.add("hide");
  }
  if (anchors.horizontal == "left") {
    inputLeft.previousElementSibling.classList.remove("hide");
    inputLeft.classList.remove("hide");
    inputRight.previousElementSibling.classList.add("hide");
    inputRight.classList.add("hide");
    anchorRight.classList.remove("hide");
    anchorLeft.classList.add("hide");
  } else {
    inputRight.previousElementSibling.classList.remove("hide");
    inputRight.classList.remove("hide");
    inputLeft.previousElementSibling.classList.add("hide");
    inputLeft.classList.add("hide");
    anchorRight.classList.add("hide");
    anchorLeft.classList.remove("hide");
  }

  // console.log(anchors.vertical);
  anchors.vertical;
  //hide element if the object is set bottom / right?
}

export { interactObject, moveToLayer };

// TO DO: resize from the bottom/right edge should stick to the right move
// this may be impossible. THe example use the translate to define the location. maybe we should keep it.

// if true, return the id of the entry, else return false
async function isThereDeclaration(stylesheetId, objectId) {
  try {
    const response = await axios.get(
      `${config.strapi.url}/api/declarations?filters[stylesheet][id][$eq]=${stylesheetId}&filters[object][id][$eq]=${objectId}&populate=deep,8`,
    );

    if (response.data.meta.pagination.total > 1) {
      return response.data[0];
    } else if (response.data.meta.pagination.total == 1) {
      return response.data;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching declaration:", error);
    return false;
  }
}

async function updateDeclaration(
  declarationId,
  cssrules,
  anchorVertical = "top",
  anchorHorizontal = "left",
) {
  // get the id for the declaration from the response and use this to update the data

  return axios
    .put(`${config.strapi.url}/api/declarations/${declarationId}`, {
      data: {
        anchorVertical: anchorVertical,
        anchorHorizontal: anchorHorizontal,
        cssrules: cssrules,
      },
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      return err;
    });
}

// set anchor:
// if top : set --anchor-vertical: top and top: y.
// if bottom : set --anchor-vertical: bottom and botom: y.
// if left : set --anchor-horizontal: left and left: x.
// if bottom : set --anchor-horizontal: right and right: x.
export async function setAnchor() {
  // result off this setanchor should be the addition of a --verticalAnchor: "top" or "bottom"
  // and --horizontal-anchor: z"left" or "right". This will allow for simpler set up and a button instead of the value
  //
  // this is asset manipulation normally
  anchors.forEach((button) => {
    button.addEventListener("click", async function () {
      // make sure an object is selected
      let selected = document.querySelector(".asset-selected");

      if (!selected) {
        return console.log("there is no element selected");
      }

      // parse le css, make it an object
      let parsedCSS = parse(
        stylesWrapper.querySelector(".activatedStyle").textContent,
      );

      let declarations = [];

      switch (button.id) {
        case "anchorTop":
          declarations.push({
            type: "declaration",
            property: "--anchor-vertical",
            value: `top`,
          });

          declarations.push({
            type: "declaration",
            property: "bottom",
            value: `unset`,
          });

          declarations.push({
            type: "declaration",
            property: "top",
            value: `${parseFloat(percentage(selected.offsetTop, previewScreen.offsetHeight)).toFixed(2)}cqh`,
          });
          break;

        case "anchorBottom":
          declarations.push({
            type: "declaration",
            property: "--anchor-vertical",
            value: `bottom`,
          });

          declarations.push({
            type: "declaration",
            property: "top",
            value: `unset`,
          });

          declarations.push({
            type: "declaration",
            property: "bottom",
            value: `${parseFloat(100 - percentage(selected.offsetTop + selected.offsetHeight, previewScreen.offsetHeight)).toFixed(2)}cqh`,
          });
          break;

        case "anchorLeft":
          declarations.push({
            type: "declaration",
            property: "--anchor-horizontal",
            value: `left`,
          });

          declarations.push({
            type: "declaration",
            property: "right",
            value: `unset`,
          });

          declarations.push({
            type: "declaration",
            property: "left",
            value: `${parseFloat(percentage(selected.offsetLeft, previewScreen.offsetWidth)).toFixed(2)}cqw`,
          });
          break;

        case "anchorRight":
          declarations.push({
            type: "declaration",
            property: "--anchor-horizontal",
            value: `right`,
          });

          declarations.push({
            type: "declaration",
            property: "left",
            value: `unset`,
          });

          declarations.push({
            type: "declaration",
            property: "right",
            value: `${parseFloat(100 - percentage(selected.offsetLeft + selected.offsetWidth, previewScreen.offsetWidth)).toFixed(2)}cqw`,
          });
          break;
      }
      // console.log(declarations);

      // if the selector doesn’t exist, creates it and set the rule for the anchor?
      // so this is what should be checked:
      // first: found the declartion in the rule within
      // if there is a selector change this
      // if there is no selector, create it and add the declaration css
      if (!isSelectorExistInContainers(parsedCSS, selected.id)) {
        let newCSS = parsedCSS;
        // console.log(parsedCSS);
        // console.log("noselector exist yet");
        // get the rule with the
        newCSS.stylesheet.rules[0].rules.push({
          type: "rule",
          selectors: [`#${selected.id}`],
          declarations: declarations,
        });
      } else {
        // if the selector exist but there is no vertical / horizontal anchor, set both
        // check if the anchor vertical and horizontal exist
        parsedCSS.stylesheet.rules[0].rules.forEach((rule) => {
          if (rule.selectors && rule.selectors.includes(`#${selected.id}`)) {
            declarations.forEach((line) => {
              //if there is a propery, return
              if (!deepSearchByKey(rule, "property", line.property)) {
                console.log(
                  "there is no anchor horiztonal, we’re creating now",
                );
                rule.declarations.push(line);
              }

              if (!deepSearchByKey(rule, "property", line.property)) {
                console.log("there is no anchor vertical, we’re creating now");
                rule.declarations.push({
                  type: "declaration",
                  property: line.property,
                  value: line.value,
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
        parsedCSS.stylesheet.rules[0].rules.forEach((line) => {
          if (!line.selectors.includes(`#${selected.id}`)) return;
          line.declarations.forEach((declaration) => {
            if (declaration.property == newRule.property) {
              declaration.value = newRule.value;
            }
          });
        });
      });

      stylesWrapper.querySelector(".activatedStyle").textContent =
        stringify(parsedCSS);
      // setObjFromUi(document.querySelector(".activatedStyle"), document.querySelector(".asset-selected"))
      // save the stylesheet
      await saveStylesheet(
        stylesWrapper.querySelector(".activatedStyle").dataset.strapid,
        stylesWrapper.querySelector(".activatedStyle").textContent,
      );

      updateTheUI(document.querySelector(".asset-selected"));
    });
  });
}
// parse the css selected to check the anchor  or set the anchor
//

//       // Get references to the radio button elements
//       const verticalRadioButtons = document.getElementsByName("verticalAnchor");
//   const horizontalRadioButtons =
//     document.getElementsByName("horizontalAnchor");
//
//   // Add event listeners to the radio buttons to detect changes
//   verticalRadioButtons.forEach(function(radioButton) {
//     radioButton.addEventListener("change", function() {
//       // Update the selected vertical anchor value
//       selected.dataset.anchorVertical = this.value;
//     });
//   });
//
//   horizontalRadioButtons.forEach(function(radioButton) {
//     radioButton.addEventListener("change", function() {
//       // Update the selected horizontal anchor value
//       selected.dataset.anchorHorizontal = this.value;
//       this.value;
//     });
//   });
// }),
//   );
// }
//
//
export function deepSearchByKey(obj, key, target) {
  // Check if the key exists in the object
  if (obj.hasOwnProperty(key) && obj[key] === target) {
    return true;
  }

  // If the key is not found at this level, check nested objects
  for (let prop in obj) {
    if (
      typeof obj[prop] === "object" &&
      deepSearchByKey(obj[prop], key, target)
    ) {
      return true;
    }
  }

  // If the key is not found anywhere, return false
  return false;
}

export async function stickElement(element) {
  // get object asset id;
  const assetId = element.dataset.assetid;
  const activatedStyle = stylesWrapper.querySelector(".activatedStyle");
  let parsedCSS = parse(activatedStyle.textContent);
  const styleToDuplicate = parsedCSS.stylesheet.rules[0].rules.find((rule) => {
    // if the rule isn’t the one we’re looking for, return
    if (!rule.selectors.includes(`#${element.id}`)) return;
    return rule;
  });

  // get all the object that have the same id
  document.querySelectorAll(`[data-assetid="${assetId}"]`).forEach((asset) => {
    //update the css for each entry
    let found = parsedCSS.stylesheet.rules[0].rules.find((rule) => {
      // if the rule isn’t the one we’re looking for, return
      if (!rule.selectors.includes(`#${asset.id}`)) return;
      rule.declarations = styleToDuplicate.declarations;
    });

    if (!found) {
      parsedCSS.stylesheet.rules[0].rules.push({
        type: "rule",
        selectors: [`#${asset.id}`],
        declarations: styleToDuplicate.declarations,
      });
    }

    // if the rule doesnt exist create it

    activatedStyle.textContent = stringify(parsedCSS);
    // apply that css to all the object with the same asset id, but only for one stylesheet
  });
  // save the stylesheet
  saveStylesheet(activatedStyle.dataset.strapid, activatedStyle.textContent);
}

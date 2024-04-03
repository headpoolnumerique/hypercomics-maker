// this code is for when you move an object on the page.
// it handles the move and resize and push the data to strapi.

import { reorderObjectInPlan, removeObjectFromPlan } from "./dataManagement.js";
import interact from "interactjs";
import config from "../config/config.js";
import axios from "axios";
import { anchors } from "./selectors.js";

async function interactObject(object) {
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

  interact(object)
    .draggable({
      listeners: {
        start(event) {
          position = { x: object.offsetLeft, y: object.offsetTop };
          document.querySelector("#inputx").value = percentage(
            event.target.offsetLeft,
            previewScreenSize.width,
          );
          document.querySelector("#inputy").value = percentage(
            event.target.offsetTop,
            previewScreenSize.height,
          );
          document.querySelector("#inputwidth").value = percentage(
            event.rect.width,
            previewScreenSize.width,
          );
          document.querySelector("#inputheight").value = percentage(
            event.rect.height,
            previewScreenSize.height,
          );
        },
        move(event) {
          // ((if anchor is set to bottom, use the bottom else use top))
          // ((if anchor is set to left, use the left else use right))

          position.x += event.dx;
          position.y += event.dy;

          event.target.style.left = `${percentage(
            position.x,
            previewScreenSize.width,
          )}%`;
          event.target.style.top = `${percentage(
            position.y,
            previewScreenSize.height,
          )}%`;
        },
        end(event) {
          // send the data to strapi after getting the data

          // TODO: set the image size realistic: get the original height and  width of the images to set the right
          // resize the block based on the original image size
          // then reset the block size

          // check the anchor here
          document.querySelector("#inputx").value = percentage(
            event.target.offsetLeft,
            previewScreenSize.width,
          );
          document.querySelector("#inputy").value = percentage(
            event.target.offsetTop,
            previewScreenSize.height,
          );
          document.querySelector("#inputwidth").value = percentage(
            event.rect.width,
            previewScreenSize.width,
          );
          document.querySelector("#inputheight").value = percentage(
            event.rect.height,
            previewScreenSize.height,
          );

          /* check anchor to send the right css rule ? or write the css rule somewhere else maybe*/
          // save the data on the objectd /
          // next, save the data of the object on the screensize

          let data = {
            width: `${percentage(event.rect.width, previewScreenSize.width)}%;`,
            height: `${percentage(
              event.rect.height,
              previewScreenSize.height,
            )}%;`,
            top: `${percentage(
              event.target.offsetTop,
              previewScreenSize.height,
            )}%;`,
            left: `${percentage(
              event.target.offsetLeft,
              previewScreenSize.width,
            )}%;`,
            right: `${100 -
              percentage(
                event.target.offsetLeft + event.target.offsetWidth,
                previewScreenSize.width,
              )
              }% `,
            bottom: `${100 -
              percentage(
                event.target.offsetTop + event.target.offsetHeight,
                previewScreenSize.height,
              )
              }% `,
            cssRules: `width: ${percentage(event.rect.width, previewScreenSize.width)}%;
          height: ${percentage(event.rect.height, previewScreenSize.height)}%;
          top: ${percentage(event.target.offsetTop, previewScreenSize.height)}%;
          left: ${percentage(
              event.target.offsetLeft,
              previewScreenSize.width,
            )}%;`,
          };

          //update declaration is now the norm. We’ll see if we keep the rest later
          addRuleToObject(event.target.dataset.objectid, data);

          //updateDeclaration
          // console.log(event.target.closest("#previewScreen"));
        },
      },
    })

    .resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      invert: "reposition",

      modifiers: [
        interact.modifiers.aspectRatio({
          // make sure the ratio is preserved
          // why not aspect ratio from the css height auto?
          // and use only the width of the element?
          // ratio: "preserve",
          // WE DON’T NEED IT BECAUSE WE FIX THE HEIGHT WITH CSS
        }),
      ],

      listeners: {
        start(event) {
          document.querySelector("#inputx").value = percentage(
            event.target.offsetLeft,
            previewScreenSize.width,
          );
          document.querySelector("#inputy").value = percentage(
            event.target.offsetTop,
            previewScreenSize.height,
          );
          document.querySelector("#inputwidth").value = percentage(
            event.rect.width,
            previewScreenSize.width,
          );
          document.querySelector("#inputheight").value = percentage(
            event.rect.height,
            previewScreenSize.height,
          );
        },
        move: function(event) {
          let { x, y } = event.target.dataset;

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${percentage(event.rect.width, previewScreenSize.width)}%`,
            height: `${percentage(
              event.rect.height,
              previewScreenSize.height,
            )}%`,
            // width: `event.rect.width `,
            // height: `event.rect.height`,
            // transform: `translate(${parseFloat(x)}px, ${parseFloat(y)}px)`,
          });

          Object.assign(event.target.dataset, { x, y });
        },
        end: function(event) {
          document.querySelector("#inputx").value = percentage(
            event.target.offsetLeft,
            previewScreenSize.width,
          );
          document.querySelector("#inputy").value = percentage(
            event.target.offsetTop,
            previewScreenSize.height,
          );
          document.querySelector("#inputwidth").value = percentage(
            event.rect.width,
            previewScreenSize.width,
          );
          document.querySelector("#inputheight").value = percentage(
            event.rect.height,
            previewScreenSize.height,
          );
          if (event.target.dataset.anchor == "bottom") {
            // only use bottom
            // top: unset
            // console.log(anchored bottom)
          }
          if (event.target.dataset.anchor == "right") {
            // console.log(anchored bottom)
            // only use right
            // left: unset
          }

          let data = {
            width: `${percentage(event.rect.width, previewScreenSize.width)}%;`,
            height: `${percentage(
              event.rect.height,
              previewScreenSize.height,
            )}%;`,
            top: `${percentage(
              event.target.offsetTop,
              previewScreenSize.height,
            )}%;`,
            left: `${percentage(
              event.target.offsetLeft,
              previewScreenSize.width,
            )}%;`,
            // check if the element is anchored top or bottom
            cssRules: `width: ${percentage(event.rect.width, previewScreenSize.width)}%;
          height: ${percentage(event.rect.height, previewScreenSize.height)}%;
          top: ${percentage(event.target.offsetTop, previewScreenSize.height)}%;
          left: ${percentage(
              event.target.offsetLeft,
              previewScreenSize.width,
            )}%; `,
          };

          // add ruel to object
          addRuleToObject(event.target.dataset.objectid, data);

        },
      },
    });
}

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
async function deleteObject() {
  const plan = document.querySelector("#previewScreen article.shown");
  const object = document.querySelector(".asset-selected");
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

function percentage(partialValue, totalValue) {
  return ((100 * partialValue) / totalValue).toFixed(2);
}

function updateFromUi() {
  document.querySelector("#inputx").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.left =
      document.querySelector("#inputx").value + "%";
  });
  document.querySelector("#inputy").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.top =
      document.querySelector("#inputy").value + "%";
  });
  document.querySelector("#inputwidth").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.width =
      document.querySelector("#inputwidth").value + "%";
  });
  document.querySelector("#inputheight").addEventListener("change", () => {
    document.querySelector(".asset-selected").style.height =
      document.querySelector("#inputheight").value + "%";
  });
}

function updateTheUI(element) {
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

export { deleteObject, interactObject, moveToLayer, updateFromUi, updateTheUI };

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

export function setAnchor() {
  // this is asset manipulation normally
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
    }),
  );
}



// export { setAnchor };

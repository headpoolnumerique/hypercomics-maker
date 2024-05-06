// import {assetsList} from "./selectors.js"

// add image to the plan
// we’ll use this instead of the object. this way we can have image and text as 2 functions
// image will have a dataset objectId to manipulate the object and not the asset

export function addImg(img, planId, objectId, metadata) {
  const newImg = document.createElement("img");
  console.log(objectId)
  console.log(planId)
  // TODO replace the planID hash,ju dont know where that comes from
  newImg.id = `inuse-${planId.replace("#plan-", "")}-${objectId}`;
  newImg.dataset.assetid = img.id.replace("assetlink-", "");
  newImg.dataset.objectid = objectId;
  newImg.dataset.planid = planId;
  newImg.src = img.src;
  newImg.dataset.anchorVertical = `${metadata.attributes.verticalAnchor ? metadata.attributes.verticalAnchor : "top"}`;
  newImg.dataset.anchorHorizontal = `${metadata.attributes.horizontalAnchor ? metadata.attributes.anchorHorizontal: "left"}`;
  newImg.classList.add("asset");
  document.querySelector(planId).insertAdjacentElement("beforeend", newImg);
}



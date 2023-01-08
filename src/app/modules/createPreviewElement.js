// import {assetsList} from "./selectors.js"

function addImg(img, planId) {
  const newImg = document.createElement('img')
  newImg.id = img.id.replace("assetlink", "inuse")
  newImg.src = img.src;
  document.querySelector(planId).insertAdjacentElement('beforeend', newImg)
}

function importImg(imgId, planId) {
  const newImg = document.createElement('img')
  newImg.id = `inuse-${imgId.id}`;
  console.log(imgId)
  newImg.src = imgId.attributes.location;
  console.log(planId)
  planId.insertAdjacentElement('beforeend', newImg)
}

export { addImg, importImg }

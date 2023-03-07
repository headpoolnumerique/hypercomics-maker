// import {assetsList} from "./selectors.js"

// add image to the plan
function addImg(img, planId, objectId) {
  const newImg = document.createElement('img')
  newImg.id = img.id.replace('assetlink', 'inuse')
  newImg.dataset.strapId = img.id.replace('assetlink-', '')
  newImg.dataset.objectId = objectId
  newImg.src = img.src
  newImg.classList.add('asset')
  document.querySelector(planId).insertAdjacentElement('beforeend', newImg)
}
// import Image to the plan
function importImg(imgId, planId, objectId) {
  const newImg = document.createElement('img')
  newImg.objectId = objectId
  newImg.id = `inuse-${imgId.id}`
  newImg.dataset.strapId = newImg.id.split('-')[1]
  newImg.dataset.objectId = objectId
  newImg.classList.add('asset')
  newImg.src = imgId.attributes.location
  planId.insertAdjacentElement('beforeend', newImg)
}

export { addImg, importImg }

// import {assetsList} from "./selectors.js"

// add image to the plan
// image will have a dataset objectId to manipulate the object and not the asset 
function addImg(img, planId, objectId) {
  const newImg = document.createElement('img')
  newImg.id = `inuse-${planId}-${objectId}`
  newImg.dataset.assetid = img.id.replace('assetlink-', '')
  newImg.dataset.objectid = objectId
  newImg.src = img.src
  newImg.classList.add('asset')
  document.querySelector(planId).insertAdjacentElement('beforeend', newImg)
}

// import Image to the plan
// image will have a dataset objectId to manipulate the object and not the asset 
function importImg(imgId, planId, objectId) {
  const newImg = document.createElement('img')
  newImg.objectId = objectId
  newImg.id = `inuse-${imgId.id}`
  newImg.dataset.assetid = newImg.id.split('-')[1]
  newImg.dataset.objectid = objectId
  newImg.classList.add('asset')
  newImg.src = imgId.attributes.location
  planId.insertAdjacentElement('beforeend', newImg)
}

export { addImg, importImg }

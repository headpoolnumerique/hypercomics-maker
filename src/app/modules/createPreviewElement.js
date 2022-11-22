// import {assetsList} from "./selectors.js"

function addImg(img, planId) {

  const newImg = document.createElement('img')
  newImg.dataset.id = img.id.replace("assetlink", "inuse")
  newImg.src = img.src;
  document.querySelector(planId).insertAdjacentElement('beforeend', newImg)


}

export { addImg }

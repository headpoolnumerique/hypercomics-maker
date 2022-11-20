// import {assetsList} from "./selectors.js"

function addImg(img, plan) {

  const newImg = document.createElement('img')
  newImg.dataset.id = img.id.replace("assetlink", "inuse")
  newImg.src = img.src;
  document.querySelector(plan).insertAdjacentElement('beforeend', newImg)
}

export { addImg }

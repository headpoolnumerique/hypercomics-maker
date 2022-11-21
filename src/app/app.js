import {
  changeOrientation,
  resizePreview,
  fullPageWatcher,
} from './modules/preview.js'

import { addPlan, showMontage,  } from './modules/montage.js'

import { startup } from './modules/startup.js'

import { uploadToStrapi } from './modules/assetNetwork.js'
import {unselect, selectLink} from '../app/modules/helpers'



import {
  previewSpace,
  previewScreen,
  montageScreen,
  montageList,
  imageUploadInputs,
  imageUpload,
  assetsList,
} from './modules/selectors.js'

import { addImg } from './modules/createPreviewElement.js'
// list all the things

//Event and binds
document.querySelectorAll('.previewResizer').forEach((resizeButton) => {
  resizeButton.addEventListener('click', () => {
    resizePreview(
      previewScreen,
      resizeButton.dataset.previewWidth,
      resizeButton.dataset.previewHeight
    )
  })
})

document.querySelector('#orientationChanger').addEventListener('click', () => {
  changeOrientation(previewScreen)
})

document.querySelector('#fullPageWatcher').addEventListener('click', () => {
  fullPageWatcher(previewSpace)
})

document.querySelector('#showMontage').addEventListener('click', () => {
  showMontage(montageScreen)
})

document.querySelector('#addPlan').addEventListener('click', () => {
  addPlan(montageList, previewScreen)
})

imageUpload.addEventListener('click', function (e) {
  e.preventDefault()
  uploadToStrapi(imageUploadInputs)
})

montageList.addEventListener('click', (e) => {
  if (e.target.tagName == 'A') {
    unselect()
    selectLink(e.target)
  }
})
assetsList.addEventListener('click', (e) => {
  console.log(e)
  if (e.target.tagName == 'IMG') {
    addImg(e.target, window.location.hash)
  }
})

// starting point

// manage
//  -----------------START THE APP

startup()

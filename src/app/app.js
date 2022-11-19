import {
  changeOrientation,
  resizePreview,
  fullPageWatcher,
} from './modules/preview.js'

import { addPlan, showMontage, selectLink } from './modules/montage.js'

import { startup } from './modules/startup.js'

// list all the things
const previewSpace = document.querySelector('#preview')
const previewScreen = document.querySelector('#previewScreen')
const montageScreen = document.querySelector('#banc-montage')
const montageList = document.querySelector('#planOrder')


//event and bind

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

montageList.querySelectorAll('li').forEach((el) => {
  el.addEventListener('click', () => {
    selectLink(el)
  })
})

// starting point

// manage
//  -----------------START THE APP 

startup()

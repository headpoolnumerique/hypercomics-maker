import {
  changeOrientation,
  resizePreview,
  fullPageWatcher,
} from './modules/preview.js'
import { addPlan, showMontage, selectLink } from './modules/montage.js'

// list all the things
const previewSpace = document.querySelector('#preview')
const previewScreen = document.querySelector('#previewScreen')
const montageScreen = document.querySelector('#banc-montage')
const montageList = document.querySelector('#planOrder')

//do all the js

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
  addPlan(montageList)
})
document.querySelectorAll('#montageList li').forEach((el) => {
  el.addEventListener('click', () => {
    selectLink(this);
  })
})
// window.onload = () => {
//   resizeWatcher()
// }

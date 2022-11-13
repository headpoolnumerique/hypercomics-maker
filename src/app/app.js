import {
  changeOrientation,
  resizePreview,
  fullPageWatcher,
} from './modules/preview.js'
import { showMontage } from './modules/montage.js'

// list all the things
const previewSpace = document.querySelector('#preview')
const previewScreen = document.querySelector('#previewScreen')
const montageScreen = document.querySelector('#banc-montage')

//do all the js

document.querySelectorAll('.previewResizer').forEach(resizeButton => {
  resizeButton.addEventListener('click', () => {
    resizePreview(previewScreen, resizeButton.dataset.previewWidth, resizeButton.dataset.previewHeight)
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
// window.onload = () => {
//   resizeWatcher()
// }

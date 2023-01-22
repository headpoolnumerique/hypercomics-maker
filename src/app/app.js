import {
  changeOrientation,
  resizePreview,
  fullPageWatcher,
} from './modules/preview.js'

// import nanoid from 'nanoid'
// import { v4 as uuidv4 } from 'uuid';

import { addPlan } from './modules/montage.js'

import { startup } from './modules/startup.js'

import { uploadToStrapi } from './modules/assetNetwork.js'
import { deselect, selectLink } from '../app/modules/helpers'
import { showHideBlock } from './modules/helpers.js'

import { assetManipulationUi } from './modules/assetManipulation'

import {
  previewSpace,
  previewScreen,
  montageScreen,
  montageList,
  imageUploadInputs,
  imageUpload,
  assetsList,
  contextUI,
} from './modules/selectors.js'

import { addImg } from './modules/createPreviewElement.js'

import {
  updateData,
  getAllImageFromPlan,
  connectPlanWithOrder,
} from './modules/dataManagement.js'
import config from './config/config.js'
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

//show hide montage
document.querySelector('#showMontage').addEventListener('click', () => {
  showHideBlock(montageScreen)
})

//show hide contextual id
document
  .querySelectorAll('#showContextualUI, #closeContextualUI')
  .forEach((caller) => {
    caller.addEventListener('click', () => {
      showHideBlock(contextUI)
    })
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
    //dont change the url of the page because it’s used to define the sequence
    e.preventDefault()
    deselect('.selected')
    selectLink(e.target)
  }
})

//when clicking an image in the asset list
assetsList.addEventListener('click', (e) => {
  // if it’s an image
  if (e.target.tagName == 'IMG') {
    // add the image to the plan
    let planNumber = document
      .querySelector('.selected')
      .hash.replace('#plan-', '')

    const assetId = Number(e.target.dataset.strapid)


    console.log(assetId);


    let response = connectPlanWithOrder(config.strapi.url, planNumber, assetId)

    if (response) {
      addImg(e.target, document.querySelector('.selected').hash)
    }
    //add the image to the doc
  }
})

// moveElementOnThePage

previewScreen.addEventListener('click', (event) => {
  if (event.target.tagName == 'IMG') {
    previewScreen
      .querySelector('.asset-selected')
      ?.classList.remove('asset-selected')
    event.target.classList.add('asset-selected')
    contextUI.querySelector('main').innerHTML = assetManipulationUi
  }
})

//move between blocks

// document.querySelector("#previewNext").addEventListener('click', function() {
//   document.querySelector('.selected')?.parentElement.nextSibling.querySelector('a').classList.add('selected')
// }) {
//
// }

// starting point

// manage
//  -----------------START THE APP

startup()

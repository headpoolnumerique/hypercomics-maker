import {
  changeOrientation,
  resizePreview,
  fullPageWatcher,
} from './modules/preview.js'

// import nanoid from 'nanoid'
// import { v4 as uuidv4 } from 'uuid';

import { addPlan, showMontage } from './modules/montage.js'

import { startup } from './modules/startup.js'

import { uploadToStrapi } from './modules/assetNetwork.js'
import { deselect, selectLink } from '../app/modules/helpers'

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
import { updateData } from './modules/dataManagement.js'
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

    let data = {
      assets: Number(e.target.id.split('-')[1])
    }

    
    console.log(data)

    //inform strapi
    let response = updateData(config.strapi.url, 'plans', data, planNumber)

    console.log(response)
    //log the response to debug

    //add the image to the doc
    addImg(e.target, document.querySelector('.selected').hash)
  }
})

// starting point

// manage
//  -----------------START THE APP

startup()

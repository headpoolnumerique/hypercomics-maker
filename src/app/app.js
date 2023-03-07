import {
  changeOrientation,
  resizePreview,
  fullPageWatcher,
} from './modules/preview.js'
import {
  deletePlan,
  deleteAllPlans,
  addPlan,
  duplicatePlan,
} from './modules/montage.js'
import { startup } from './modules/startup.js'
import { uploadToStrapi } from './modules/assetNetwork.js'
import { deselect, selectLink } from '../app/modules/helpers'
import { showHideBlock } from './modules/helpers.js'
import {
  // assetManipulationUi,
  interactAsset,
  deleteAsset,
  moveToLayer,
updateFromUi
} from './modules/assetManipulation.js'
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
import { connectObjectToPlan } from './modules/dataManagement.js'
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

document.querySelector('#deletePlan').addEventListener('click', () => {
  deletePlan()
})

document.querySelector('#deleteAllPlans').addEventListener('click', () => {
  deleteAllPlans()
})

document.querySelector('#duplicatePlan').addEventListener('click', () => {
  console.log('click')
  duplicatePlan(montageList, document.querySelector('.shown')?.dataset.strapId)
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

    const assetId = e.target.dataset.strapid

    console.log(assetId);
    let response = connectObjectToPlan(config.strapi.url, planNumber, assetId)

    if (response) {
      addImg(e.target, document.querySelector('.selected').hash)
    }
  }
})

// moveElementOnThePage

preview.addEventListener('click', (event) => {
  if (event.target.tagName == 'IMG') {
    previewScreen
      .querySelector('.asset-selected')
      ?.classList.remove('asset-selected')
    event.target.classList.add('asset-selected')
    interactAsset(event.target)
    //update context menu
    // contextUI.querySelector('main').innerHTML = assetManipulationUi
  } else {
    previewScreen
      .querySelector('.asset-selected')
      ?.classList.remove('asset-selected')

    //update context menu
    // contextUI.querySelector('main').innerHTML = ''
  }
})

// contextUI

contextUI.addEventListener('click', function (event) {
  const asset = previewScreen.querySelector('.asset-selected'),
    plan = previewScreen.querySelector('.shown')

  switch (event.target.id) {
    case 'rotate':
      break
    case 'resize':
      break
    case 'moveFarther':
      moveToLayer(asset, plan, 'farther')
      break
    case 'moveCloser':
      moveToLayer(asset, plan, 'closer')
      break
    case 'moveFarest':
      moveToLayer(asset, plan, 'farest')
      break
    case 'moveClosest':
      moveToLayer(asset, plan, 'closest')
      break
    case 'move':
      break
    case 'deleteAsset':
      deleteAsset()
      break

    default:
      console.log('not there yet')
  }
})

// show hide/plan
document
  .querySelector('#previewPrevious')
  .addEventListener('click', function () {
    let shownPlan = document.querySelector('.shown')
    let shownLink = document.querySelector('.selected')
    console.log(shownPlan, shownLink)
    if (!shownPlan.previousElementSibling) {
      return false
    }

    document.querySelector('.oldshown')?.classList.remove('oldshown')
    shownPlan.classList.remove('shown')
    shownLink.classList.remove('selected')
    shownPlan.previousElementSibling.classList.add('shown')
    shownPlan.previousElementSibling?.previousElementSibling?.classList.add(
      'oldshown'
    )
    shownLink
      .closest('li')
      .previousElementSibling.querySelector('a')
      .classList.add('selected')
  })

document.querySelector('#previewNext').addEventListener('click', function () {
  let shownPlan = document.querySelector('.shown')
  let shownLink = document.querySelector('.selected')
  console.log(shownPlan, shownLink)
  if (!shownPlan.nextElementSibling) {
    return false
  }
  shownPlan.classList.remove('shown')
  shownLink.classList.remove('selected')
  document.querySelector('.oldshown')?.classList.remove('oldshown')
  shownPlan.nextElementSibling.classList.add('shown')
  shownPlan.classList.add('oldshown')
  shownLink
    .closest('li')
    .nextElementSibling.querySelector('a')
    .classList.add('selected')
})

startup()
updateFromUi()

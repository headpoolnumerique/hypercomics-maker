import { deselect, selectLink } from './helpers.js'
import config from '../config/config.js'
import { sequenceNumber, sequencePreview } from './selectors.js'
import { createData } from './dataManagement.js'

//show the montage block
function showMontage(montage) {
  montage.classList.toggle('show')
}

//add plan to the sequence (montageList = block where the montage happens, sequence → sequence id, select → if the new plan is selected by default)
async function addPlan(montageList, sequence, select = true) {
  console.log(sequence)
  if (select) {
    deselect('.selected')
    deselect('.shown')
  }
  let data = {
    order: montageList.querySelectorAll('li').length + 1,
    sequence: Number(sequenceNumber.textContent),
  }
  let response = await createData(config.strapi.url, 'plans', data)

  await montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a class=${select ? 'selected' : ''} href="#plan-${
      response.data.data.id
    }">${response.data.data.attributes.order}</a></li>`
  )

  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article class="${select ? 'shown' : ''}" id="plan-${
      response.data.data.id
    }"><span class="plan-name">${
      response.data.data.attributes.order
    }</span></article>`
  )
}

// render a plan
function renderPlan(plan, montageList, sequencePreview, select = false) {
  let previewedPlan = document.createElement(`article`)
  previewedPlan.id = `plan-${plan.id}`
  previewedPlan.insertAdjacentHTML(
    'afterbegin',
    `<span class="plan-name">${plan.attributes.order}</span>`
  )

  console.log(montageList)
  montageList.insertAdjacentHTML(
    'beforeend',
    `<li  ><a class="${select ? 'selected' : ''}" href="#plan-${plan.id}">${
      plan.attributes.order
    }</a></li>`
  )

  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article class="${select ? 'shown' : ''}" id="plan-${
      plan.id
    }"><span class="plan-name">${plan.attributes.order}</span></article>`
  )

  // window.location.hash = `#plan-${plan.attributes.order}`
}

function importImgToPlan(img, plan) {}

export { showMontage, addPlan, selectLink, renderPlan }

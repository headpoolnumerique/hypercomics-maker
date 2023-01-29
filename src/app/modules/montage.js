import { deselect, selectLink } from './helpers.js'
import config from '../config/config.js'
import { sequenceNumber, sequencePreview } from './selectors.js'
import { createData } from './dataManagement.js'

/*
// add plan to the sequence 
// montageList = montage list in the montage pane,
// sequence → sequence id, 
// select → if the new plan is selected by default
*/

async function addPlan(montageList, select = true) {
  if (select) {
    deselect('.selected')
    deselect('.shown')
  }
  let data = {
    order: montageList.querySelectorAll('li').length + 1,
    sequence: Number(sequenceNumber.textContent),
  }
  let response = await createData(config.strapi.url, 'plans', data)

  montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a class=${select ? 'selected' : ''} href="#plan-${
      response.data.data.id
    }">${response.data.data.attributes.order}</a></li>`
  )

  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article class="${select ? 'shown' : ''}" id="plan-${
      response.data.data.id
    }"></article>`
  )
}

// render a plan when loading up the app
function renderPlan(plan, montageList, sequencePreview, select = false) {
  let previewedPlan = document.createElement(`article`)
  previewedPlan.id = `plan-${plan.id}`
  previewedPlan.insertAdjacentHTML(
    'afterbegin',
    `<span class="plan-name">${plan.attributes.order}</span>`
  )

  // insert a link to the plan in the montage panel
  montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a class="${select ? 'selected' : ''}" href="#plan-${plan.id}">${
      plan.attributes.order
    }</a></li>`
  )

  // insert the plan in the preview plan
  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article class="${select ? 'shown' : ''}" id="plan-${plan.id}">
    </article>`
  )
}

export { addPlan, selectLink, renderPlan }

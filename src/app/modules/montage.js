import { unselect, selectLink } from './helpers.js'
import config from '../config/config.js'
import { sequenceNumber, sequencePreview } from './selectors.js'
import { createData } from './dataManagement.js'


//show the montage block
function showMontage(montage) {
  montage.classList.toggle('show')
}

//add plan to the sequence
async function addPlan(montageList, sequence) {
  unselect()
  let data = {
    order: montageList.querySelectorAll('li').length + 1,
    sequence: Number(sequenceNumber.textContent),
  }
  let response = await createData(config.strapi.url, 'plans', data)
  console.log(response)
  const number = montageList.querySelectorAll('li').length + 1
  montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a class="selected" href="#plan-${response.data.data.id}">${response.data.data.attributes.order}</a></li>`
  )
  sequence.insertAdjacentHTML(
    'beforeend',
    `<article id="plan-${response.data.data.id}"><span class="plan-name">${response.data.data.attributes.order}</span></article>`
  )

  window.location.hash = `#plan-${number}`
}


// render the plan at startup
function renderPlan(plan, montageList, sequencePreview) {

  let previewedPlan = document.createElement(`article`)
  previewedPlan.id=`plan-${plan.id}`
  previewedPlan.insertAdjacentHTML('afterbegin', `<span class="plan-name">${plan.attributes.order}</span>`)


  montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a href="#plan-${plan.id}">${plan.attributes.order}</a></li>`
  )

  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article id="plan-${plan.id}"><span class="plan-name">${plan.attributes.order}</span></article>`
  )
  
  window.location.hash = `#plan-${plan.attributes.order}`
}



function importImgToPlan(img, plan) {}

export { showMontage, addPlan, selectLink, renderPlan }

import { unselect, selectLink } from './helpers.js'
import config from '../config/config.js'
import { sequenceNumber } from './selectors.js'
import { createData } from './dataManagement.js'

function showMontage(montage) {
  montage.classList.toggle('show')
}

async function addPlan(montageList, sequence) {
  unselect()
  let data = {
    sequence: sequenceNumber.textContent,
    title: 'nope',
  }
  let response = await createData(config.strapi.url, 'plans', data)
  console.log(response)
  const number = montageList.querySelectorAll('li').length + 1
  montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a class="selected" href="#plan-${response.data.data.id}">${response.data.data.id}</a></li>`
  )
  sequence.insertAdjacentHTML(
    'beforeend',
    `<article id="plan-${response.data.data.id}"><span class="plan-name">${response.data.data.id}</span></article>`
  )

  window.location.hash = `#plan-${number}`
}

function importImgToPlan(img, plan) {}

export { showMontage, addPlan, selectLink }

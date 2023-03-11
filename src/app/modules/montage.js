import { deselect, selectLink, activatePlan } from './helpers.js'
import config from '../config/config.js'
import { sequenceNumber, sequencePreview } from './selectors.js'
import { createData, loadSingle } from './dataManagement.js'
import { importImg } from './createPreviewElement.js'
import axios from 'axios'
/*
// add plan to the sequence 
// montageList = montage list in the montage pane,
// sequence → sequence id, 
// select → if the new plan is selected by default
*/

async function deleteAllPlans() {
  let sequenceId = Number(document.querySelector('#sequenceNumber').textContent)
  let data = {
    plans: {
      set: [],
    },
  }

  return axios
    .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
      data,
    })
    .then((response) => {
      document.querySelectorAll('#previewScreen article').forEach((article) => {
        article.remove()
      })
      document.querySelectorAll('#planOrder li').forEach((el) => {
        el.remove()
      })
    })
    .catch((err) => {
      return err
    })
}
async function deletePlan() {
  let sequenceId = Number(document.querySelector('#sequenceNumber').textContent)
  let previousPlan = document
    .querySelector('.shown')
    .previousElementSibling.id.split('-')[1]
  console.log(previousPlan)
  let planId = Number(document.querySelector('.shown').dataset.strapId)
  let data = {
    plans: {
      disconnect: [
        {
          id: planId,
        },
      ],
    },
  }

  return axios
    .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
      data,
    })
    .then((response) => {
      document.querySelector('.shown').remove()
      document.querySelector('.selected').closest('li').remove()
      //show previousPlan if it exists
      if (previousPlan) {
        activatePlan(previousPlan)
      }
    })
    .catch((err) => {
      return err
    })
}

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
    `<li id="link-${response.data.data.id}"><a class=${
      select ? 'selected' : ''
    } href="#plan-${response.data.data.id}" >

    </a></li>`
  )

  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article class="${select ? 'shown' : ''}" id="plan-${
      response.data.data.id
    }" data-strap-id="${response.data.data.id}"></article>`
  )
}

async function duplicatePlan(montageList, planToDuplicateId, sequenceId) {
  // create a new plan and connect it right after the plan you’re ducplicating
  // 1. load the plan

  let data = {
    data: {
      sequence: sequenceId,
    },
  }

  //  1.b create a plan based on the loading plan.
  const newPlanId = await axios
    .post(`${config.strapi.url}/api/plans/`, data)
    .then((response) => {
      return response.data.data.id
    })

  // console.log('new plan', newPlanId)

  // 2. load all object with filter of plan ID,
  // http://localhost:1337/api/objects/?populate=deep,5&filters[plan]=807
  const objectsOfThePlan = await axios
    .get(
      `${config.strapi.url}/api/objects?populate=deep,5&filters[plan]=${planToDuplicateId}`
    )
    .then((response) => {
      return response
    })
    .catch((err) => {
      console.log(err)
    })

  objectsOfThePlan.data.data.forEach(async (obj) => {
    let oldData = obj.attributes

    let data = { ...oldData }
    data.plan = newPlanId
    data.assets = []

    //set assets
    for (let asset of oldData.assets.data) {
      console.log('the id', asset.id)
      data.assets.push(asset.id)
    }

    // Push! /
    await axios
      .post(`${config.strapi.url}/api/objects`, { data })
      .then((response) => {
        console.log(response)

        // render the plan 
        // show the objects!
      })
      .catch((err) => {
        console.log(err)
      })
  })


}

// render a plan when loading up the app
function renderPlan(plan, montageList, sequencePreview, select = false) {
  console.log(plan)
  let previewedPlan = document.createElement(`article`)
  previewedPlan.id = `plan-${plan.id}`
  previewedPlan.insertAdjacentHTML(
    'afterbegin',
    `<span class="plan-name">${plan.attributes.order}</span>`
  )

  // insert a link to the plan in the montage panel
  montageList.insertAdjacentHTML(
    'beforeend',
    `<li id="link-${plan.id}"><a class="${
      select ? 'selected' : ''
    }" href="#plan-${plan.id}"> 

  </a></li>`
  )

  // insert the plan in the preview plan
  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article data-strap-id=${plan.id} class="${
      select ? 'shown' : ''
    }" id="plan-${plan.id}">
    </article>`
  )
}

export {
  addPlan,
  deletePlan,
  deleteAllPlans,
  duplicatePlan,
  selectLink,
  renderPlan,
}

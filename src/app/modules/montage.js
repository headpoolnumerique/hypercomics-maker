import { deselect, selectLink } from './helpers.js'
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
  let planId = Number(document.querySelector('.shown').dataset.strapId)
  console.log(planId)
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
      console.log(response)
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
    `<li><a class=${select ? 'selected' : ''} href="#plan-${
      response.data.data.id
    }">

    </a></li>`
  )

  sequencePreview.insertAdjacentHTML(
    'beforeend',
    `<article class="${select ? 'shown' : ''}" id="plan-${
      response.data.data.id
    }"></article>`
  )
}

async function duplicatePlan(montageList, planId) {
  let oldData = await loadSingle(config.strapi.url, 'plans', planId, true)
  console.log(oldData)

  const plan = document.querySelector('.shown')
  plan.classList.add('sourcePlan')
  plan.classList.remove('shown')
  document.querySelector('.selected').classList.remove('selected')

  let assetsID = []

  //where is the css to clone?

  for (let asset of oldData.data.data.attributes.assets.data) {
    assetsID.push(asset.id)
  }




  console.log(assetsID)
  let data = {
    data: {
      sequence: Number(document.querySelector('#sequenceNumber').textContent),
      cssrules: "",
      assets: {
        connect: assetsID,
      },
      
    },
  }
  return axios
    .post(`${config.strapi.url}/api/plans/?populate=deep,5`, data)
    .then((response) => {
      console.log(response)
      let newPlan = response.data.data
      renderPlan(newPlan, montageList, sequencePreview, true)
      console.log('newplan', newPlan.attributes.assets)
      console.log('newplan', newPlan.attributes.assets.data[0])
      newPlan.attributes.assets.data.forEach((asset) => {
        console.log('asset', asset)
        importImg(asset, document.querySelector('.shown'))
      })
      return response
    })
    .catch((err) => {
      return err
    })

  // let data = {
  //     assets: oldData.data.data.attributes.assets.data,
  // }
  // console.log(data)

  //duplicate
  //

  //duplicate plan
  //duplicate content
  //duplicate CSS

  // createPlan and fill it with the data,

  // connect the plan to the sequence at the right order
  //create a new plan and fill it with the data from the previous one
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
    `<li><a class="${select ? 'selected' : ''}" href="#plan-${plan.id}"> 

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

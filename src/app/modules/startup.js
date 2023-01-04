import config from '../config/config.js'
import qs from 'qs'
import { loadSingle, loadCollection, createData } from './dataManagement'
import { renderPlan } from './montage.js'
import { montageList, sequencePreview } from './selectors.js'

async function startup(sequenceID = window.location.hash) {
  // if there is a hash ,load the sequence, else, create a new one
  // problem: this intereferes with the id we use for the moving around.
  // we should change that.
  if (sequenceID) {
    let response = await loadSingle(
      config.strapi.url,
      `sequences`,
      window.location.hash.replace('#', '')
    )
    if (response.data == null) {
      let response = await createData(config.strapi.url, `sequences`, {
        title: 'unknown research',
      })
      window.location.hash = `${response.data.data.id}`
      updateSequenceMeta(
        response.data.data.id,
        response.data.data.attributes.title
      )
      window.location.hash = response.data.data.id
      fillSequence(response.data.data.id)
    } else {
      updateSequenceMeta(
        response.data?.data?.id,
        response.data?.data?.attributes?.title
      )
      fillSequence(response.data.data.id)
      window.location.hash = response.data.data.id
    }
  }

  // otherwise, create a sequence
  else {
    //create a sequence if there is none
    let response = await createData(config.strapi.url, `sequences`, {
      title: 'unknown research',
    })
    window.location.hash = `${response.data.data.id}`
    updateSequenceMeta(
      response.data.data.id,
      response.data.data.attributes.title
    )
  }
}

async function fillSequence(sequence) {
  let response = await loadSingle(config.strapi.url, 'sequences', sequence)
  console.log(response.data.data.attributes.plans.data.forEach(plan =>{
    renderPlan(plan, montageList, sequencePreview)
  }))

  // check for each plan. add them to the view 
}

function updateSequenceMeta(id, title) {
  const meta = {
    projectName: document.querySelector('#projectName'),
    sequenceNumber: document.querySelector('#sequenceNumber'),
  }
  meta.projectName.innerHTML = title
  meta.sequenceNumber.innerHTML = id
}

// get to strapi
// find the content including in the right sequence number
//

export { startup }

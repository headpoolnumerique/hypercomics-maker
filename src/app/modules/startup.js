import config from '../config/config.js'
import { loadSingle, loadCollection, createData } from './dataManagement'

async function startup(sequenceID = window.location.hash) {
  // if there is a hash ,load the sequence
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
      console.log(response.data.data.id)
      window.location.hash = `${response.data.data.id}`
      updateSequenceMeta(
        response.data.data.id,
        response.data.data.attributes.title
      )
    } else {
      updateSequenceMeta(
        response.data?.data?.id,
        response.data?.data?.attributes?.title
      )
      window.location.hash = response.data.id
    }
  }

  // otherwise, create a sequence
  else {
    //create a sequence if there is none
    let response = await createData(config.strapi.url, `sequences`, {
      title: 'unknown research',
    })
    console.log(response.data.data.id)
    window.location.hash = `${response.data.data.id}`
    updateSequenceMeta(
      response.data.data.id,
      response.data.data.attributes.title
    )
  }
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

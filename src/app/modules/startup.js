import config from '../config/config.js'
import { loadSingle, loadCollection, createData } from './dataManagement'
import { addPlan, renderPlan } from './montage.js'
import { montageList, sequencePreview } from './selectors.js'

async function startup(url = document.location.href) {
  // use parameters to define the url of the project
  // url =  server.com/?sequence=SEQID&project=projectid
  let sequenceUrl = new URL(url)
  const projectId = sequenceUrl.searchParams.get('project')
  const sequenceId = sequenceUrl.searchParams.get('sequence')

  // sequenceId is enough because it belongs by default to a project
  // [TODO] link sequence to project

  // if there is no sequence id, create a new sequence
  if (!sequenceId) {
    let response = await createData(config.strapi.url, `sequences`, {
      title: 'unknown research',
    })

    // add the sequence to the URL and show it in the url bar (damn you safari)
    sequenceUrl.sequenceId = response.data.data.id
    window.location.href = sequenceUrl
    updateSequenceMeta(
      response.data?.data?.id,
      response.data?.data?.attributes?.title
    )
    fillSequence(response.data.data.id)
  } else {
    // if there is a sequenceID in the url, load the sequence from strapi
    let response = await loadSingle(config.strapi.url, `sequences`, sequenceId)

    // if the sequence number doesnt exist in strapi, create it
    if (response.data == null) {
      let response = await createData(config.strapi.url, `sequences`, {
        title: 'this sequence has no name yet',
        projectId: projectId ? projectId : '',
        id: sequenceId,
      })

      //update the sequence url and write in the url bar
      sequenceUrl.sequenceId = response.data.data.id
      window.location.href = sequenceUrl
    }
    updateSequenceMeta(
      response.data?.data?.id,
      response.data?.data?.attributes?.title
    )
    fillSequence(response.data.data.id)
  }
}

async function fillSequence(sequence) {
  let response = await loadSingle(config.strapi.url, 'sequences', sequence)
  let plans = response.data.data.attributes.plans
  if (plans.data.length < 1) {
    addPlan(montageList, sequence)
  }
  plans.data.forEach((plan, index) => {
    renderPlan(
      plan,
      montageList,
      sequencePreview,
      index + 1 == plans.data.length ? true : false
    )
  })

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

export { startup }

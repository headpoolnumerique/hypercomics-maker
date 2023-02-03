import config from '../config/config.js'
import { loadSingle, loadCollection, createData } from './dataManagement.js'
import { addImg, importImg } from './createPreviewElement'
import { addPlan, renderPlan } from './montage.js'
import { montageList, sequencePreview } from './selectors.js'
import { addAssetToTheAssetManager } from './assetManager'
async function startup(url = document.location.href) {
  // use parameters to define the url of the project
  // url =  server.com/?sequence=SEQID&project=projectid
  let sequenceUrl = new URL(url)
  const projectId = sequenceUrl.searchParams.get('project')
  const sequenceId = sequenceUrl.searchParams.get('sequence')

    document.body.id = `sequence-${sequenceId}`
  // sequenceId is enough because it belongs by default to a project
  // [TODO] link sequence to project

  // if there is no sequence id, create a new sequence
  if (!sequenceId) {
    let response = await createData(config.strapi.url, `sequences`, {
      title: 'i am in the desert with the project with name',
      projectId: projectId ? projectId : '',
    })

    // add the sequence to the URL and show it in the url bar (damn you safari)
    sequenceUrl.searchParams.set('sequence', response.data.data.id)

    // console.log(sequenceUrl)
    // console.log(sequenceUrl.toString())

    // TODO → generate projectId before otherwise, it will create a new page.

    history.pushState({}, null, sequenceUrl)
    window.location = sequenceUrl
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

      console.log(sequenceUrl.toString())

      //update the sequence url and write in the url bar
      sequenceUrl.sequenceId = response.data.data.id
      // history.pushState({}, null, sequenceUrl)
      // window.location.href = sequenceUrl
    }
    updateSequenceMeta(
      response.data?.data?.id,
      response.data?.data?.attributes?.title
    )
    fillSequence(response.data.data.id)
  }

  let styles = await loadCSS(
    config.strapi.url,
    Number(document.querySelector('#sequenceNumber').textContent)
  )
  let styling = document.createElement('style')
  styling.id = 'sequenceStyles'
  styling.innerHTML = styles
  document.head.insertAdjacentElement('beforeend', styling)
}

async function fillSequence(sequence) {
  let response = await loadSingle(config.strapi.url, 'sequences', sequence)
  let plans = response.data.data.attributes.plans
  //if there is no plan, create a plan
  if (plans.data.length < 1) {
    addPlan(montageList, sequence)
  }
  //create the plan
  plans.data.forEach((plan, index) => {
    renderPlan(
      plan,
      montageList,
      sequencePreview,
      index + 1 == plans.data.length ? true : false
    )
    fillPlan(plan)
  })

  // check for each plan. add them to the view
}

async function loadCSS(serverUrl, sequenceID) {
  let styles = await loadSingle(serverUrl, 'sequences', sequenceID)
  let rules = ''
  styles.data.data.attributes.cssrules.data.forEach((rule) => {
    console.log('rule', rule.attributes.rule)
    rules = rules + rule.attributes.rule
  })

  console.debug('rules', rules)
  return rules
}

function updateSequenceMeta(id, title) {
  const meta = {
    projectName: document.querySelector('#projectName'),
    sequenceNumber: document.querySelector('#sequenceNumber'),
  }
  meta.projectName.innerHTML = title
  meta.sequenceNumber.innerHTML = id
}

function fillPlan(plan) {
  console.log('tofill', plan.attributes.assets.data)
  // fille the plan with all the existing images
  // find the plan
  let planToFill = preview.querySelector(`#plan-${plan.id}`)
  let assetsToFillWith = plan.attributes.assets.data

  // fill the asset manager with the image
  assetsToFillWith.forEach((asset) => {
    addAssetToTheAssetManager(
      asset.attributes.location,
      asset.id,
      asset.attributes.filename,
      document.querySelector('#assetsList')
    )

    // TODONOW change the code to add an asset on startup OR on update
    importImg(asset, planToFill)
  })

  // fill it with the assets
}

function showImageInTheAssetsManager() {
  // check the images in the preview and bring them in the asset manager
}

export { startup }

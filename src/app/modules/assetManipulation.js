import { reorderObjectInPlan, removeObjectFromPlan } from './dataManagement.js'
import interact from 'interactjs'
import config from '../config/config.js'
import axios from 'axios'

function interactObject(object) {
  let sequenceId = Number(document.querySelector('#sequenceNumber').textContent)
  let previewScreen = document.querySelector('#previewScreen')
  let previewScreenSize = {
    height: previewScreen.offsetHeight,
    width: previewScreen.offsetWidth,
  }

  // TODO: wait for the image to appear to attach a interact

  const position = { x: object.offsetLeft, y: object.offsetTop }
  interact(object)
    .draggable({
      listeners: {
        start(event) {
          // console.log(event.rect)
          // console.log(event.type, event.target)
        },
        move(event) {
          position.x += event.dx
          position.y += event.dy

          event.target.style.left = `${percentage(
            position.x,
            previewScreenSize.width
          )}%`
          event.target.style.top = `${percentage(
            position.y,
            previewScreenSize.height
          )}%`
        },
        end(event) {
          document.querySelector('#inputx').value = percentage(
            event.target.offsetLeft,
            previewScreenSize.width
          )
          document.querySelector('#inputy').value = percentage(
            event.target.offsetTop,
            previewScreenSize.height
          )
          document.querySelector('#inputwidth').value = percentage(
            event.rect.width,
            previewScreenSize.width
          )
          document.querySelector('#inputheight').value = percentage(
            event.rect.height,
            previewScreenSize.height
          )

          let planId = document.querySelector('.shown').id

          let data = {
            cssrule: `#sequence-${sequenceId} #${event.target.id}{
          width: ${percentage(event.rect.width, previewScreenSize.width)}%;
          height: ${percentage(event.rect.height, previewScreenSize.height)}%;
          top: ${percentage(event.target.offsetTop, previewScreenSize.height)}%;
          left: ${percentage(
            event.target.offsetLeft,
            previewScreenSize.width
          )}%;
          }`,
          }

          // addRuleToSequence(sequenceId, planId, data)
          addRuleToObject(event.target.dataset.objectId, data)
        },
      },
    })

    .resizable({
      edges: { top: true, left: true, bottom: true, right: true },
      invert: 'reposition',

      listeners: {
        move: function (event) {
          let { x, y } = event.target.dataset

          x = (parseFloat(x) || 0) + event.deltaRect.left
          y = (parseFloat(y) || 0) + event.deltaRect.top

          Object.assign(event.target.style, {
            width: `${percentage(event.rect.width, previewScreenSize.width)}%`,
            height: `${percentage(
              event.rect.height,
              previewScreenSize.height
            )}%`,
          })

          Object.assign(event.target.dataset, { x, y })
        },
        end: function (event) {
          let planId = document.querySelector('.shown').id
          console.log(planId)

          document.querySelector('#inputx').value = percentage(
            event.target.offsetLeft,
            previewScreenSize.width
          )
          document.querySelector('#inputy').value = percentage(
            event.target.offsetTop,
            previewScreenSize.height
          )
          document.querySelector('#inputwidth').value = percentage(
            event.rect.width,
            previewScreenSize.width
          )
          document.querySelector('#inputheight').value = percentage(
            event.rect.height,
            previewScreenSize.height
          )

          let data = {
            cssrule: `#sequence-${sequenceId} #${event.target.id}{
          width: ${percentage(event.rect.width, previewScreenSize.width)}%;
          height: ${percentage(event.rect.height, previewScreenSize.height)}%;
          top: ${percentage(event.target.offsetTop, previewScreenSize.height)}%;
          left: ${percentage(
            event.target.offsetLeft,
            previewScreenSize.width
          )}%;
          }`,
          }

          // addRuleToSequence(sequenceId, planId, data)
          addRuleToObject(event.target.dataset.objectId, data)
        },
      },
    })
}

function moveToLayer(object, plan, position) {
  // v2: get the order from the index of the element in the domObject
  // further ------ closest
  // first  ------- last

  switch (position) {
    case 'farest':
      reorderObjectInPlan(
        config.strapi.url,
        plan.id.split('-')[1],
        object.dataset.objectId,
        'farest'
      )
        .then(plan.insertAdjacentElement('afterbegin', object))
        .catch((error) => {
          if (error) {
            console.log(error)
          }
        })
      break

    case 'closest':
      reorderObjectInPlan(
        config.strapi.url,
        plan.id.split('-')[1],
        object.dataset.objectId,
        'closest'
      )
        .then(plan.insertAdjacentElement('beforeend', object))
        .catch((error) => {
          if (error) {
            console.log(error)
          }
        })
      break

    case 'closer':
      if (object.nextElementSibling != null) {
        reorderObjectInPlan(
          config.strapi.url,
          plan.id.split('-')[1],
          object.dataset.objectId,
          'after',
          object.nextElementSibling.dataset.objectId
        )
          .then(
            object.nextElementSibling.insertAdjacentElement('afterend', object)
          )
          .catch((error) => {
            if (error) {
              console.log(error)
            }
          })
      }
      break

    case 'farther':
      if (object.previousElementSibling != null) {
        reorderObjectInPlan(
          config.strapi.url,
          plan.id.split('-')[1],
          object.dataset.objectId,
          'before',
          object.previousElementSibling.dataset.objectId
        )
          .then(
            object.previousElementSibling.insertAdjacentElement(
              'beforebegin',
              object
            )
          )
          .catch((error) => {
            if (error) {
              console.log(error)
            }
          })
      }
      break
  }

  // check plan total layer and save it as plan.dataset.layersTotal
  // do we need to know the total amount if we only move them and save their exact places?
  // not so sure. We can simply move thing, and not send if it’s first going back or last going top.

  if (!plan.dataset.layersTotal) {
    plan.dataset.layersTotal = plan.querySelectorAll('.object').length
  }
  // console.log(plan.dataset.layersToral)
  const totalLayer = plan.dataset.layersTotal
  // (is it really needed)

  // check asset layer
  // when added, and asset needs to have the layer (using the index of the relation when adding the image to the plan)
  // if you want to Zmove an asset. if the selected in the latest, it can only go toward 0, if it’s 0, it can oly go toward the final one.
  //

  // reorder layer
  // move the element at his position: position in the html = order
  // no z-index involve!

  // move the element on the right layer (moveAfter, moveBefore)
}

function writeCSS(plan, object, rules) {
  // where to save the css?
  // check the asset
  // asset has
  // create the stylesheet
  // assetId = planID + assetId
}

/*
deteleAsset
@params domObject asset - the removedasset 
*/
async function deleteObject() {
  const plan = document.querySelector('#previewScreen article.shown')
  const object = document.querySelector('.asset-selected')
  // send info to strapi
  removeObjectFromPlan(
    config.strapi.url,
    plan.id.split('-')[1],
    object.dataset.objectId
  ).then(object.remove())
}

function addRuleToObject(objectId, data) {
  return axios
    .put(`${config.strapi.url}/api/objects/${objectId}`, {
      data,
    })
    .then((response) => {
      console.log(response)
      return response
    })
    .catch((err) => {
      return err
    })
}

function percentage(partialValue, totalValue) {
  return ((100 * partialValue) / totalValue).toFixed(2)
}

function updateFromUi() {
  document.querySelector('#inputx').addEventListener('change', () => {
    document.querySelector('.asset-selected').style.left =
      document.querySelector('#inputx').value + '%'
  })
  document.querySelector('#inputy').addEventListener('change', () => {
    document.querySelector('.asset-selected').style.top =
      document.querySelector('#inputy').value + '%'
  })
  document.querySelector('#inputwidth').addEventListener('change', () => {
    document.querySelector('.asset-selected').style.width =
      document.querySelector('#inputwidth').value + '%'
  })
  document.querySelector('#inputheight').addEventListener('change', () => {
    document.querySelector('.asset-selected').style.height =
      document.querySelector('#inputheight').value + '%'
  })
}

export { deleteObject, interactObject, moveToLayer, updateFromUi }

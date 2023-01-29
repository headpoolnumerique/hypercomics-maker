import { removeAssetFromPlan } from './dataManagement.js'
import interact from 'interactjs'
import config from '../config/config.js'

// function

// move element
// resize element
// delete element
// rotate element

// const uiData

// asset manipulation

// when cllick an asset, it becomes asset-selected → all change in the UI will affect the img.

const assetManipulationUi = `<div>
<button id="rotate">Rotate</button>
<button id="resize">Resize</button>
<button id="moveFurther">plus loin</button>
<button id="moveCloser">plus près</button>
<button id="move">Move</button>
<button id="deleteAsset">Delete</button>
</div>`

function interactAsset(asset) {
  // wait for the image to appear to attach a interact
  const position = { x: asset.offsetLeft, y: asset.offsetTop }
  interact(asset)
    .draggable({
      listeners: {
        start(event) {
          // console.log(event.rect)
          // console.log(event.type, event.target)
        },
        move(event) {
          position.x += event.dx
          position.y += event.dy
          //write css here? and save css
          event.target.style.top = `${position.y}px `
          event.target.style.left = `${position.x}px `
        },
        end(event) {
          console.log(event)
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
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x}px, ${y}px)`,
          })

          Object.assign(event.target.dataset, { x, y })
        },
        end: function (event) {
          console.log(event)
        },
      },
    })
}

function moveToLayer(asset, plan, layer, position) {
  // check plan total layer and save it as plan.dataset.layersTotal
  // do we need to know the total amount if we only move them and save their exact places?
  // not so sure. We can simply move thing, and not send if it’s first going back or last going top.

  if (!plan.dataset.layersTotal) {
    plan.dataset.layersTotal = plan.querySelectorAll('.asset').length
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

function writeCSS(asset, rules) {
  // assetId = planID + assetId
}

/*
deteleAsset
@params domObject asset - the removedasset 
*/
async function deleteAsset() {
  const plan = document.querySelector('#previewScreen article.shown')
  const asset = document.querySelector('.asset-selected')
  // send info to strapi
  removeAssetFromPlan(
    config.strapi.url,
    plan.id.split('-')[1],
    asset.dataset.strapId
  ).then(asset.remove())
}

export { assetManipulationUi, deleteAsset, interactAsset }

import { removeAssetFromPlan } from './dataManagement.js'

import config from '../config/config.js'

// function:

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
<button id="move">Move</button>
<button  id="deleteAsset">Delete</button>
</div>`

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

export { assetManipulationUi, deleteAsset }

import config from '../config/config.js'
import { sequencePreview } from './selectors.js'

// data model for the plan:

// title
// data
// sequence (it belongs to)
// order
//
// assets
// title (useful to search later)
// src (image src)
// styles (css)
// type (background, foreground)
function createAsset(url, assetid, assetList, plan) {
  assetList.insertAdjacentHTML(
    `afterbegin`,
    `<li><img src="${config.strapi.url}${url}" id="assetlink-${assetid}" /></li>`
  )
  // pour chaque image ajoutée → enregistré dans le json.
  // update plan with asset
}

export { createAsset }

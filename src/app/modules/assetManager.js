import config from "../config/config.js"

function createAsset(url, assetid, assetList) {
  assetList.insertAdjacentHTML(
    `afterbegin`,
    `<li><img src="${config.strapi.url}${url}" id="assetlink-${assetid}" /></li>`
  )
}

export { createAsset }

// import config from '../config/config.js'
// import { sequencePreview } from './selectors.js'

// uploading image 
function addAssetToTheAssetManager(url, assetid, filename, assetList) {
  console.log(filename)
  if (assetList.querySelector(`[data-filename="${filename}"]`)) {
    return
  } else {
    assetList.insertAdjacentHTML(
      `afterbegin`,
      `<li><img  data-filename="${filename}" data-strapId="${assetid}" src="${url}" id="assetlink-${assetid}" /></li>`
    )
  }

  // remove stuff from the asset manager
  // function removeAssetsFromTheAssetsManager() {}

  // replace from the asset manager
}

export { addAssetToTheAssetManager }

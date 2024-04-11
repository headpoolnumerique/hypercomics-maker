// uploading image
function addAssetToTheAssetManager(url, assetid, filename, assetList) {
  if (assetList.querySelector(`[data-filename="${filename}"]`)) {
    return
  } else {
    assetList.insertAdjacentHTML(
      `afterbegin`,
      `<li>
      <img data-filename="${filename}" data-assetId="${assetid}" src="${url}" id="assetlink-${assetid}" />
      <span class="asset-filename">${filename}</span>
      
      </li>`
    )
  }
}


function replaceAsset(asset) {
  // add this button to the asset list item
  // <button id="replaceAsset">Replace</button>
  // in the future
  // strapi, upload a new asset
  // create a new variable with all the object the replaced asset was linked to.
  // strapi, remove the link to the object from the previous asset
  // strapi, upload a new asset
  // strapi, set the objects value of the new asset from the varialbe
}


//
// button replace asset should replace the assetID in the app with a new replace id
// upload a new image to strapi, get a new id, remove the object in the previous upload, 
// => get the previous id, update the . remove the object.

export { addAssetToTheAssetManager }

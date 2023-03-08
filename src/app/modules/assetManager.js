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

export { addAssetToTheAssetManager }

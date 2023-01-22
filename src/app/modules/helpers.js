function deselect(className) {
  //deselect the plan
  const selected = document.querySelector(className)
  if (!selected) return
  selected.classList.remove(className.replace('.', ''))
}

function showPreview(id) {
  deselect('.shown')
  document.querySelector(id).classList.add('shown')
}

function selectLink(link) {
  deselect('.selected')
  showPreview(link.hash)
  link.classList.add('selected')
}

function updateInteractiveUI(interactiveUI, data) {
  console.log("fun")
  console.log(interactiveUI)
  interactiveUI.innerHTML = data
}

/*
 * show/hide any block of UI
 * @param {DOMobject} block - the element to show/hide by adding a custom show / hide class
 */
function showHideBlock(block) {
  block.classList.toggle('show')
}

export { updateInteractiveUI, deselect, selectLink, showHideBlock }

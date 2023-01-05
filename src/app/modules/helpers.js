function deselect(className) {
  //deselect the plan
  const selected = document.querySelector(className)
  if (!selected) return
  selected.classList.remove(className.replace('.', ""))
}

function showPreview(id) {
  deselect('.shown')
  document.querySelector(`#${id}`).classList.add('shown');
}

function selectLink(link) {
  deselect('.selected')
  console.log(link)
  showPreview(link.href.split('#')[1])
  link.classList.add('selected')
}

export { deselect, selectLink }

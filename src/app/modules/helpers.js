function unselect() {
  const selected = document.querySelector('.selected')
  if (!selected) return
  selected.classList.remove('selected')
}


function selectLink(link) {
  console.log(link)
  unselect()
  link.classList.add('selected')
}


export { unselect, selectLink }

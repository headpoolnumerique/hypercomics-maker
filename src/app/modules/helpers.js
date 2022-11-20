function unselect() {
  const selected = document.querySelector('.selected')
  if (!selected) return
  selected.classList.remove('selected')
}

export { unselect }

function showMontage(montage) {
  montage.classList.toggle('show')
}

function addPlan(montageList, sequence) {
  const number = montageList.querySelectorAll('li').length + 1
  montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a href="#plan-${number}">${number}</a></li>`
  )
  sequence.insertAdjacentHTML(
    'beforeend',
    `<article id="plan-${number}">plan ${number}</article>`
  )
  window.location.hash = `#plan-${number}`
}

function selectLink(link) {
  document.querySelector(".selected")?.classList.remove('selected')
  link.classList.add('selected')
}


export { showMontage, addPlan, selectLink }

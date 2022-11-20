import { unselect } from './helpers.js'
function showMontage(montage) {
  montage.classList.toggle('show')
}

function addPlan(montageList, sequence) {
  const number = montageList.querySelectorAll('li').length + 1
  unselect()
  montageList.insertAdjacentHTML(
    'beforeend',
    `<li><a class="selected" href="#plan-${number}">${number}</a></li>`
  )
  sequence.insertAdjacentHTML(
    'beforeend',
    `<article id="plan-${number}"><span class="plan-name">${number}</span></article>`
  )

  window.location.hash = `#plan-${number}`
}

function selectLink(link) {
  unselect()
  link.classList.add('selected')
}


function importImgToPlan(img, plan) {

}


export { showMontage, addPlan, selectLink }

// import axios from '../vendors/setupAxios'

// ------------------------------------------------------todo ------------------------------------------------------
// function destroySequence(sequenceID) {
//    console.log ('destroy', sequenceID)
// }
// ------------------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------------todo ------------------------------------------------------
// function updateSequence(sequenceID) {
//    console.log ('update', sequenceID)
// }
// ------------------------------------------------------------------------------------------------------------------------------

function loadSequence(sequenceID) {
  console.log(`we’ll load an exising one: thi → ${sequenceID}`)
updateSequenceMeta(sequenceID)
}

function createSequence(sequenceID) {
  console.log(`were creating a sequence → ${sequenceID}`)
updateSequenceMeta(sequenceID)
}

function updateSequenceMeta(sequenceID) {
  const meta = {
    projectName: document.querySelector('#projectName'),
    sequenceNumber: document.querySelector('#sequenceNumber'),
  }
  meta.projectName.innerHTML = sequenceID
  meta.sequenceNumber.innerHTML = sequenceID
}
export { updateSequenceMeta, createSequence, loadSequence }

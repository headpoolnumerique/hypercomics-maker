import {
  createSequence,
  loadSequence,
  updateSequenceMeta,
} from './sequencesManagement'

function startup() {

  let sequenceID = window.location.hash
  

  // if there is a hash ,load the sequence
  if (sequenceID) {
    loadSequence(sequenceID)
    updateSequenceMeta(sequenceID)
  }

  // otherwise, create a sequence
  else {
    createSequence()
    updateSequenceMeta(sequenceID)
  }
}

export { startup }

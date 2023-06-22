//lib imports
import axios from 'axios'

// contains all the server calls
// function(serverUrl, collections, datasent, entryid)

async function createEntry(serverUrl, collection, data) {
  return axios
    .post(`${serverUrl}/api/${collection}/?populate=deep,5`, {
      data,
    })
    .then((response) => {
      return response
    })
    .catch((err) => {
      return err
    })
}

//update the entry
async function updateEntry(serverUrl, collection, data, id) {
  return axios
    .put(`${serverUrl}/api/${collection}/${id}`, {
      data,
    })
    .then((response) => {
      return response
    })
    .catch((err) => {
      return err
    })
}

// remove relation: disconnect entry from entry
async function disconnectEntryFromHost(
  serverUrl,
  hostEntryCollection,
  hostEntryId,
  guestEntryCollection,
  guestEntryId
) {
  let data = {
    guestEntryCollection: {
      disconnect: [
        {
          id: guestEntryId,
        },
      ],
    },
  }

  return axios
    .put(`${serverUrl}/api/${hostEntryCollection}/${hostEntryId}`, {
      data,
    })
    .then((response) => {
      return response
    })
    .catch((err) => {
      return err
    })
}

async function loadCollection(serverUrl, collection, query) {
  //load with a query
  return axios
    .get(`${serverUrl}/api/${collection}${query ? '?' + query : ''}`)
    .then((response) => {
      // console.log(response)
      return response
    })
    .catch((err) => {
      return err
    })
}

async function loadSingleEntry(serverUrl, collection, id, populatedeep = true) {
  return axios
    .get(
      `${serverUrl}/api/${collection}/${id}${
        populatedeep ? `?populate=deep,5` : ``
      }`
    )
    .then((response) => {
      // console.log(response)
      return response
    })
    .catch((err) => {
      return err
    })
}

export {
  loadCollection,
  loadSingleEntry,
  createEntry,
  updateEntry,
  disconnectEntryFromHost,
}

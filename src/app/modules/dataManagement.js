import axios from 'axios'

function updateData(serverUrl, collection, data, id) {
  return axios
    .post(`${serverUrl}/api/${collection}/${id}`, {
      data: JSON.stringify(data),
    })
    .then((response) => {
      console.log(response)
    })
    .catch((err) => {
      return err
    })
}

function createData(serverUrl, collection, data) {
  return axios
    .post(`${serverUrl}/api/${collection}/`, {
      data,
    })
    .then((response) => {
      return response
    })
    .catch((err) => {
      return err
    })
}

function loadCollection(serverUrl, collection) {
  return axios
    .get(`${serverUrl}/api/${collection}`)
    .then((response) => {
      console.log(response)
      return response
    })
    .catch((err) => {
      return err
    })
}
function loadSingle(serverUrl, collection, id) {
  return axios
    .get(`${serverUrl}/api/${collection}/${id}`)
    .then((response) => {
      console.log(response)
      return response
    })
    .catch((err) => {
      return err
    })
}
export { createData, updateData, loadCollection, loadSingle}

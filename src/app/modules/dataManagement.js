import axios from 'axios'

function updateData(serverUrl, collection, data, id) {
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

function loadCollection(serverUrl, collection, query) {
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
function loadSingle(serverUrl, collection, id, populatedeep = true) {
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
export { createData, updateData, loadCollection, loadSingle }

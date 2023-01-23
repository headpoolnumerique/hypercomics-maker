import axios from 'axios'

async function updateData(serverUrl, collection, data, id) {
  return axios
    .put(`${serverUrl}/api/${collection}/${id}?populate=deep,5`, {
      data,
    })
    .then((response) => {
      return response
    })
    .catch((err) => {
      return err
    })
}

async function createData(serverUrl, collection, data) {
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

// remove asset from the plan in strapi
async function removeAssetFromPlan(serverUrl, planId, assetId) {
  let data = {
    assets: {
      disconnect: [
        {
          id: assetId,
        },
      ],
    },
  }

  return axios
    .put(`${serverUrl}/api/plans/${planId}`, {
      data,
    })
    .then((response) => {
      return response
    })
    .catch((err) => {
      return err
    })
}

async function connectPlanWithOrder(serverUrl, planId, assetId, position) {
  console.log('assetId', assetId)
  let data = {
    assets: {
      connect: [
        {
          id: assetId,
        },
      ],
    },
  }

  if (position) {
    data.assets.connect.position = position
  }

  return axios
    .put(`${serverUrl}/api/plans/${planId}`, {
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

async function loadSingle(serverUrl, collection, id, populatedeep = true) {
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

function getAllImageFromPlan(plan) {
  const imgData = []
  plan.querySelectorAll('img').forEach((img) => {
    imgData.push(Number(img.id.split('-')[1]))
  })
  return imgData
}

export {
  createData,
  updateData,
  loadCollection,
  loadSingle,
  getAllImageFromPlan,
  connectPlanWithOrder,
  removeAssetFromPlan,
}

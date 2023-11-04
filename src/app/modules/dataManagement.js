import axios from 'axios'

async function updateData(serverUrl, collection, data, id) {
  return axios
    .put(`${serverUrl}/api/${collection}/${id}?populate=deep,5`, {
      data,
    })
    .then((response) => {
      console.log(response)
      return response;
    })
    .catch((err) => {
      return err;
    });
}

async function createData(serverUrl, collection, data) {
  return axios
    .post(`${serverUrl}/api/${collection}/?populate=deep,5`, {
      data,
    })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
}

// remove object from the plan in strapi
async function removeObjectFromPlan(serverUrl, planId, objectId) {
  let data = {
    objects: {
      disconnect: [
        {
          id: objectId,
        },
      ],
    },
  };

  return axios
    .put(`${serverUrl}/api/plans/${planId}`, {
      data,
    })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
}

// remove object from the plan in strapi
async function reorderObjectInPlan(
  serverUrl,
  planId,
  objectId,
  position,
  relativeTo
) {
  let savedPosition;

  switch (position) {
    case "farest":
      savedPosition = { start: true };
      break;
    case "closest":
      savedPosition = { end: true };
      break;
    case "after":
      savedPosition = { after: Number(relativeTo) };
      break;
    case "before":
      savedPosition = { before: Number(relativeTo) };
      break;
    default:
      console.log(position);
  }

  let data = {
    objects: {
      connect: [
        {
          id: Number(objectId),
          position: savedPosition,
        },
      ],
    },
  };

  return axios
    .put(`${serverUrl}/api/plans/${planId}`, {
      data,
    })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
}

async function connectObjectToPlan(serverUrl, planId, assetId) {
  let data = {
    plan: planId,
    assets: assetId,
  };

  const newObject = await axios
    .post(`${serverUrl}/api/objects/`, {
      data,
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      return err;
    });
  return newObject;
}

// async function connectObjectToPlan(serverUrl, planId, objectId, position) {
//   // 1. creer object
//   // 2. lier l’asset au object
//   // 3. render l’object
//
//   let data = {
//     object: {
//       plan: planId,
//       asset: assetId,
//     },
//
//
//   let newObject = await axios
//     .post(`${serverUrl}/api/objects/?populate=deep,5`, {
//       data
//     })
//     .then((response) => {
//       return response
//     })
//     .catch((err) => {
//       return err
//     })
//
//   // create an object, link the asset to it,
//   }
//
//   if (position) {
//     data.assets.connect.position = position
//   }
//
//   return axios
//     .put(`${serverUrl}/api/plans/${planId}`, {
//       data,
//     })
//     .then((response) => {
//       return response
//     })
//     .catch((err) => {
//       return err
//     })
// }

async function loadCollection(serverUrl, collection, query, populatedeep = true) {
  //load with a query
  return axios
    .get(`${serverUrl}/api/${collection}${query ? "?" + query : ""}`)
    .then((response) => {
      // console.log(response)
      return response;
    })
    .catch((err) => {
      return err;
    });
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
      return response;
    })
    .catch((err) => {
      return err;
    });
}

function getAllImageFromPlan(plan) {
  const imgData = [];
  plan.querySelectorAll("img").forEach((img) => {
    imgData.push(Number(img.id.split("-")[1]));
  });
  return imgData;
}

export {
  createData,
  updateData,
  loadCollection,
  loadSingle,
  getAllImageFromPlan,
  connectObjectToPlan,
  removeObjectFromPlan,
  reorderObjectInPlan,
};

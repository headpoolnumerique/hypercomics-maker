import axios from "axios";
import config from "../config/config";

async function createSequence(projectId) {
  // set up form
  return await axios
    .post(`${config.strapi.url}/api/sequences/?populate=deep`, {
      data: {
        project: projectId,
        title: "placeholder title",
      },
    })
    .then(function(response) {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}

export { createSequence };

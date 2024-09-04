import axios from "axios";
import config from "../config/config";

async function createSequence(projectId, author) {
  // set up form
  return await axios
    .post(`${config.strapi.url}/api/sequences/?populate=deep`, {
      data: {
        project: projectId,
        title: "placeholder title",
        author: author ? author : "",
      },
    })
    .then(function (response) {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}

export { createSequence };

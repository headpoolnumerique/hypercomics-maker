import config from "../config/config.js";
import axios from "axios";

async function createProject() {
  // set up form
  const formElement = document.querySelector("#form");

  formElement.addEventListener("submit", (e) => {
    e.preventDefault();

    //check if the honeypot has been touched
    const honey = document.querySelector(".nah");
    if (honey.value != "") return;

    let data = {};
    formElement.querySelectorAll(".usedvalue").forEach((input) => {
      data[input.name] = input.value;
    });

    axios
      .post(`${config.strapi.url}/api/projects/`, { data: data })
      .then(function(response) {
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

async function loadAllProjects(serverUrl) {
  //load with a query
  return axios
    .get(`${serverUrl}/api/projects?populate=deep`)
    .then((response) => {
      // console.log(response)
      return response;
    })
    .catch((err) => {
      return err;
    });
}

async function removeSequenceFromProject(projectId, sequenceId) {
  // set up form
  await axios
    .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
      data: {
        project: {
          disconnect: [{ id: projectId }],
        },
      },
    })
    .then(function(response) {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}

export { createProject, loadAllProjects, removeSequenceFromProject };

import config from "../config/config.js";
import axios from "axios";
import { renderDate } from "../modules/helpers.js";
import { getCookie } from "./login.js";

// selectors
let projectsList = document.querySelector("#projects-list");
let projectSequence = document.querySelector("#projectSequences");

export async function createProject() {
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
      .then(function (response) {
        // console.log("new", response.data.data);
        renderEmptyProject(response.data.data);
        return response;
      })
      .then(function (response) {
        window.location.hash = `#project${response.data.data.id}`;
      })

      // open the new project

      .catch((error) => {
        console.log(error);
      });
  });
}

export async function loadAllProjects(serverUrl) {
  //load with a query
  return axios
    .get(
      `${serverUrl}/api/projects?populate=deep,2&filters[archived][$eq]=false&filters[author][$eq]=${getCookie("hc_login_username")}`,
      {
        headers: { Authorization: `Bearer ${getCookie("hc_login_token")}` },
      },
    )
    .then((response) => {
      // console.log(response)
      return response;
    })
    .catch((err) => {
      return err;
    });
}

export async function removeSequenceFromProject(projectId, sequenceId) {
  // set up form
  await axios
    .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
      data: {
        project: {
          disconnect: [{ id: projectId }],
        },
      },
    })
    .then(function (response) {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function renderEmptyProject(project) {
  // console.log(project);
  projectsList.insertAdjacentHTML(
    "beforeend",
    `<li id="project-${project.id}"><datetime>${renderDate(
      project.attributes.updatedAt,
    )}</datetime> <a href="#project${project.id}">${
      project.attributes.title
    }</a></li>`,
  );

  // project for each sequence: create a list imenm

  const projectSequenceContent = `<section id="project${project.id}" class="project">
<header>
  <h2>${project.attributes.title}</h2>
  <button data-projectid="${project.id}" onclick="addSequence(${project.id}, window.username)" class="createSequence">Add a sequence</button>
  <button onclick="selectToDelete(${project.id}, '${project.attributes.title}')">Remove project</button>
</header>
  <ul class="sequences-list"></ul>
  </section>`;

  projectSequence.innerHTML += projectSequenceContent;
}

export async function archiveProject(id) {
  return axios
    .put(`${config.strapi.url}/api/projects/${id}`, {
      data: { archived: true },
    })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
}

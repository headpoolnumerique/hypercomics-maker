import axios from "axios";
import { createProject, loadAllProjects } from "./api/api-projects.js";
import config from "./config/config.js";
import { loadCollection } from "./modules/dataManagement.js";
import { renderDate } from "./modules/helpers.js";

start();

let projectsList = document.querySelector("#projects-list");
let projectSequence = document.querySelector("#projectSequences");

async function start() {
  // load all projects

  let projects = await loadAllProjects(
    config.strapi.url,
    "projects",
    "?populate=deep,5"
  );

  renderProjects(projects);
  //listenere to when you create a project
  createProject();
}

function renderProjects(data) {
  let projects = data.data.data;
  projectsList.innerHTML = "";
  projects.forEach((es) => {
    renderProject(es);
    console.log(es);
  });
}

async function renderProject(project) {
  console.log(project);
  projectsList.insertAdjacentHTML(
    "beforeend",
    ` <li> <datetime>${renderDate(
      project.attributes.updatedAt
    )}</datetime> <a href="#project${project.id}">${project.attributes.title
    }</a> </li> `
  );

  // project for each sequence: create a list imenm

  let renderedSequences = project.attributes.sequences.data.map((sequence) => {
    return generateSequence(sequence);
  });

  const projectSequenceContent = `<section id="project${project.id
    }" class="project">
  <a id="projectback" href="#projects">Back to projects</a>
  <h2>${project.attributes.title}</h2>
  <button id="createSection"> Create a sequence</button>
  <ul class="sequences-list">${renderedSequences.join("")}</ul>
  </section>`;

  projectSequence.innerHTML += projectSequenceContent;
}
function generateSequence(sequence) {
  return `<li><span class="sequence-id">${sequence.id}</span><span class="sequence-title">${sequence.attributes.title}</span> <div class="buttons"> <a href="editor.html?sequence=${sequence.id}">edit</a> <a href="reader.html?sequence=${sequence.id}">preview</a> </div> </li>`;
}


function createSequence( ) {
  // create sequence
  //
  // render the sequence
}

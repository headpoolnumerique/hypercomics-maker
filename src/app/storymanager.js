import {
  archiveProject,
  createProject,
  // archiveProject,
  loadAllProjects,
  removeSequenceFromProject,
} from "./api/api-projects.js";
import { createSequence } from "./api/api-sequences.js";
import config from "./config/config.js";
import { renderDate } from "./modules/helpers.js";

start();

let projectsList = document.querySelector("#projects-list");
let projectSequence = document.querySelector("#projectSequences");

async function start() {
  // load all projects
  let projects = await loadAllProjects(config.strapi.url);

  if (projects.data) {
    document.querySelector("#loading")?.remove();
  } else {
    console.log("loading error");
  }

  loadProjects(projects);
  createProject();
  // addSequences();
  // deleteSequences();

  window.deleteProject = deleteProject;
  window.addSequence = addSequence;
  window.deleteSequence = deleteSequence;
}

// load project
function loadProjects(data) {
  let projects = data.data.data;
  projectsList.innerHTML = "";
  projects.forEach((es) => {
    renderProject(es);
    console.log(es);
  });
}

// delete project
function deleteProject(id) {
  // archive on strapi
  archiveProject(id);
  // remove the project
  event.target.closest("li").remove();
  // remove the projectlist
  document.querySelector(`sequenceList${id}`).remove();
}

// render the project
async function renderProject(project) {
  // insert project in the project list
  projectsList.insertAdjacentHTML(
    "beforeend",
    ` <li> <datetime>${renderDate(
      project.attributes.updatedAt
    )}</datetime> <a href="#project${project.id}">${project.attributes.title
    }</a> 
    <button onclick="deleteProject(${project.id})">remove project</button>
    </li>`
  );

  // project for each sequence: create a list imenm

  let renderedSequences = project.attributes.sequences.data.map((sequence) => {
    return generateSequence(sequence, project);
  });

  const projectSequenceContent = `<section id="project${project.id
    }" class="project">
  <a id="projectback" href="#projects">Back to projects</a>
  <h2>${project.attributes.title}</h2>
  <button  data-projectid="${project.id}"
onclick="addSequence(${project.id})"
class="createSequence" >Add a sequence</button>
  <ul class="sequences-list" id="sequenceList${project.id
    }">${renderedSequences.join("")}</ul>
  </section>`;

  projectSequence.innerHTML += projectSequenceContent;
}

function generateSequence(sequence, project) {
  return `<li>
<span class="sequence-id">${sequence.id}</span>
<span class="sequence-title">${sequence.attributes.title}</span> 
<div class="buttons"> 
<a href="editor.html?sequence=${sequence.id}">edit</a> 
<a href="reader.html?sequence=${sequence.id}">preview</a>
<button class="deleteSeq" data-project-id="${project.id}" data-sequence-id="${sequence.id}" onclick="deleteSequence(${project.id}, ${sequence.id})">delete</button>
</div> 
</li>`;
}

async function addSequence(projectNumber) {
  let button = event.target;
  let newSeq = await createSequence(projectNumber);
  button.nextElementSibling.insertAdjacentHTML(
    "beforeend",
    `<li>
<span class="sequence-id">${newSeq.data.data.id}</span>
<span class="sequence-title">${newSeq.data.data.attributes.title}</span> 
<div class="buttons"> 
<a href="editor.html?sequence=${newSeq.data.data.id}">edit</a> 
<a href="reader.html?sequence=${newSeq.data.data.id}">preview</a>
<button class="deleteSeq" data-project-id="${projectNumber}" data-sequence-id="${newSeq.data.data.id}" onclick="deleteSequence(${projectNumber}, ${newSeq.data.data.id})" >delete</button>
</div> 
</li>`
  );
}

async function deleteSequence(projectId, sequenceId) {
  removeSequenceFromProject(projectId, sequenceId).then(
    event.target.closest("li").remove()
  );
}

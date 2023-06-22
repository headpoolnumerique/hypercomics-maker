import {
  createProject,
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

  let projects = await loadAllProjects(
    config.strapi.url,
    "projects",
    "?populate=deep,5"
  );

  renderProjects(projects);
  createProject();
  addSequences();
  deleteSequences();
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
    return generateSequence(sequence, project);
  });

  const projectSequenceContent = `<section id="project${project.id
    }" class="project">
  <a id="projectback" href="#projects">Back to projects</a>
  <h2>${project.attributes.title}</h2>
  <button  data-projectid="${project.id
    }" class="createSequence" >Add a sequence</button>
  <ul class="sequences-list">${renderedSequences.join("")}</ul>
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
<button class="deleteSeq" data-project-id="${project.id}" data-sequence-id="${sequence.id}">delete</button>
</div> 
</li>`;
}

async function addSequences() {
  document.querySelectorAll(".createSequence").forEach((button) => {
    button.addEventListener("click", async function(e) {
      let newSeq = await createSequence(e.target.dataset.projectid);
      console.log(newSeq.data.data);
      console.log(newSeq.data.data.attributes);
      e.target.nextElementSibling.insertAdjacentHTML(
        "beforeend",
        `<li>
<span class="sequence-id">${newSeq.data.data.id}</span>
<span class="sequence-title">${newSeq.data.data.attributes.title}</span> 
<div class="buttons"> 
<a href="editor.html?sequence=${newSeq.data.data.id}">edit</a> 
<a href="reader.html?sequence=${newSeq.data.data.id}">preview</a>
<button class="deleteSeq" data-project-id="${e.target.dataset.projectid}" data-sequence-id="${newSeq.data.data.id}">delete</button>
</div> 
</li>`
      );
      // generateSequence(response.data);
    });
  });
}
async function deleteSequences() {
  document.querySelectorAll(".deleteSeq").forEach((button) => {
    button.addEventListener("click", async function(e) {
      const projectId = e.target.dataset.projectId;
      const sequenceId = e.target.dataset.sequenceId;
      removeSequenceFromProject(projectId, sequenceId).then(
        e.target.closest("li").remove()
      );
    });
  });
}

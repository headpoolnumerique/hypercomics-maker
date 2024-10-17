import {
  archiveProject,
  createProject,
  // archiveProject,
  loadAllProjects,
  removeSequenceFromProject,
} from "./api/api-projects.js";
import { createSequence, renameSequences } from "./api/api-sequences.js";
import { isLoggedIn, login, hideLogin, getCookie } from "./api/login.js";
import config from "./config/config.js";
import { renderDate } from "./modules/helpers.js";

if (isLoggedIn()) {
  console.log("are you logged in?", isLoggedIn());
  start();
} else {
  //hide the loading bit and show the modal
  document.querySelector("#loading").classList.add("hide");
  document.querySelector("#login").showModal();
  loginButton();
}

function loginButton() {
  document
    .querySelector("#loginsubmit")
    .addEventListener("click", async function () {
      // const logged = await login(username, password);
      // check if ther is the doci
      // let token = getCookie("hc_login_token");
      const letsgo = await login(
        document.querySelector("#username").value,
        document.querySelector("#password").value,
      );
      if (letsgo) {
        {
          // this start only work if you’re in the start
          start();
          hideLogin();
          // error in the connexion
        }
      }
    });
}
export async function start() {
  if (getCookie("hc_login_username")) {
    const authorInput = document.querySelector("input[name=author]");
    if (authorInput) {
      authorInput.value = getCookie("hc_login_username");

      authorInput.setAttribute("disabled", "disabled");
    }
  }
  // load all projects
  let projects = await loadAllProjects(config.strapi.url);

  if (projects.data) {
    document.querySelector("#loading").classList.add("hide");
  } else {
    console.log("loading error");
  }

  loadProjects(projects);
  createProject();

  renameSequences();
  // addSequences();
  // deleteSequences();

  window.username = getCookie("hc_login_username");
  window.deleteProject = deleteProject;
  window.addSequence = addSequence;
  window.deleteSequence = deleteSequence;
  window.selectToDelete = selectToDelete;
  window.exportProject = exportProject;
}

// load project
function loadProjects(data) {
  console.log(data);
  if (!data.data.data) return console.log("no project yet");
  let projectsList = document.querySelector("#projects-list");
  let projectSequence = document.querySelector("#projectSequences");
  let projects = data.data.data;
  projectsList.innerHTML = "";
  projects.forEach((es) => {
    renderProject(es);
    // console.log(es);
  });
}

//confirmation to remove the existing project
function selectToDelete(id, title) {
  document
    .querySelector(".deletemodal")
    .querySelector(".projectid").textContent = id;
  document.querySelector(".deletemodal").querySelector(".title").textContent =
    title;
  document.querySelector(".deletemodal").showModal();
}

// delete project
function deleteProject(id) {
  console.log(document.querySelector(".deletemodal .title"));
  if (
    document.querySelector("#remove-project-name").value !=
    document.querySelector(".deletemodal .title").textContent
  ) {
    document.querySelector("#remove-project-name").value =
      "replace me with the project name";
    return console.log("can’t remove");
  }
  console.log(id);
  archiveProject(id);
  document.querySelector(`#project-${id}`).remove();
  document.querySelector(".deletemodal").close();
  document.querySelector(`#project${id}`).remove();
}

// render the project
async function renderProject(project) {
  let projectsList = document.querySelector("#projects-list");
  let projectSequence = document.querySelector("#projectSequences");
  // insert project in the project list
  projectsList.insertAdjacentHTML(
    "beforeend",
    ` <li id="project-${project.id}" data-title="${project.attributes.title}"><datetime>${renderDate(project.attributes.updatedAt)}</datetime>
        <a href="#project${project.id}">${project.attributes.title}</a> 
      </li>`,
  );

  // project for each sequence: create a list imenm

  let renderedSequences = project.attributes.sequences.data.map((sequence) => {
    return generateSequence(sequence, project);
  });

  const projectSequenceContent = `<section id="project${
    project.id
  }" class="project">
<header>
  <h2>${project.attributes.title}</h2>

  <button  data-projectid="${project.id}" onclick="addSequence(${project.id}, window.username)" class="createSequence">Add a sequence</button>
  <button onclick="selectToDelete(${project.id}, '${project.attributes.title}')">Remove project</button>
</header>
  <ul class="sequences-list" id="sequenceList${
    project.id
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
<a data-sequenceid=${sequence.id} href="#" class="rename">rename</a> 
<a href="reader.html?sequence=${sequence.id}">preview</a>
<a href="library.html?sequence=${sequence.id}">library</a>
<button class="deleteSeq" data-project-id="${project.id}" data-sequence-id="${sequence.id}" onclick="deleteSequence(${project.id}, ${sequence.id})">delete</button>
<button class="export"  data-sequence-id="${sequence.id}" onclick="exportProject(${sequence.id})">publish</button>
</div> 
<p id="feedback-${sequence.id}"></p>
</li>`;
}

async function addSequence(projectNumber, author) {
  let button = event.target;
  let newSeq = await createSequence(projectNumber, author);
  button
    .closest(".project")
    .querySelector("ul")
    .insertAdjacentHTML(
      "beforeend",
      `<li>
<span class="sequence-id">${newSeq.data.data.id}</span>
<span class="sequence-title" >${newSeq.data.data.attributes.title}</span> 
<div class="buttons"> 

<a href="editor.html?sequence=${newSeq.data.data.id}">edit</a> 
<a data-sequenceid=${newSeq.data.data.id} href="#" class="rename">rename</a> 
<a href="reader.html?sequence=${newSeq.data.data.id}">preview</a>
<button class="deleteSeq" data-project-id="${projectNumber}" data-sequence-id="${newSeq.data.data.id}" onclick="deleteSequence(${projectNumber}, ${newSeq.data.data.id})">delete</button>
<button class="export"  data-sequence-id="${newSeq.data.data.id}" onclick="exportProject(${newSeq.data.data.id})">publish</button>
</div> 
<p id="feedback-${newSeq.data.data.id}"></p>
</li>`,
    );
}

async function deleteSequence(projectId, sequenceId) {
  removeSequenceFromProject(projectId, sequenceId).then(
    event.target.closest("li").remove(),
  );
}

export async function renameSequence(sequenceId, sequenceTitle) {
  console.log("rename the sequecne");
}

export async function exportProject(seqId) {
  // Gather form data
  const feedback = document.querySelector(`#feedback-${seqId}`);
  console.log(feedback);
  feedback.innerHTML = "please wait while we’re publishing the sequence";
  // Create the data object to send to the server
  const data = { seqId: Number(seqId) };

  const body = JSON.stringify(data);
  try {
    // Send a POST request to the server using fetch
    const response = await fetch(`${config.exporturl}/hc-export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body, // Send the data as JSON
    });

    // Parse the JSON response from the server
    const result = await response.json();

    // Check if the response status is OK (200-299)
    if (response.ok) {
      feedback.innerHTML = `Success: <a href="${result.downloadLink}">download your file</a> or here is the <a href="${result.exportLink}">${result.exportLink}</span>`;
    } else {
      feedback.textContent = `Error: ${result.erreur || "Something went wrong"}`;
    }
  } catch (error) {
    // If there's a network error or some issue
    console.log(error.message);
    feedback.textContent = `Error: ${error.message}`;
  }
}

import axios from "axios";
import config from "../config/config";

export async function createSequence(projectId, author) {
  // set up form
  return await axios

    .post(`${config.strapi.url}/api/sequences/?populate=deep`, {
      data: {
        project: projectId,
        title: "click to rename the sequence",
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

export async function updateSequence(sequenceId, sequenceTitle) {
  return await axios
    .put(`${config.strapi.url}/api/sequences/${sequenceId}`, {
      data: {
        title: sequenceTitle,
      },
    })
    .then(function (response) {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function renameSequences() {
  document.body.addEventListener("click", function (e) {
    if (e.target.classList.contains("sequence-title")) {
      const seq = e.target;
      const sequenceId = e.target
        .closest("li")
        .querySelector(".sequence-id").textContent;
      document.querySelector(".renameModal").showModal();

      document.querySelector("#rename-sequence-title").value =
        e.target.textContent;

      document.querySelector("#rename-sequence-id").textContent = sequenceId;

      document
        .querySelector("#renameProject")
        .addEventListener("click", async function (e) {
          let newName = await updateSequence(
            sequenceId,
            document.querySelector("#rename-sequence-title").value,
          );
          console.log(newName);
          seq.textContent = newName.data.data.attributes.title;
          document.querySelector(".renameModal").close();
        });
    }
  });
}

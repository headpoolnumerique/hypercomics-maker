import config from "./config/config"; // Ensure this is correct
import axios from "axios";

manage();

async function manage() {
  // Automatically fill the sequenceNumber input field if it's present in the URL
  const sequenceNumberFromUrl = getUrlParameter("sequence");
  if (sequenceNumberFromUrl) {
    document.getElementById("sequenceNumber").value = sequenceNumberFromUrl;
  }

  document
    .querySelector("#sequenceForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent the form from reloading the page

      const sequenceId = document.getElementById("sequenceNumber").value;

      try {
        const response = await fetch(
          `${config.strapi.url}/api/assets?populate=deep,2&filters[sequence][id][$eq]=${sequenceId}`,
        );
        if (!response.ok) {
          throw new Error("Could not fetch data");
        }

        const data = await response.json();

        console.log(data);
        const sequenceTitle =
          data.data[0].attributes.sequence.data.attributes.title;

        document.querySelector("#results h2").innerHTML =
          `<small>#${sequenceId}</small> ${sequenceTitle}`;

        document.querySelector("#existingassets").innerHTML = "";

        const list = generateAssetList(data.data);
        document
          .querySelector("#existingassets")
          .insertAdjacentElement("beforeend", list);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        document.querySelector("#result").innerText =
          "Error fetching sequence data";
      }
    });

  preview();
  uploadImages();
}

function preview() {
  document.querySelector("#existingassets").addEventListener("click", (e) => {
    const targetAsset = e.target.closest(".asset");
    if (targetAsset) {
      document.querySelector("#previewbox").innerHTML = targetAsset.innerHTML;
    }
  });
}

function uploadImages() {
  document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    let filesToUpload = [];

    // Handle drag-and-drop events
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
      handleFiles(e.dataTransfer.files);
    });

    dropzone.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      handleFiles(e.target.files);
    });

    function handleFiles(files) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          filesToUpload.push(file);
        }
      }
    }

    // Upload button click event
    document.getElementById("uploadBtn").addEventListener("click", () => {
      const sequenceId = document.getElementById("sequenceNumber").value; // Ensure correct dynamic sequenceId
      uploadFiles(sequenceId);
    });

    async function uploadFiles(sequenceId) {
      if (filesToUpload.length === 0) {
        alert("No files selected.");
        return;
      }

      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append("files", file));

      try {
        const uploadResponse = await axios.post(
          `${config.strapi.url}/api/upload`,
          formData,
        );

        const uploadedFiles = uploadResponse.data;

        uploadedFiles.forEach(async (file) => {
          try {
            const assetResponse = await axios.post(
              `${config.strapi.url}/api/assets?populate=deep,2`,
              {
                data: {
                  title: `asset-${file.name}`,
                  filename: file.name,
                  location: `${config.strapi.url}${file.url}`,
                  sequence: sequenceId,
                },
              },
            );

            const newAsset = assetResponse.data.data;
            console.log(newAsset);
            addAssetToAssetList(newAsset);
          } catch (error) {
            console.error("Error creating asset:", error);
          }
        });
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
  });
}

// Function to generate the asset list
function generateAssetList(data) {
  const list = document.createElement("ul");
  list.className = "all-assets";
  data.forEach((item) => {
    list.innerHTML += `
      <li class="${item.attributes.used ? "used" : "unused"} asset" strapid="${item.id}">
        <img data-filename="${item.attributes.filename}" data-assetId="${item.id}" src="${item.attributes.location}" id="assetlink-${item.id}" />
        <span class="asset-filename">${item.attributes.filename}</span>
      </li>`;
  });
  return list;
}

// Function to add a new asset to the asset list
function addAssetToAssetList(item) {
  document.querySelector("#existingassets ul").insertAdjacentHTML(
    "afterbegin",
    `<li class="${item.attributes.used ? "used" : "unused"} asset" strapid="${item.id}">
      <img data-filename="${item.attributes.filename}" data-assetId="${item.id}" src="${item.attributes.location}" id="assetlink-${item.id}" />
      <span class="asset-filename">${item.attributes.filename}</span>
    </li>`,
  );
}

function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

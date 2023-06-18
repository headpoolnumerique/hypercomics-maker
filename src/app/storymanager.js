import axios from "axios";
import config from "./config/config.js";

createProject();

function createProject() {
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

    console.log(data);

    axios
      .post(`${config.strapi.url}/api/projects/`, {data: data})
      .then(function(response) {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

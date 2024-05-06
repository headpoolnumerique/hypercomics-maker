import config from "../config/config";
import { updateData } from "./dataManagement";

async function handleDelays() {
  // debounce to make sure we’re not pushing too much to the server

  const plandelay = document.querySelector("#minimaldelay");
  plandelay.addEventListener("input", async (event) => {
    const value = event.target.value;
    if (!value || isNaN(value)) return console.log("the delay is not a number");
    console.log("value change");
    // debounce doesnt seem to work. will try it again
    // debounce(async (value) => {
    const plan = document.querySelector(".shown");
    // Make an Axios request to update the server
    const data = {
      delay: value,
    };

    console.log(
      updateData(config.strapi.url, "plans", data, plan.dataset.strapId)
    );
    await updateData(
      config.strapi.url,
      "plans",
      data,
      plan.dataset.strapId
    ).then((response) => {
      console.log(response);
      plan.dataset.delay = value;
    });

    // debounce doesnt seem to work
    // }, 1000);
  });
}

function debounce(callback, delay) {
  let timeoutId;

  return async function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

function updateDelayUI() {
  const plan = document.querySelector(".shown");
  document.querySelector("#minimaldelay").value = plan.dataset.delay;
}

export { handleDelays, updateDelayUI };

import config from "../config/config";
import { updateData } from "./dataManagement";

async function handleDelays() {
  // debounce to make sure we’re not pushing too much to the server

  const plandelay = document.querySelector("#planDelay");
  plandelay.addEventListener("input", async (event) => {
    const value = event.target.value;
    console.log('value change')
    // debounce doesnt seem to work. will try it again
    // debounce(async (value) => {
      const planId = document.querySelector(".shown").dataset.strapId;
      // Make an Axios request to update the server
      const data = {
        delay: value,
      };

      console.log(data);
      console.log(updateData(config.strapi.url, "plans", data, planId));

      await updateData(config.strapi.url, "plans", data, planId);
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

export { handleDelays };

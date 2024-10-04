import config from "../config/config";
import { updateData } from "./dataManagement";
import { plandelay } from "./selectors";

async function handleDelays() {
  // debounce to make sure we’re not pushing too much to the server

  plandelay.addEventListener("input", async (event) => {
    const value = event.target.value;
    if (!value || isNaN(value)) return console.log("the delay is not a number");
    // console.log("value change");
    const plan = document.querySelector(".shown");
    // Make an Axios request to update the server
    const data = {
      delay: value,
    };
    await updateData(
      config.strapi.url,
      "plans",
      data,
      plan.dataset.strapId,
    ).then((response) => {
      plan.dataset.delay = value;
    });
  });

  //testing button
  testdelay();
}

function debounce(callback, delay) {
  let timeoutId;

  return async function (...args) {
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

function testdelay() {
  document.querySelector("#delaytest").addEventListener(
    "click",
    (e) => {
      let element = e.target;

      e.target.style.setProperty(
        "--delay-value",
        `${document.querySelector("#minimaldelay").value}ms`,
      );
      // -> removing the class
      element.classList.remove("running");

      // -> triggering reflow /* The actual magic */
      // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
      // Oops! This won't work in strict mode. Thanks Felis Phasma!
      // element.offsetWidth = element.offsetWidth;
      // Do this instead:
      void element.offsetWidth;

      // -> and re-adding the class
      element.classList.add("running");
    },
    false,
  );
}

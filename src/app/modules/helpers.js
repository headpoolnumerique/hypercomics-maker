function deselect(className) {
  //deselect the plan
  const selected = document.querySelector(className);
  if (!selected) return;
  selected.classList.remove(className.replace(".", ""));
}

function showPreview(id) {
  deselect(".shown");
  document.querySelector(id).classList.add("shown");
}

function selectLink(link) {
  deselect(".selected");
  showPreview(link.hash);
  link.classList.add("selected");
}

function updateInteractiveUI(interactiveUI, data) {
  console.log("fun");
  console.log(interactiveUI);
  interactiveUI.innerHTML = data;
}

function activatePlan(planId) {
  console.log("activatePlan" + planId)
  document.querySelector(`#plan-${planId}`).classList.add("shown");
  document.querySelector(`#link-${planId} a`).classList.add("selected");
}

/*
 * show/hide any block of UI
 * @param {DOMobject} block - the element to show/hide by adding a custom show / hide class
 */
function showHideBlock(block) {
  block.classList.toggle("show");
}

function value2percent(valueInPixel, objectValue) {
  //remove the px if there is a px in the value
  valueInPixel = valueInPixel.replace("px", "");

  // get the %
  return 100 * (valueInPixel / objectValue);
}

function px2screenSize(valueInPixel, orientation, unit) {
  let screenValue;
  if (orientation == "left") {
    screenValue = window.innerWidth;
  } else if (orientation == "top") {
    screenValue = window.innerHeight;
  }

  valueInPixel = valueInPixel.replace("px", "");
  return 100 * (valueInPixel / screenValue);
}

var isNumeric = function (num) {
  return (
    (typeof num === "number" ||
      (typeof num === "string" && num.trim() !== "")) &&
    !isNaN(num)
  );
};

function renderDate(date) {
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(undefined, options);
}

/** Update the dataset attribute of an html element from an object
 */
function updateDataset(element, obj) {
  Object.keys(obj).forEach((key) => {
    element.dataset[key] = obj[key];
  });
}


/*percentage calculator*/
function percentage(partialValue, totalValue) {
  return ((100 * partialValue) / totalValue).toFixed(2);
}
export {
  updateDataset,
  isNumeric,
  activatePlan,
  updateInteractiveUI,
  deselect,
  selectLink,
  showHideBlock,
  renderDate,
  percentage,
};

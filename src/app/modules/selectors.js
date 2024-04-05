const previewSpace = document.querySelector("#preview");
const previewScreen = document.querySelector("#previewScreen");
const montageScreen = document.querySelector("#banc-montage");
const montageList = document.querySelector("#planOrder");
const imageUploadInputs = document.querySelector("#assetsUpload");
const imageUpload = document.querySelector("#submitAssets");
const assetsList = document.querySelector("#assetsList");
const projectName = document.querySelector("#projectName");
const sequenceNumber = document.querySelector("#sequenceNumber");
const sequencePreview = document.querySelector("#previewScreen");
const contextUI = document.querySelector("#contextualUI");
const layerList = document.querySelector("#layers");
const zindexInteraction = document.querySelector(".zindex");
const plandelay = document.querySelector("#minimaldelay");

/*screen size*/
const screenWidthInput = document.querySelector("#screenWidth");
const screenHeightInput = document.querySelector("#screenHeight");
const screenRatioInput = document.querySelector("#screenRatio");

const screensList = document.querySelector("#screens");

const newScreenUi = document.querySelector("#screen-ui");
const newScreenForm = document.querySelector("#screensform");
const newScreenButton = document.querySelector("#newscreen");
const populateStylesheetButton = document.querySelector("#populateStylesheet");

/*in the future*/
const topAnchorRadio = document.querySelector("#topAnchor");
const bottomAnchorRadio = document.querySelector("#bottomAnchor");
const leftAnchorRadio = document.querySelector("#leftAnchor");
const rightAnchorRadio = document.querySelector("#rightAnchor");

const anchors = document.querySelectorAll(".anchorInput");

const stylesWrapper = document.querySelector("#styleWrapper");

export {
  anchors,
  plandelay,
  zindexInteraction,
  previewSpace,
  previewScreen,
  montageScreen,
  montageList,
  imageUploadInputs,
  imageUpload,
  assetsList,
  projectName,
  sequenceNumber,
  sequencePreview,
  contextUI,
  layerList,
  topAnchorRadio,
  rightAnchorRadio,
  bottomAnchorRadio,
  leftAnchorRadio,
  screenWidthInput,
  screenHeightInput,
  screenRatioInput,
  screensList,
  newScreenButton,
  newScreenForm,
  newScreenUi,
  populateStylesheetButton,
  stylesWrapper
};

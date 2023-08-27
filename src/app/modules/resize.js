import { previewScreen } from "./selectors.js";

// let lastWidth = previewScreen.offsetWidth;
// let lastHeight = previewScreen.offsetHeight;
// // Function to handle resize event
//
// function handleResize(previewScreen, lastWidth, lastHeight) {
//   const currentWidth = previewScreen.offsetWidth;
//   const currentHeight = previewScreen.offsetHeight;
//
//   if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
//     // Width or height has changed, update and do something
//     console.log("Width:", currentWidth, "Height:", currentHeight);
//
//     // Update lastWidth and lastHeight
//     lastWidth = currentWidth;
//     lastHeight = currentHeight;
//   }
// }
//
// function getSize() {
//   // Attach resize event listener
//   previewScreen.addEventListener(
//     "resize",
//     handleResize(previewScreen, lastWidth, lastHeight)
//   );
// }
// export { getSize };

function getSize() {
  const screenshotObserver = new ResizeObserver((screenshots) => {
    for (const screenshot of screenshots) {
      if (screenshot.contentBoxSize) {
        previewScreen.dataset.width = Math.round(
          screenshot.contentBoxSize[0].inlineSize
        );
        previewScreen.dataset.height = Math.round(
          screenshot.contentBoxSize[0].blockSize * 0.9
        );
      }
    }
  });

  // screenshot.dataset.width = screenshot.contentBoxSize

  screenshotObserver.observe(previewScreen);
}

export { getSize };

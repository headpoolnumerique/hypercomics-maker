function changeOrientation(previewEl) {
  const width = previewEl.style.getPropertyValue('width')
  const height = previewEl.style.getPropertyValue('height')
  previewEl.style.setProperty('width', height)
  previewEl.style.setProperty('height', width)
}

function fullPageWatcher(preview) {
  preview.classList.toggle('fullscreen')
}

function resizePreview(previewEl, width, height) {
  if (!previewEl) return console.log('no preview El!')
  // previewEl.querySelector().style.width
  previewEl.style.width = 'var(--preview-width)'
  previewEl.style.height = 'var(--preview-height)'
  previewEl.style.setProperty('--preview-width', width + `px`)
  previewEl.style.setProperty('--preview-height', height + `px`)
}

//resize event observer!
function previewResize() {
  const screens = document.querySelector('#previewScreen')
  const screenshotObserver = new ResizeObserver((screenshots) => {
    for (const screenshot of screenshots) {
      if (screenshot.contentBoxSize) {
        screens.forEach((screen) => {
          screen.dataset.width = Math.round(
            screenshot.contentBoxSize[0].inlineSize
          )
          screen.dataset.height = Math.round(
            screenshot.contentBoxSize[0].blockSize * 0.9
          )
        })
      }
      // screenshot.dataset.width = screenshot.contentBoxSize
    }
  })
  screenshotObserver.observe(screen)
}


 




// add image → save dataset
// move image → save dataset
// do something → save all the time.

// function resizeWatcher(preview) {
//   // to get the preview size
//   const screenshotObserver = new ResizeObserver((preview) => {
//     if (preview.contentBoxSize) {
//       preview.dataset.width = Math.round(preview.contentBoxSize[0].inlineSize)
//       preview.dataset.height = Math.round(
//         preview.contentBoxSize[0].blockSize * 0.9
//       )
//     }
//     console.log(preview)
//     screenshotObserver.observe(preview)
//   })
// }

// function changePreviewSize(width, height) {}

export { changeOrientation, fullPageWatcher, resizePreview }

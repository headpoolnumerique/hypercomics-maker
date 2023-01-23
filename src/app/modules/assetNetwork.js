// import axios from '../vendors/setupAxios.js'
import axios from 'axios'
import config from '../config/config.js'
import { addAssetToTheAssetManager } from './assetManager.js'



// manage all the assets in the assets manager : add / remove / change any image in the asset manager.

async function uploadToStrapi(input, strapiurl = config.strapi.url) {
  const formData = new FormData()

  const files = input.files

  //if there is no file do nothing
  if (files.length < 1) return

  let uploadedFiles = document.querySelector('#assets')
  // append the file to the form data for each file

  for (let i = 0; i < files.length; i++) {
    if(uploadedFiles.querySelector(`[src*="${files[i].name}"]`)) {
      return
    }
    formData.append('files', files[i], files[i].name)
    console.log(formData)
  }
  //debug: show the values of the image in the data
  // for (const value of formData.values()) {
  //   console.log(value)
  // }

  

  // post all files at once to strapi

  //upload to strapi folder
  axios
    .post(`${strapiurl}/api/upload`, formData)
    .then((response) => {
      console.log(response.data)

      response.data.forEach((file) => {
        // then add the img db
        axios
          .post(`${strapiurl}/api/assets`, {
            data: {
              title: `asset-${file.name}`,
              filename: file.name,
              location: config.strapi.url + file.url,
            },
          })
          .then((response) => {
            console.log(response.data.data)
            console.log(response.data.data.attributes.filename)
            //create the asset in the asset list
            addAssetToTheAssetManager(
              response.data.data.attributes.location,
              response.data.data.id,
              response.data.data.attributes.filename,
              document.querySelector('#assetsList')
            )
          })
          .catch((error) => {
            if (error) {
              console.log(error)
            }
          })
      })
    })
    .catch((error) => {
      if (error) {
        console.log(error)
      }
    })
}

export { uploadToStrapi }

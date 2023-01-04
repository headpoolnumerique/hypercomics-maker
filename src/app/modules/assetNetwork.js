// import axios from '../vendors/setupAxios.js'
import axios from 'axios'
import config from '../config/config.js'
import { createAsset } from './assetManager.js'

function uploadToStrapi(input, strapiurl = config.strapi.url) {
  const formData = new FormData()

  const files = input.files

  //if there is no file do nothing
  if (files.length < 1) return

  // append the file to the form data for each file
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i], files[i].name)
    console.log(formData)
  }
  //debug: show the values of the image in the data
  // for (const value of formData.values()) {
  //   console.log(value)
  // }

  // post all files at once to strapi
  axios.post(`${strapiurl}/api/upload`, formData).then((response) => {
    response.data
      .forEach((file) => {

        axios
          .post(`${strapiurl}/api/assets`, {
            data: {
              title: `asset-${file.id}`,
              filename: file.name,
            },
          })
          .then(({ data }) => {
            //create the asset in the asset list
            createAsset(
              file.url,
              data.data.id,
              document.querySelector('#assetsList')
            )
          })
          .catch((error) => {
            if (error) {
              console.log(error)
            }
          })
      })
      .catch((error) => {
        if (error) {
          console.log(error)
        }
      })
  })
}

export { uploadToStrapi }

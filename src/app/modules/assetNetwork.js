// import axios from '../vendors/setupAxios.js'
import axios from 'axios'
import config from '../config/config.js'
import { createAsset } from './assetManager.js'

function uploadToStrapi(input, strapiurl = config.strapi.url) {
  const formData = new FormData()

  const files = input.files

  if(files.length < 1 ) return

  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i], files[i].name)
  }

  for (const value of formData.values()) {
    console.log(value)
  }

  axios
    .post(`${strapiurl}/api/upload`, formData)
    .then((response) => {
      console.log(response)
      const file = response.data[0]

      console.log(response.data.url)

      axios
        .post(`${strapiurl}/api/assets`, {
          data: {
            title: `asset-${file.id}`,
            filename: file.name,
          },
        })
        .then(({ data }) => {
          // console.log(response.data.attributes.id)
          // console.log(response.data.attributes.filename)
          createAsset(response.data[0].url, data.data.id,  document.querySelector("#assetsList"))
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
}

export { uploadToStrapi }

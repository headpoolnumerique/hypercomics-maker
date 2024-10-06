1. a webserver to listen to 
- get the data from the server
- create a html file
- set the server in its right url
- download images and make them available in the /url/images


=> one simple node.js engine.


from the app, hit the publish button
it needs to send the following data: 
  - the token (is it needed? i don’t think so)
  - the project id
  - the sequence id.
    

with the sequence id we should be able to produce the website.
   



  Listen to the port, get the data (the bearer token, the login, the project and the sequence)

  build the html
  copy the image
  make the server running

- foldername = /{{story.slugify}}/images/
  => copy all images
- foldername = /{{story.slugify}}/index.html
  => create index.html (using the same setup as the preview)

render the url.

++++ this is where i want to put the content
function generateStory() => create the html from the server
function pullImages() => download all images from the server and copy them to the right folder 

example from the open publishing fest
https://gitlab.coko.foundation/open-publishing/open-publishing-fest-v2/-/blob/main/server.js?ref_type=heads

```


async function backupIMG(data) {
  data.forEach((img) => {
    downloadImage(
      configuration.strapi.server + img.imageUrl,
      img.imageName,
      folder
    );
  });
}




```




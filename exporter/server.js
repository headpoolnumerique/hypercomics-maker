// Importer les dépendances
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const archiver = require("archiver");
//use data from json
const strapiConfig = require("./strapiconfig.json");
const cors = require("cors");

// Créer une instance d'Express
const app = express();

// app.use(cors());

// Utiliser le middleware body-parser pour lire le JSON dans le corps des requêtes
//
app.use(bodyParser.json());

// create a folder for the temp

// cors
app.options("*", cors()); // Handle preflight requests for all routes
app.use(cors());

// serve public folder
app.use(express.static(path.join(__dirname, "public")));

app.post("/hc-export", async (req, res) => {
  try {
    const donnees = req.body; // Get the data from the request body
    ensureTempFolderExists(`temp/${donnees.seqId}/images/`);
    // createHTML and put it in the folder before zipping it
    const ziplink = await getData(donnees.seqId); // Wait for the ZIP file to be created
    // fs.cp("temp/", "../public/", (err) => {
    //   if (err) throw err;
    // });

    fs.cp(
      `temp/${donnees.seqId}`,
      `../public/stories/${donnees.seqId}/`,
      { recursive: true },
      (err) => {
        if (err) throw err;
        /* callback */
      },
    );

    res.json({
      downloadLink: `/stories/${ziplink}`,
      exportLink: `/stories/${donnees.seqId}/`,
    }); // Send the download link to the client
  } catch (error) {
    console.error("Error in /hc-export:", error);
    res.status(500).json({ error: "Failed to generate the ZIP file" });
  }
});

// Lancer le serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

//* axios get all the dada
async function getData(seqId) {
  // Usage
  // copy the passtrhough copy
  fs.cp("passthrough", `temp/${seqId}/`, { recursive: true }, (err) => {
    if (err) throw err;
    /* callback */
  });
  try {
    const response = await axios.get(
      `${strapiConfig.url}/api/sequences/${seqId}?populate=deep,4`,
    );

    // Save the data and images
    saveAsJson(response.data.data, seqId);
    await writeHTMLFile(seqId, `index`, await createHTML(response.data.data));

    await getAllImgs(response.data.data.attributes.assets.data, seqId);

    // Create the zip
    const tempFolderPath = path.join(__dirname, `temp/${seqId}/`);
    const zipFileName = `${seqId}.zip`;
    const zipFilePath = path.join(__dirname, "../public/stories/", zipFileName);

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log(
          `ZIP file ${zipFileName} created with ${archive.pointer()} total bytes`,
        );

        // deleteTempFolder(tempFolderPath);

        resolve();
      });

      archive.on("error", (err) => reject(err));

      archive.pipe(output);
      archive.directory(tempFolderPath, false); // Zip the entire temp folder
      archive.finalize();
    });

    // Return the download link
    return zipFileName;
  } catch (error) {
    console.error("Error generating the ZIP file:", error);
    throw error;
  }
}

function saveAsJson(data, seqId) {
  let filename = `temp/${seqId}/story.json`;
  let content = JSON.stringify(data);

  fs.writeFileSync(filename, content),
    "utf-8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("we saved the data!");
    };
}
async function getAllImgs(data, seqId) {
  for (const img of data) {
    try {
      await downloadImage(
        img.attributes.location,
        img.attributes.location.split("/")[
          img.attributes.location.split("/").length - 1
        ],
        `temp/${seqId}/images/`,
      );
    } catch (error) {
      console.error(
        `Error downloading image: ${img.attributes.filename}`,
        error,
      );
    }
  }
  console.log("All images have been downloaded.");
}

function ensureTempFolderExists(folderPath) {
  try {
    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
      // Folder doesn't exist, create it
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Temporary folder created at: ${folderPath}`);
    } else {
      console.log(`Temporary folder already exists at: ${folderPath}`);
    }
  } catch (err) {
    console.error(
      `Error while ensuring the temp folder exists: ${err.message}`,
    );
  }
}

async function downloadImage(url, file, location) {
  const newpath = path.resolve(__dirname, location, file);
  const writer = fs.createWriteStream(newpath);

  console.log("Starting image download:", url);

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`Download finished for: ${file}`);
        resolve();
      });
      writer.on("error", (error) => {
        console.error(`Error writing the file ${file}:`, error);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Failed to download image ${url}:`, error);
  }
}

// Function to delete the temp folder after zipping is complete
function deleteTempFolder(folderPath) {
  fs.rm(folderPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error while deleting the temp folder: ${err.message}`);
    } else {
      console.log(`Temporary folder deleted: ${folderPath}`);
    }
  });
}

async function writeHTMLFile(seqId, filename, html) {
  fs.writeFileSync(`temp/${seqId}/${filename}.html`, html, (err) => {
    if (err) throw err;
  });
}

async function createHTML(data) {
  //fill those with the content and save it a html
  const stylesheets = renderstylesheet(data.attributes.stylesheets);
  // const projectToc = "";
  const sequenceToc = renderToc(data.attributes.plans);
  // const storyContent = "";
  const storyContent = renderSequence(data.attributes.plans);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <title>hypercomics reader</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="./css/reader.css" />
${stylesheets}
  </head>

  <body>
    <aside id="loading">
      <div class="box">
        <div id="dots">
          <div id="dot1" class="dot"></div>
          <div id="dot2" class="dot"></div>
          <div id="dot3" class="dot"></div>
        </div>
      </div>
    </aside>
    <div id="ratioElement"></div>
    <section id="project-toc">
      <!-- <a href="#previousSequence">previousSequence</a> -->
      <!-- <a href="#nextSequence">nextSequence</a> -->
    </section>
    <section id="story">
      <!-- <button class="moveButton" id="previewPrevious"><</button> -->
      <!-- <button class="moveButton" id="previewNext">></button> -->
      <!-- <article id="previewScreen"></article> -->
${storyContent}
    </section>
    <ol id="sequence-toc">

${sequenceToc}
    </ol>
  </body>
  <script src="./js/hc-read.js"></script>
</html>
`;
  return html;
}

function fillPlan(plan) {
  // fill the plan with all the existing images
  // find the plan
  let objectsToFillWith = plan.attributes.objects?.data;
  // console.log(plan.attributes, objectsToFillWith);

  let fillingObjects = "";
  // // fill the asset manager with the images
  objectsToFillWith.forEach((object) => {
    // console.log(object)

    object.attributes.assets.data.forEach((asset) => {
      fillingObjects =
        fillingObjects +
        `<img 
        id="inuse-${plan.id}-${object.id}" 
        data-objectId="${object.id}" data-planid="${plan.id}"
        data-assetid="${asset.id}" src="images/${asset.attributes.location.split("/")[asset.attributes.location.split("/").length - 1]}" class="asset">`;
    });
  });
  return fillingObjects;
}

function renderstylesheet(stylesheetdata) {
  let styleblock = "";

  stylesheetdata.data.forEach((stylesheet) => {
    styleblock =
      styleblock +
      "\n" +
      `<style data-styleid="${stylesheet.id}" data-ratio="${(stylesheet.attributes.maxwidth / stylesheet.attributes.defaultHeight).toFixed(2)}">${stylesheet.attributes.cssrules}</style>\n`;
  });
  return styleblock;
}

//render the toc form the plandata
function renderToc(plansdata) {
  let toc = "";
  plansdata.data.forEach((plan, index) => {
    toc =
      toc +
      `<li ${index == 0 ? `class="selected"` : ""} id="link-${
        plan.id
      }"><a class="" href="#plan-${plan.id}">${index + 1}</a></li>`;
  });
  return toc;
}

//render the story form the plandata
function renderSequence(plansdata) {
  let story = "";
  plansdata.data.forEach((plan, index) => {
    // find the first plan and add the following system
    if (index === 0) {
      firstPlan = `#plan-${plan.id}`;
    }

    const previousPlan = plansdata[index - 1]
      ? `#plan-${plansdata[index - 1].id}`
      : false;
    const nextPlan = plansdata[index + 1]
      ? `#plan-${plansdata[index + 1].id}`
      : false;

    story =
      story +
      `<article ${
        plan.attributes.delay
          ? `data-story-delay="${plan.attributes.delay}"`
          : ""
      } data-strap-id="${plan.id}" class="plan" id="plan-${plan.id}">
        ${
          previousPlan
            ? `<a class="previousPlan" href="${previousPlan}">←</a>`
            : ""
        }
        ${nextPlan ? `<a class="nextPlan" href="${nextPlan}">→</a>` : ""}

        ${fillPlan(plan)}

    </article>`;
  });
  return story;
}

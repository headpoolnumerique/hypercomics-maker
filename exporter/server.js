// Importer les dépendances
//
const qs = require("qs");
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

    await fs.promises.cp(
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
    // const response = await axios.get(
    //   `${strapiConfig.url}/api/sequences/${seqId}`,
    // );

    const response = await loadSequenceData(strapiConfig.url, seqId);

    // Save the data and images
    saveAsJson(response.data[0], seqId);
    await writeHTMLFile(seqId, `index`, await createHTML(response.data[0]));

    await getAllImgs(response.data[0].assets, seqId);

    // Create the zip
    const tempFolderPath = path.join(__dirname, `temp/${seqId}/`);

    const storiesFolder = path.join(__dirname, "../public/stories/");
    await fs.promises.mkdir(storiesFolder, { recursive: true });

    const zipFileName = `${seqId}.zip`;
    const zipFilePath = path.join(storiesFolder, zipFileName);

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log(
          `ZIP file ${zipFileName} created with ${archive.pointer()} total bytes`,
        );
        resolve();
      });

      archive.on("error", (err) => reject(err));

      archive.pipe(output);
      archive.directory(tempFolderPath, false);
      archive.finalize();
    });

    // Return the download link
    return zipFileName;
  } catch (error) {
    console.error("Error generating the ZIP file:", error);
    throw error;
  }
}

//save as json
async function saveAsJson(data, seqId) {
  const filename = `temp/${seqId}/story.json`;
  const content = JSON.stringify(data, null, 2);
  try {
    await fs.promises.writeFile(filename, content, "utf-8");
    console.log("we saved the data!");
  } catch (err) {
    console.error("Error saving JSON:", err);
  }
}

// get all images
async function getAllImgs(data, seqId) {
  for (const img of data) {
    try {
      await downloadImage(
        img.location,
        img.location.split("/")[img.location.split("/").length - 1],
        `temp/${seqId}/images/`,
      );
    } catch (error) {
      console.error(`Error downloading image: ${img.filename}`, error);
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
  fs.writeFile(`temp/${seqId}/${filename}.html`, html, (err) => {
    if (err) throw err;
  });
}

async function createHTML(data) {
  //fill those with the content and save it a html
  const stylesheets = renderstylesheet(data.stylesheets);
  // const projectToc = "";
  const sequenceToc = renderToc(data.plans);
  // const storyContent = "";
  const storyContent = renderSequence(data.plans);
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
  let objectsToFillWith = plan.objects;
  //

  console.log("tofill", objectsToFillWith);

  let fillingObjects = "";
  // // fill the asset manager with the images
  objectsToFillWith.forEach((object) => {
    // console.log(object)

    object.assets.forEach((asset) => {
      fillingObjects =
        fillingObjects +
        `<img 
        id="inuse-${plan.documentId}-${object.documentId}" 
        data-objectId="${object.documentId}" data-planid="${plan.documentId}"
        data-assetid="${asset.documentId}" src="images/${asset.location.split("/")[asset.location.split("/").length - 1]}" class="asset">`;
    });
  });
  return fillingObjects;
}

function renderstylesheet(stylesheetdata) {
  let styleblock = "";

  stylesheetdata.forEach((stylesheet) => {
    styleblock =
      styleblock +
      "\n" +
      `<style data-styleid="${stylesheet.documentId}" data-ratio="${(stylesheet.maxwidth / stylesheet.defaultHeight).toFixed(2)}">${stylesheet.cssrules}</style>\n`;
  });
  return styleblock;
}

//render the toc form the plandata
function renderToc(plansdata) {
  let toc = "";
  plansdata.forEach((plan, index) => {
    toc =
      toc +
      `<li ${index == 0 ? `class="selected"` : ""} id="link-${
        plan.documentId
      }"><a class="" href="#plan-${plan.documentId}">${index + 1}</a></li>`;
  });
  return toc;
}

//render the story form the plandata
function renderSequence(plansdata) {
  let story = "";
  plansdata.forEach((plan, index) => {
    // find the first plan and add the following system
    if (index === 0) {
      firstPlan = `#plan-${plan.documentId}`;
    }

    const previousPlan = plansdata[index - 1]
      ? `#plan-${plansdata[index - 1].documentId}`
      : false;
    const nextPlan = plansdata[index + 1]
      ? `#plan-${plansdata[index + 1].documentId}`
      : false;

    story =
      story +
      `<article ${
        plan.delay ? `data-story-delay="${plan.delay}"` : ""
      } data-strap-id="${plan.documentId}" class="plan" id="plan-${plan.documentId}">
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

async function loadSequenceData(serverUrl, sequenceId) {
  const query = qs.stringify(
    {
      filters: { documentId: { $eq: sequenceId } },
      populate: {
        project: "true", // top-level relation
        assets: "true", // top-level relation
        stylesheets: "true", // top-level relation
        plans: {
          populate: {
            objects: {
              populate: {
                assets: {
                  populate: {
                    objects: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    { encodeValuesOnly: true },
  );

  try {
    const response = await axios.get(`${serverUrl}/api/sequences?${query}`);
    return response.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err;
  }
}

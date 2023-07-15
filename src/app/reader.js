import { readingTools } from "./readerModules/anim.js";
import { generateStory } from "./readerModules/generateStory.js";

start();

async function start() {
  generateStory()
    .then(readingTools())
    .finally(document.querySelector("#loading")?.remove());
}
// generate the story

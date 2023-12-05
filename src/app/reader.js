import { readingTools } from "./readerModules/anim.js";
import { generateStory } from "./readerModules/generateStory.js";

start();

async function start() {
  await generateStory();
  await readingTools();
  document.querySelector("#loading")?.remove();
}
// generate the story

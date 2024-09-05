import { readingTools } from "./readerModules/anim.js";
import { generateStory } from "./readerModules/generateStory.js";

beginRead();

async function beginRead() {
  await generateStory();
  await readingTools();
  document.querySelector("#loading")?.remove();
}
// generate the story

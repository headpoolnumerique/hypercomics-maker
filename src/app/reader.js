import { readingTools } from "./readerModules/anim.js";
import { generateStory } from "./readerModules/generateStory.js";

start()

async function start() {
  generateStory().then(readingTools());
}
// generate the story

import { sortByRatio } from "../modules/stylesheet";
import { parse, stringify } from "../vendors/css/css.js";

export function loadStylesForPreview(stylesheets) {
  const sortedStylesheets = sortByRatio(stylesheets, true);

  let ratioArrays = [];

  sortedStylesheets.forEach((stylesheet, index) => {
    console.log(stylesheet);
    if (stylesheet?.cssrules == null) return;
    if (stylesheet.disabled) return;

    const defaultStyle = index == 0 ? "default" : "";
    const styleEl = `<style class="story-styles ${defaultStyle ? "defaut-style" : ""}" data-strapid="${stylesheet.documentId}" type="text/css" id="style-${stylesheet.documentId}" data-height="${stylesheet.defaultHeight}" data-width="${stylesheet.maxwidth}">${stylesheet.cssrules}</style>`;

    if (defaultStyle) {
      let defaultStylesheet = parse(stylesheet.cssrules);
      defaultStylesheet.stylesheet.rules =
        defaultStylesheet.stylesheet.rules[0].rules;
      document.querySelector("#default-styles").textContent =
        stringify(defaultStylesheet);
    } else {
      document.head.insertAdjacentHTML("beforeend", styleEl);
    }
    let regex = /max-aspect-ratio:\s*([\d.]+)/;
    const ratio = parse(
      stylesheet.cssrules,
    ).stylesheet.rules[0].container.match(regex)[1];
    ratioArrays.push(ratio);
  });
  return ratioArrays;
}

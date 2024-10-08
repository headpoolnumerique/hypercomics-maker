import { sortByRatio } from "../modules/stylesheet";
import { parse, stringify } from "../vendors/css/css.js";

export function loadStylesForPreview(stylesheets) {
  const sortedStylesheets = sortByRatio(stylesheets, true);

  let ratioArrays = [];

  sortedStylesheets.forEach((stylesheet, index) => {
    console.log(stylesheet);
    if (stylesheet?.attributes.cssrules == null) return;
    if (stylesheet.attributes.disabled) return;

    const defaultStyle = index == 0 ? "default" : "";
    const styleEl = `<style class="story-styles ${defaultStyle ? "defaut-style" : ""}" data-strapid="${stylesheet.id}" type="text/css" id="style-${stylesheet.id}" data-height="${stylesheet.attributes.defaultHeight}" data-width="${stylesheet.attributes.maxwidth}">${stylesheet.attributes.cssrules}</style>`;

    if (defaultStyle) {
      let defaultStylesheet = parse(stylesheet.attributes.cssrules);
      defaultStylesheet.stylesheet.rules =
        defaultStylesheet.stylesheet.rules[0].rules;
      document.querySelector("#default-styles").textContent =
        stringify(defaultStylesheet);
    } else {
      document.head.insertAdjacentHTML("beforeend", styleEl);
    }
    let regex = /max-aspect-ratio:\s*([\d.]+)/;
    const ratio = parse(
      stylesheet.attributes.cssrules,
    ).stylesheet.rules[0].container.match(regex)[1];
    ratioArrays.push(ratio);
  });
  return ratioArrays;
}

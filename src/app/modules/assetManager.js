import axios from "axios";
import config from "../config/config";

import { assetsList, buttonRefreshLibrary, sequenceNumber } from "./selectors";

// uploading image
export function addAssetToTheAssetManager(
  url,
  assetid,
  filename,
  createdAt,
  assetsList,
  used = true,
) {
  // console.log(assetsList);
  if (assetsList.querySelector(`[data-filename="${filename}"]`)) {
    return;
  } else {
    assetsList.insertAdjacentHTML(
      `afterbegin`,
      `<li data-filename="${filename}" data-createdAt="${createdAt}" class="${used ? "used" : "unused"}" strapid="${assetid}">
        <img data-filename="${filename}"  data-assetId="${assetid}" src="${url}" id="assetlink-${assetid}" />
      <span class="asset-filename">${filename}</span>
      <button class="removeAsset" onclick="removeAsset(${assetid}, this)">remove</button>

      </li>`,
    );
  }
}

export async function reloadAssetsSetup() {
  const sequenceId = document.querySelector("#sequenceNumber").textContent;
  buttonRefreshLibrary.addEventListener("click", function (e) {
    axios
      .get(
        `${config.strapi.url}/api/assets?populate=deep,2&filters[sequence][id][$eq]=${sequenceId}`,
      )

      .then((response) => {
        // console.log(response.data.data);
        response.data.data.forEach((asset) => {
          // console.log(asset);
          addAssetToTheAssetManager(
            asset.attributes.location,
            asset.id,
            asset.attributes.filename,
            asset.attributes.createdAt,
            assetsList,
            false,
          );
        });
      });
  });
}

export async function removeAsset(assetid, el) {
  // console.log("remove asset " + assetid);
  // console.log(el);
  // strapi unlink the asset from the asset list and from all plan

  await axios
    .put(`${config.strapi.url}/api/assets/${assetid}?populate=deep,2`, {
      data: {
        sequences: "",
      },
    })
    .then(function (response) {
      el.closest("li").remove();
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}

// add unused assets to the asset manager

export function addUnusedAssetToTheAssetManager(sequencedata) {
  sequencedata.data?.attributes.assets.data.forEach((data) => {
    if (data.attributes.objects.data.length > 0) return;
    addAssetToTheAssetManager(
      data.attributes.location,
      data.id,
      data.attributes.filename,
      data.attributes.createdAt,
      assetsList,
      false,
    );
  });
}

function replaceAsset(asset) {
  // add this button to the asset list item
  // <button id="replaceAsset">Replace</button>
  // in the future
  // strapi, upload a new asset
  // create a new variable with all the object the replaced asset was linked to.
  // strapi, remove the link to the object from the previous asset
  // strapi, upload a new asset
  // strapi, set the objects value of the new asset from the varialbe
}

//
// button replace asset should replace the assetID in the app with a new replace id
// upload a new image to strapi, get a new id, remove the object in the previous upload,
// => get the previous id, update the . remove the object.

//
//
// export function assetsFilter() {
//   document.querySelector(#assetsFilter).addEventListener("change", (event) => {
//
//     if(event.target.value.length < 2) {
//       return
//     }
//
//     document.query
//       // showEverything()
// // show only the one with the name
//
//     }
//
//   })
// }

export function liveSearch() {
  let elements = document.querySelectorAll("#assetsList li");
  let elementList = document.querySelector("#assetsList");

  let search_query = document.querySelector("#assetsFilter").value;

  if (search_query.length < 1) {
    elementList.classList.remove("searchmode");
    document.querySelectorAll(".is-found").forEach((el) => {
      el.classList.remove("is-found");
    });
    return;
  } else {
    elementList.classList.add("searchmode");
  }
  //Use innerText if all contents are visible
  //Use textContent for including hidden elements
  for (var i = 0; i < elements.length; i++) {
    // no needs for log
    // console.log(elements[i].textContent);
    // console.log(search_query.toLowerCase().trim());
    // console.log(
    //   elements[i].textContent
    //     .toLowerCase()
    //     .includes(search_query.toLowerCase()),
    // );
    if (
      elements[i]
        .querySelector(".asset-filename")
        .textContent.toLowerCase()
        .includes(search_query.toLowerCase())
    ) {
      elements[i].classList.add("is-found");
    } else {
      elements[i].classList.remove("is-found");
    }
  }
}
export function sortAssets() {
  document
    .querySelector(".asset-order-by")
    .addEventListener("click", (event) => {
      switch (event.target.id) {
        case "orderbyasc":
          sortList("data-filename", "asc");
          break;
        case "orderbydesc":
          sortList("data-filename", "desc");
          break;
        case "orderbydateasc":
          sortList("data-createdat", "asc");
          break;
        case "orderbydatedesc":
          sortList("data-createdat", "desc");
          break;
        case "orderbynumasc":
          sortListNum("data-filename", "asc");
          break;
        case "orderbynumdesc":
          sortListNum("data-filename", "desc");
          break;
        default:
          break;
      }
    });
}

function sortListNum(sortBy, direction) {
  const items = Array.from(assetsList.querySelectorAll("li"));

  // Sorting the <li> elements based on either data-date or data-filename

  // Sorting the <li> elements based on either data-date or data-filename
  items.sort((a, b) => {
    // Get attribute values
    let valueA = a.getAttribute(sortBy);
    let valueB = b.getAttribute(sortBy);

    // Extract the first number from each string or set to null if no match is found
    let numA = valueA.match(/\d+/)
      ? parseInt(valueA.match(/\d+/)[0], 10)
      : null;
    let numB = valueB.match(/\d+/)
      ? parseInt(valueB.match(/\d+/)[0], 10)
      : null;

    // Logic to handle null values (no number) by pushing them to the end
    if (numA === null && numB === null) return 0;
    if (numA === null) return 1; // a goes after b if it has no number
    if (numB === null) return -1; // b goes after a if it has no number

    // Sorting logic for items with numbers
    return direction === "asc" ? numA - numB : numB - numA;
  });

  // Re-append sorted <li> elements back to the <ul>
  items.forEach((item) => assetsList.appendChild(item));
}
function sortList(sortBy, direction) {
  const items = Array.from(assetsList.querySelectorAll("li"));

  // Sorting the <li> elements based on either data-date or data-filename
  items.sort((a, b) => {
    let valueA = a.getAttribute(sortBy);
    let valueB = b.getAttribute(sortBy);

    // Handle date sorting if sorting by data-date
    if (sortBy === "data-createdat") {
      console.log("data-createdat");
      valueA = new Date(valueA);
      valueB = new Date(valueB);
      if (direction == "asc") {
        return valueA - valueB; // Sort by ascending date
      } else if (direction == "desc") {
        return valueB - valueA; // Sort by ascending date
      }
    }

    // Sort filenames alphabetically if sorting by data-filename
    else if (direction == "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Re-append sorted <li> elements back to the <ul>
  items.forEach((item) => assetsList.appendChild(item));
}

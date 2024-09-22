import axios from "axios";
import config from "../config/config";

// uploading image
export function addAssetToTheAssetManager(
  url,
  assetid,
  filename,
  assetList,
  used = true,
) {
  if (assetList.querySelector(`[data-filename="${filename}"]`)) {
    return;
  } else {
    assetList.insertAdjacentHTML(
      `afterbegin`,
      `<li class="${used ? "used" : "unused"}" strapid="${assetid}">
      <img data-filename="${filename}" data-assetId="${assetid}" src="${url}" id="assetlink-${assetid}" />
      <span class="asset-filename">${filename}</span>
      <button class="removeAsset" onclick="removeAsset(${assetid}, this)">remove</button>
      </li>`,
    );
  }
}

export async function removeAsset(assetid, el) {
  console.log("remove asset " + assetid);
  console.log(el);
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

  // once done remove
}

// add unused assets to the asset manager
export function addUnusedAssetToTheAssetManager(sequencedata) {
  sequencedata.data?.attributes.assets.data.forEach((data) => {
    console.log(data.attributes.objects);
    if (data.attributes.objects.data.length > 0) return;
    addAssetToTheAssetManager(
      data.attributes.location,
      data.id,
      data.attributes.filename,
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
      elements[i].textContent.toLowerCase().includes(search_query.toLowerCase())
    ) {
      elements[i].classList.add("is-found");
    } else {
      elements[i].classList.remove("is-found");
    }
  }
}

// upload when dropping the files in the content

// uploading image
export function addAssetToTheAssetManager(url, assetid, filename, assetList) {
  if (assetList.querySelector(`[data-filename="${filename}"]`)) {
    return;
  } else {
    assetList.insertAdjacentHTML(
      `afterbegin`,
      `<li>
      <img data-filename="${filename}" data-assetId="${assetid}" src="${url}" id="assetlink-${assetid}" />
      <span class="asset-filename">${filename}</span>
      
      </li>`,
    );
  }
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
    console.log(elements[i].textContent);
    console.log(search_query.toLowerCase().trim());
    console.log(
      elements[i].textContent
        .toLowerCase()
        .includes(search_query.toLowerCase()),
    );
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


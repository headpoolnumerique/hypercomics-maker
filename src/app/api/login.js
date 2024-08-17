import axios from "axios";
import config from "../config/config";
import { startup } from "../modules/startup";
import { start } from "../storymanager";

export function isLoggedIn(username, password) {
  // warning, the cookie on localhost is shared with a lot other!
  if (getCookie("hc_login_token")) {
    // TODO check the token validation, if unvalid remake one
    return true;
  } else {
    return false;
  }
}
// this idea:
//
//
//
//

export function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export function logout() {
  if (getCookie("hc_login_token")) {
    // remove the cookie by setting its date to a previous year!
    deleteCookie("hc_login_token");
  }
}

// once authenticated, user is allowed to do anything
// authenticated allows to access its own system
// authenticated means you can access any project on the system
//
//

// if the cookie is set up you’re logged
// check cookie

// otherwise you need to get a new cookie

export async function login(username, password) {
  let loggedIn = false;
  axios
    .post(`${config.strapi.url}/api/auth/local`, {
      identifier: username,
      password: password,
    })
    .then(async function (response) {
      document.cookie = `hc_login_token=${response.data.jwt}`;
      // document.querySelector(".form").remove();
      if (response) {
        console.log("login token added");
      }
      loggedIn = false;
    })
    .catch(function (error) {
      console.log("error", error);
      document.querySelector(`.login-error`).innerHTML =
        `<p class="error">Sorry mate can’t connect, forgot you pass again? Then you need to contact your administrator.</p>`;
      loggedIn = false;
      // return false;
    });
  return loggedIn;
}

export function getCookie(name) {
  let cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");

    // Remove whitespace at the beginning of the cookie name and compare it with the given name
    if (name == cookiePair[0].trim()) {
      // Decode the cookie value and return
      return decodeURIComponent(cookiePair[1]);
    }
  }

  // Return null if not found
  return null;
}

// TODO in the future, create user!
export function createUser(username, email, password) {
  axios
    .post("http://localhost:1337/auth/local/register", {
      username: "Kapman",
      email: "test@test.com",
      password: "Password",
    })
    .then((response) => {
      console.log("User profile", response.data.user);
      console.log("User token", response.data.jwt);
      console.log(
        `welcome ${username}. this is your email: ${email}, and we won’t show your password sorry, we have swimming session`,
      );
    })
    .catch((error) => {
      console.log("An error occurred:", error.response);
    });
}

export function loginButton() {
  document
    .querySelector("#submit")
    .addEventListener("click", async function (e) {
      // const logged = await login(username, password);
      // check if ther is the doci
      // let token = getCookie("hc_login_token");
      await login(
        document.querySelector("#username").value,
        document.querySelector("#password").value,
      );
      {
        start();
        hideLogin();
        // error in the connexion
      }
    });
}

export const hideLogin = () => {
  document.querySelector("#login").close();
};

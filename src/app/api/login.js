import config from "../config/config";

export function stayLogged(username, password) {
  document
    .querySelector("#login-submit")
    .addEventListener("click", function() {
      console.log("hellyeah");
      login(username, password);
    });
}

export async function login(username, password) {
  axios
    .post(`${config.server}/api/auth/local`, {
      identifier: username,
      password: password,
    })
    .then(async function(response) {
      token = response.data.jwt;
      cookie.hc_login_token = reponse.data.jwt;

      // document.querySelector(".form").remove();
      if (response) {
        console.log("reponse", response);
        // set token cookie
      }
    })
    .catch(function(error) {
      console.log("there is an error:", error);
      document.querySelector(`.login-error`).innerHTML =
        `<p class="error">Sorry mate can’t connect, forgot you pass again? Then you need to contact your administrator.</p>`;
    });
}

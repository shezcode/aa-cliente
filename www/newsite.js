"use strict";
import { generateSafePassword } from "./utils/helpers.js";

// GLOBAL STATE
const apiOrigin = "http://localhost:3000";
const urlHashInfo = window.location.hash.replace("#", "").split("-");
const selectedCategoryId = urlHashInfo[0];
const selectedSiteId = urlHashInfo[1];

console.log("selectedCategoryId", selectedCategoryId);
console.log("selectedSiteId", selectedSiteId);

// SELECTORS
const pageTitle = document.getElementById("pageTitle");

const urlField = document.getElementById("url");
const nameField = document.getElementById("name");
const userField = document.getElementById("username");
const passwordField = document.getElementById("password");
const descriptionField = document.getElementById("description");

const autogenPwdBtn = document.getElementById("autogenPwd");
const submitButton = document.getElementById("submitButton");

//init fields to avoid undefined values
function initiliazeFields() {
  urlField.value = "";
  nameField.value = "";
  userField.value = "";
  passwordField.value = "";
  descriptionField.value = "";
}

autogenPwdBtn.onclick = () => {
  const password = generateSafePassword();
  //console.log("password", password);
  passwordField.value = password;
};

submitButton.onclick = () => {
  if (selectedSiteId) {
    upsertSite("PUT");
  } else {
    upsertSite("POST");
  }
};

function fetchData() {
  fetch(`${apiOrigin}/sites/${selectedSiteId}`)
    .then((res) => res.json())
    .then((data) => {
      urlField.value = data.url;
      nameField.value = data.name;
      userField.value = data.user;
      passwordField.value = data.password;
      descriptionField.value = data.description;
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error:", error);
    });
}

function upsertSite(method) {
  fetch(`${apiOrigin}/sites/${selectedSiteId ?? ""}`, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameField.value,
      url: urlField.value,
      user: userField.value,
      password: passwordField.value,
      description: descriptionField.value,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        alert(`error when ${selectedSiteId ? "modifying" : "creating"} site`);
      }
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert();
    });
}

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = togglePassword.querySelector("i");

togglePassword.addEventListener("click", () => {
  // Toggle the input type
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";

  // Toggle the eye icon
  eyeIcon.className = isPassword ? "bi bi-eye" : "bi bi-eye-slash";
});

window.onload = function () {
  pageTitle.innerText = selectedSiteId ? "Modify Site" : "New Site";
  if (selectedSiteId) {
    fetchData();
  } else {
    initiliazeFields();
  }
};

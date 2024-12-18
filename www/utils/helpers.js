export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateSafePassword(length = 16) {
  //longitud 16 chars por default
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const symbols = "!@#$%^&*()_+";
  const numbers = "0123456789";
  const allCharacters = lowercase + uppercase + numbers + symbols;

  // introduce por lo menos un caracter de cada tipo
  const getRandomChar = (chars) =>
    chars[Math.floor(Math.random() * chars.length)];

  const passwordArray = [
    getRandomChar(numbers), // un número
    getRandomChar(uppercase), // una mayúscula
    getRandomChar(symbols), // un símbolo
  ];

  // genera el resto de la contraseña
  while (passwordArray.length < length) {
    passwordArray.push(getRandomChar(allCharacters));
  }

  // sort para randomizar el orden del array
  const shuffledPassword = passwordArray
    .sort(() => Math.random() - 0.5)
    .join("");

  return shuffledPassword;
}

export function errorToast(message) {
  const toastLiveExample = document.getElementById("liveToast");
  toastLiveExample.classList.remove("text-success");
  toastLiveExample.classList.add("text-danger");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  const toastTitle = document.getElementById("toast-title");
  toastTitle.innerText = "Error";
  const toastMsg = document.querySelector(".toast-body");
  toastMsg.innerText = message;
  toastBootstrap.show();
}

export function successToast(message) {
  const toastLiveExample = document.getElementById("liveToast");
  toastLiveExample.classList.remove("text-danger");
  toastLiveExample.classList.add("text-success");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  const toastTitle = document.getElementById("toast-title");
  toastTitle.innerText = "Success";
  const toastMsg = document.querySelector(".toast-body");
  toastMsg.innerText = message;
  toastBootstrap.show();
}

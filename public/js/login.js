function sendLogin() {
  const loginValue = document.querySelector("#login")?.value;
  const passwordValue = document.querySelector("#password")?.value;
  fetch("/login", {
    method: "POST",
    body: JSON.stringify({
      login: loginValue,
      password: passwordValue,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

document.querySelector("#form_login").onsubmit = (e) => {
  e.preventDefault();
  sendLogin();
};

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
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
        return;
      }
      if (data.id) window.location.href = "/admin";
    })
    .catch((err) => console.log(err.message));
}

document.querySelector("#form_login").onsubmit = (e) => {
  e.preventDefault();
  sendLogin();
};

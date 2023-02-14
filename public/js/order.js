document.querySelector("#lite-shop-order").onsubmit = function (event) {
  event.preventDefault();
  const userName = document.querySelector("#username").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const email = document.querySelector("#email").value.trim();
  const address = document.querySelector("#address").value.trim();

  const isAcceptRules = document.querySelector("#rule").checked;

  if (!isAcceptRules) {
    Swal.fire({
      title: "Warning",
      text: "Read and accept rules",
      type: "info",
      confirmButtonText: "Understand",
    });
    return false;
  }

  if (!userName || !phone || !email || !address) {
    Swal.fire({
      title: "Warning",
      text: "All fields must be fill",
      type: "info",
      confirmButtonText: "Ok",
    });
    return false;
  }

  fetch("/finish-order", {
    method: "POST",
    body: JSON.stringify({
      userName,
      phone,
      email,
      address,
      key: JSON.parse(localStorage.getItem("cart")),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.text())
    .then((data) => {
      data === "1"
        ? Swal.fire({
            title: "Success",
            text: "Success order",
            type: "info",
            confirmButtonText: "Ok",
          })
        : Swal.fire({
            title: "Problem",
            text: "Error email",
            type: "error",
            confirmButtonText: "Understand",
          });
    });
};

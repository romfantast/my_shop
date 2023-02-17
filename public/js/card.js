let cart = {};

const btns = document.querySelectorAll(".add-to-cart");

for (let btn of btns) {
  btn.addEventListener("click", addToCart);
}

if (localStorage.getItem("cart")) {
  cart = JSON.parse(localStorage.getItem("cart"));
  ajaxGetGoodsInfo();
}

function addToCart(event) {
  const goodId = event.target.dataset.goods_id;

  if (cart[goodId]) {
    cart[goodId] += 1;
  } else {
    cart[goodId] = 1;
  }
  ajaxGetGoodsInfo();
}

function ajaxGetGoodsInfo() {
  updateLocalStorageCart();
  fetch("/get-goods-info", {
    method: "POST",
    body: JSON.stringify({ key: Object.keys(cart) }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.text();
    })
    .then((body) => {
      showCart(JSON.parse(body));
    });
}

function showCart(data) {
  let out = '<table class="table table-striped table-cart"><tbody>';
  let total = 0;
  for (let key in cart) {
    out += `<tr><td colspan='4'><a href='/goods?id=${key}'>${data[key].name}</a></td></tr>`;
    out += `<tr><td><i class="far fa-minus-square cart-minus" data-goods_id="${key}"></i></td>`;
    out += `<td>${cart[key]}</td>`;
    out += `<td><i class="far fa-plus-square cart-plus" data-goods_id="${key}"></i></td>`;
    out += `<td>${formatPrice(data[key].cost * cart[key])} uah </td>`;
    out += "</tr>";
    total += cart[key] * data[key].cost;
  }
  out += `<tr><td colspan="3">Total: </td><td> ${formatPrice(
    total
  )} uah</td></tr>`;
  out += "</tbody></table>";

  document.querySelector("#cart-nav").innerHTML = out;

  document.querySelectorAll(".cart-minus").forEach((element) => {
    element.onclick = cartMinus;
  });

  document.querySelectorAll(".cart-plus").forEach((element) => {
    element.onclick = cartPlus;
  });
  if (Object.keys(cart).length === 0) {
    document.querySelector("#cart-nav").innerHTML =
      "Here will be your purchase";
    document.querySelector(".text-right").style.display = "none";
  } else {
    document.querySelector(".text-right").style.display = "block";
  }
}

function cartPlus(event) {
  const goodId = event.target.dataset.goods_id;
  cart[goodId]++;

  ajaxGetGoodsInfo();
}

function cartMinus(event) {
  const goodId = event.target.dataset.goods_id;
  if (cart[goodId] - 1 > 0) {
    cart[goodId]--;
  } else {
    delete cart[goodId];
  }
  ajaxGetGoodsInfo();
}

function updateLocalStorageCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function formatPrice(price) {
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$& ");
}

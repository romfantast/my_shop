const cart = {};

const btns = document.querySelectorAll(".add-to-cart");

for (let btn of btns) {
  btn.addEventListener("click", addToCart);
}

function addToCart(event) {
  const goodId = event.target.dataset.goods_id;

  if (cart[goodId]) {
    cart[goodId] += 1;
  } else {
    cart[goodId] = 1;
  }

  console.log(cart);
  ajaxGetGoodsInfo();
}

function ajaxGetGoodsInfo() {
  fetch("/get-goods-info", {
    method: "POST",
    body: JSON.stringify({ key: Object.keys(cart) }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((body) => {
      console.log(body);
    });
}

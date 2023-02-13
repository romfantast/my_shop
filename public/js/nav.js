document.querySelector(".close-nav").onclick = closeNav;
document.querySelector(".show-nav").onclick = showNav;

function showNav() {
  document.querySelector(".site-nav").style.left = "0";
}

function closeNav() {
  document.querySelector(".site-nav").style.left = "-300px";
}

function getGategoryList() {
  fetch("/get-category-list", {
    method: "POST",
  })
    .then((res) => {
      return res.text();
    })
    .then((data) => {
      console.log(data);
      showCategoryList(JSON.parse(data));
    })

    .catch((err) => console.log(err));
}

function showCategoryList(data) {
  console.log(data);
  let out =
    '<ul class="category-list"><li><a class="category-list-link" href="/">Main</a></li>';

  for (let i = 0; i < data.length; i++) {
    out += `<li><a href="/cat?id=${data[i].id}">${data[i].category}</a></li>`;
  }

  out += "</ul>";
  document.querySelector("#category-list").innerHTML = out;
}

getGategoryList();

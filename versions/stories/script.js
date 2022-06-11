// static roulette html
// read db
// db content in roulette

window.onload = init;
let writeBtn;

function goToWritePage() {
  // save a boolean in localstorage to hide overlays
  localStorage.setItem("item", "foo");
  console.log(localStorage.getItem("item"));
  window.location.href = "../";
}

function init() {
  writeBtn = document.getElementById("write");

  writeBtn.addEventListener("click", () => {
    goToWritePage();
  });
}

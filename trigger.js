"use strict";
function Width() {
  const WW = window.innerWidth;
  const x = document.createElement("span");
  x.textContent = "x";
  document.body.append(x);
  const xW = x.offsetWidth;
  x.remove();
  const gameWidth = Math.floor((WW - 150) / xW);
  console.log(gameWidth, WW, xW, x);
  const myGame = new Game(
    null,
    null,
    gameWidth,
    document.querySelector("#game"),
    80,
    40,
    80,
    ["ArrowUp", "ArrowDown"],
    -1,
    100, //infinity, the maximum score isn't told to you
    null,
    600,
    800,
    "z",
    120,
    ["ArrowRight", "ArrowLeft"],
    "Tab",
    5
  );
}
window.onload = Width();

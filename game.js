"use strict";
class Game {
  MAXPOINTS;
  LEVEL;
  LANES;
  GAMEWIDTH;
  RENDERTO;
  constructor(MAXPOINTS, LEVEL, LANES, GAMEWIDTH, RENDERTO) {
    (this.MAXPOINTS = MAXPOINTS),
      (this.LEVEL = LEVEL),
      (this.LANES = LANES),
      (this.GAMEWIDTH = GAMEWIDTH),
      (this.RENDERTO = RENDERTO),
      (this.QUEUE = []),
      (this.templates = {}),
      ((this.BASECLASS = class {
        x;
        y;
        constructor(x, y) {
          (this.x = x), (this.y = y);
        }
        move() {}
        checkLane() {}
        collide() {}
      }),
      (this.USER = undefined));
    this.SETUP();
  }
  async SETUP() {
    const self = this;
    Array.prototype.OVER = function (target, x, y) {
      if (
        x < 0 - this[0].length ||
        y < 0 - this.length ||
        y > target.length ||
        x > target[0].length
      )
        return false;
      this.forEach((e, inY) => {
        e.forEach((a, inX) => {
          if (target[y + inY]?.[x + inX]) target[y + inY][x + inX] = a;
        });
      });
      return true;
    };
    const templates = (await (await fetch("templates.txt")).text())
      .replace(/\r?\n/g, "")
      .split(/~[^~]+~/)
      .map((v) => v.split("%"))
      .map((v) => v.map((e) => e.split("&")))
      .slice(1)
      .map((e) => e.slice(0, e.length - 1));
    templates[0].forEach((val) => {
      let [k, v] = val;
      v = [v.slice(0, v.length / 2), v.slice(v.length / 2)];
      v.map((e) => e.split(""));
      self.templates[k] = class extends self.BASECLASS {
        constructor(x, y) {
          super(x, y);
          this.template = v;
        }
      };
    });
    const road = templates.at(-1)[0];
    const segment = [
      road[1].slice(0, Math.floor(road[1].length / 3)).split(""),
      road[1]
        .slice(
          Math.floor(road[1].length / 3),
          Math.floor(road[1].length / 3) * 2
        )
        .split(""),
      road[1].slice(Math.floor(road[1].length / 3) * 2).split(""),
    ];
    self.templates[road[0]] = segment;
    self.PLAY();
  }
  PLAY() {
    const self = this;
    self.ROAD = new Array(self.LANES)
      .fill(null)
      .map(() => new Array(self.GAMEWIDTH).fill(" "));
    Function.prototype.REPEAT = function (num, ...args) {
      for (let i = 0; i < num; i++) this(i, ...args);
    };
    let offset = 0;
    while (offset < self.ROAD[0].length) {
      self.templates.segment.OVER(self.ROAD, offset, 0);
      offset += self.templates.segment[0].length;
    }
    self.ROAD.forEach((e) => {
      e.forEach((a) => {
        self.RENDERTO.append(a);
      });
      self.RENDERTO.insertAdjacentHTML("beforeend", "<br>");
    });
    console.log(self.ROAD);
  }
}

const myGame = new Game(1, 1, 3, 50, document.querySelector("#game"));

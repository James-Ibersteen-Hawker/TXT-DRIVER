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
      (this.TMPLS = {}),
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
    Array.prototype.DIV = function (num) {
      return new Array(num)
        .fill(null)
        .map((_, b) =>
          new Array(Math.round(this.length / num))
            .fill(null)
            .map((_, i) => this[b * Math.round(this.length / num) + i])
        );
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
      v = Array.from(v).DIV(2);
      self.TMPLS[k] = class extends self.BASECLASS {
        constructor(x, y) {
          super(x, y);
          this.template = v;
        }
      };
    });
    const road = templates.at(-1)[0];
    self.TMPLS[road[0]] = Array.from(road[1]).DIV(3);
    self.PLAY();
  }
  PLAY() {
    const self = this;
    self.ROAD = new Array(self.TMPLS.SGMT.length * self.LANES)
      .fill(null)
      .map(() =>
        new Array(
          self.GAMEWIDTH - (self.GAMEWIDTH % self.TMPLS.SGMT[0].length)
        ).fill(" ")
      );
    Function.prototype.REPEAT = function (num, ...args) {
      for (let i = 0; i < num; i++) this(i, ...args);
    };
    self.ROAD.map((e, i, a) => {
      const row = i % self.TMPLS.SGMT.length;
      const segment =
        Math.floor(i / self.TMPLS.SGMT.length) * self.TMPLS.SGMT.length;
      let offset = -Math.round(Math.random() * row);
      while (offset < self.ROAD[0].length) {
        self.TMPLS.SGMT.OVER(a, offset, segment);
        offset += self.TMPLS.SGMT[0].length;
      }
    });
    //temp render, will go to proxies soon
    self.ROAD.render = function (loc) {
      loc.innerHTML = "";
      this.forEach((e) => {
        e.forEach((a) => loc.append(a));
        loc.insertAdjacentHTML("beforeend", "<br>");
      });
    };
    self.ROAD.render(self.RENDERTO);
    console.log(self.ROAD);
  }
}

const myGame = new Game(1, 1, 10, 50, document.querySelector("#game"));

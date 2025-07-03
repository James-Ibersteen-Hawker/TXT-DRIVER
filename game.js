"use strict";
class Game {
  MAXPOINTS;
  LEVEL;
  RENDERTO;
  constructor(MAXPOINTS, LEVEL, RENDERTO) {
    (this.MAXPOINTS = MAXPOINTS),
      (this.LEVEL = LEVEL),
      (this.RENDERTO = RENDERTO),
      (this.queue = []),
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
    let debugtemplate = new self.templates.car(0, 1).template;
    // alert(debugtemplate);
    let cap = new Array(8).fill(null).map(() => new Array(8).fill(1));
    [
      [0, 0],
      [0, 0],
    ].OVER(cap, 2, 2);
    alert(cap[2]);
    alert(cap[3]);
  }
}

const myGame = new Game(1, 1, null);

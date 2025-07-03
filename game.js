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
        overlaySelf(target, x, y) {}
        move() {}
        checkLane() {}
        collide() {}
      }),
      (this.USER = undefined));
    this.SETUP();
  }
  async SETUP() {
    const self = this;
    let templates = await (await fetch("templates.txt")).text();
    templates = templates.split("\r").join("").split("\n").join("");
    templates = templates.split(/~[^~]+~/);
    templates.forEach((e, i, a) => (a[i] = e.split("%")));
    templates.forEach((v) => v.forEach((e, i, a) => (a[i] = e.split("&"))));
    templates = templates.slice(1);
    templates.forEach((e, i, a) => (a[i] = e.slice(0, e.length - 1)));
    templates[0].forEach((val) => {
      let [k, v] = val;
      v = [v.slice(0, v.length / 2), v.slice(v.length / 2)];
      v.forEach((e, i, a) => (a[i] = e.split("")));
      self.templates[k] = class extends self.BASECLASS {
        constructor(x, y) {
          super(x, y);
          this.template = v;
        }
      };
    });
    let debugtemplate = new self.templates.car().template;
    console.log(debugtemplate);
  }
}

const myGame = new Game(1, 1, null);

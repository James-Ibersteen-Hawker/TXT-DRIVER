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
      (this.QUEUE = (() => {
        let src = [];
        src.RUN = function () {
          this.PROPSORT("z");
          this.forEach((e) => e.RENDER());
        };
        return src;
      })()),
      (this.RENDERQUEUE = false),
      (this.TMPLS = {}),
      (this.BASECLASS = class {
        x;
        y;
        z;
        target;
        constructor(x, y, z, target) {
          (this.x = x), (this.y = y), (this.z = z), (this.target = target);
        }
        RENDER() {
          this.template.OVER(this.target, this.x, this.y);
        }
        move() {}
        checkLane() {}
        collide() {}
      }),
      (this.USER = undefined);
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
          new Array(Math.ceil(this.length / num))
            .fill(null)
            .map((_, i) => this[b * Math.ceil(this.length / num) + i])
        );
    };
    Array.prototype.PROPSORT = function (prop) {
      this.sort((a, b) => a[prop] - b[prop]);
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
        constructor(x, y, z, target) {
          super(x, y, z, target);
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
    //road
    {
      let inc = 0;
      self.ROAD = new Array(self.TMPLS.SGMT.length * self.LANES)
        .fill(null)
        .map(() =>
          new Array(
            self.GAMEWIDTH - (self.GAMEWIDTH % self.TMPLS.SGMT[0].length)
          ).fill(" ")
        );
      self.ROAD.forEach((e, i, a) => {
        const row = i % self.TMPLS.SGMT.length;
        const segment =
          Math.floor(i / self.TMPLS.SGMT.length) * self.TMPLS.SGMT.length;
        inc = i;
        if (inc % self.TMPLS.SGMT.length == 0) {
          let offset = -Math.round(Math.random() * row);
          while (offset < e.length) {
            self.TMPLS.SGMT.OVER(a, offset, segment);
            offset += self.TMPLS.SGMT[0].length;
          }
        }
      });
      const roadProxyHandler = {
        set(t, p, v) {
          const reflect = Reflect.set(t, p, v);
          return reflect;
        },
        get(t, p, v) {
          const reflect = Reflect.get(t, p, v);
          return reflect;
        },
      };
      self.ROAD = self.ROAD.map((e) => new Proxy(e, roadProxyHandler));
      self.ROAD.render = function (loc) {
        loc.innerHTML = "";
        this.forEach((e) => {
          e.forEach((a) => loc.append(a));
          loc.insertAdjacentHTML("beforeend", "<br>");
        });
      };
      self.ROADBASE = [];
      self.ROAD.forEach((e) => {
        const freeze = [...e];
        Object.freeze(freeze);
        return freeze;
      });
      Object.freeze(self.ROADBASE);
    }
    //queue management
    {
      self.QUEUE.push(new self.TMPLS["bus"](1, 1, 2, self.ROAD));
      self.QUEUE.RUN();
    }
    self.ROAD.render(self.RENDERTO);
  }
}

const myGame = new Game(1, 1, 3, 50, document.querySelector("#game"));
window.onclick = function () {
  myGame.QUEUE.push(new myGame.TMPLS.car(8, 2, 4, myGame.ROAD));
  myGame.QUEUE.RUN();
  myGame.ROAD.render(myGame.RENDERTO);
};

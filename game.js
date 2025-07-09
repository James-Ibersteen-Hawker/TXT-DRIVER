"use strict";
class Game {
  MAXPOINTS;
  LEVEL;
  LANES;
  GAMEWIDTH;
  RENDERTO;
  SPEED;
  constructor(MAXPOINTS, LEVEL, LANES, GAMEWIDTH, RENDERTO, SPEED) {
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
        target;
        constructor(x, y, target) {
          (this.x = x), (this.y = y), (this.target = target);
        }
        SETUP(self) {
          this.z = self.LANELOOKUP.laneOf(this.y);
        }
        RENDER() {
          this.template.OVER(this.target, this.x, this.y);
        }
        move() {}
        checkLane() {}
        collide() {}
      }),
      (this.SPEED = SPEED),
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
        constructor(x, y, target) {
          super(x, y, target);
          this.template = v;
        }
      };
    });
    const road = templates.at(-1)[0];
    self.TMPLS[road[0]] = Array.from(road[1]).DIV(3);
    self.USER = [];
    templates.at(-2).forEach((val) => {
      let [k, v] = val;
      v = Array.from(v).DIV(2);
      self.TMPLS[k] = class extends self.BASECLASS {
        constructor(x, y, z, target) {
          super(x, y, z, target);
          this.template = v;
        }
      };
      self.USER.push(k);
    });
    self.PLAY();
  }
  PLAY() {
    const self = this;
    self.LEVEL = Math.min(3, self.LEVEL);
    self.TICK = setInterval(() => {
      console.log("tick");
      self.QUEUE.RUN();
      if (self.RENDERQUEUE) self.ROAD.render(self.RENDERTO);
    }, self.SPEED * (1 / self.LEVEL));
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
          self.RENDERQUEUE = true;
          return reflect;
        },
        get(t, p, v) {
          const reflect = Reflect.get(t, p, v);
          return reflect;
        },
      };
      self.ROAD = self.ROAD.map((e) => new Proxy(e, roadProxyHandler));
      self.ROAD.render = function (loc) {
        let result = this.map((row) => row.join("")).join("<br>");
        loc.innerHTML = result;
        self.RENDERQUEUE = false;
      };
      self.ROADBASE = [];
      self.ROAD.forEach((e) => {
        const freeze = [...e];
        Object.freeze(freeze);
        return freeze;
      });
      Object.freeze(self.ROADBASE);
    }
    //lane lookup
    {
      self.LANELOOKUP = {
        sets: new Array(self.LANES)
          .fill(null)
          .map((_, u) =>
            new Array(self.TMPLS.SGMT.length)
              .fill(null)
              .map((_, i) => i + u * self.TMPLS.SGMT.length)
          ),
        list: null,
      };
      self.LANELOOKUP.list = new Array(self.ROAD.length)
        .fill(null)
        .map((_, i) => {
          return {
            index: i,
            set: self.LANELOOKUP.sets.indexOf(
              self.LANELOOKUP.sets.find((v) => v.includes(i))
            ),
          };
        });
      self.LANELOOKUP.laneOf = function (index) {
        return this.list.find((e) => e.index == index).set || undefined;
      };
      self.LANELOOKUP.inLane = function (lane, keyword) {
        let result = this.sets[lane];
        switch (keyword) {
          case "top":
            return result[0];
          case "middle":
            return result[Math.floor(result.length / 2)];
          case "bottom":
            return result.at(-1);
          default:
            return result;
        }
      };
    }
    //user control
    {
      class USER extends self.BASECLASS {
        constructor(x, y, target) {
          super(x, y, target);
          this.template = new self.TMPLS[self.USER[self.LEVEL]](
            0,
            0,
            0,
            null
          ).template;
        }
      }
      self.USER = new USER(0, self.LANELOOKUP.inLane(1, "middle"), self.ROAD);
      self.USER.SETUP(self);
      self.QUEUE.push(self.USER);
    }
    self.ROAD.render(self.RENDERTO);
  }
}

const myGame = new Game(1, 1, 3, 50, document.querySelector("#game"), 500);

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
      (this.ROAD = undefined),
      (this.ROADBASE = []),
      (this.LANELOOKUP = {
        sets: null,
        list: null,
        laneOf: function (index) {
          return this.list.find((e) => e.index === index).set || undefined;
        },
        inLane: function (lane, keyword) {
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
        },
      }),
      (this.USER = []),
      (this.BUILDINGS = []);
    this.SETUP(this);
  }
  async SETUP(self) {
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
      const dist = Math.ceil(this.length / num);
      return new Array(num)
        .fill(null)
        .map((_, b) =>
          new Array(dist).fill(null).map((_, i) => this[b * dist + i])
        );
    };
    Array.prototype.PROPSORT = function (prop) {
      this.sort((a, b) => a[prop] - b[prop]);
    };
    const templates = (await (await fetch("templates.txt")).text())
      .replace(/\r?\n/g, "")
      .split(/~[^~]+~/)
      .map((v) => v.split("%").map((e) => e.split("&")))
      .slice(1)
      .map((e) => e.slice(0, e.length - 1));
    templates.forEach((e, i, a) => {
      if (i !== a.length - 1) {
        e.forEach(([k, v]) => {
          self.TMPLS[k] = class extends self.BASECLASS {
            #template;
            constructor(x, y, target) {
              super(x, y, target);
              this.#template = Object.freeze(Array.from(v).DIV(2));
            }
            get template() {
              return this.#template;
            }
          };
          if (i === 1) self.USER.push(k);
        });
      } else {
        const [name, val] = templates[2]?.[0];
        self.TMPLS[name] = Array.from(val).DIV(3);
      }
    });
    self.PLAY(self);
  }
  PLAY(self) {
    const seg = self.TMPLS.SGMT;
    self.LANES = Math.max(3, self.LANES);
    self.LEVEL = Math.min(
      Object.keys(self.TMPLS).filter((v) => v[0] === "u").length,
      self.LEVEL
    );
    self.TICK = setInterval(() => {
      console.log("tick");
      self.QUEUE.RUN();
      if (self.RENDERQUEUE) self.ROAD.render();
    }, self.SPEED * (1 / self.LEVEL));
    //road
    {
      const roadProxyHandler = {
        set(t, p, v) {
          self.RENDERQUEUE = true;
          return Reflect.set(t, p, v);
        },
        get(t, p, v) {
          return Reflect.get(t, p, v);
        },
      };
      self.ROAD = new Array(seg.length * self.LANES)
        .fill(null)
        .map(() =>
          new Array(self.GAMEWIDTH - (self.GAMEWIDTH % seg[0].length)).fill(" ")
        );
      self.ROAD = self.ROAD.map((e, i, a) => {
        const row = i % seg.length;
        const segment = Math.floor(i / seg.length) * seg.length;
        if (i % seg.length === 0) {
          let offset = -Math.round(Math.random() * row);
          while (offset < e.length) {
            seg.OVER(a, offset, segment);
            offset += seg[0].length;
          }
        }
        self.ROADBASE.push(Object.freeze([...e]));
        return new Proxy(e, roadProxyHandler);
      });
      self.ROAD.render = function () {
        const result = this.map((row) => row.join("")).join("<br>");
        self.RENDERTO.innerHTML = result;
        self.RENDERQUEUE = false;
      };
      Object.freeze(self.ROADBASE);
    }
    //building generation
    {
      class Building {
        height;
        width;
        windowCount;
        constructor(height, width, windowCount) {
          (this.height = height),
            (this.windowCount = windowCount),
            (this.width = width);
          this.MAKE();
        }
        MAKE() {
          let build = new Array(this.height)
            .fill(null)
            .map(() => new Array(this.width + 2).fill(""));
          build[0].fill("‾");
          build.forEach((e) => (e[0] = e[e.length - 1] = "|"));
          let windows = [];
          for (let i = 0; i < this.windowCount; i++) {
            let [x, y] = [
              Math.max(1, Math.floor(Math.random() * this.width - 2)),
              Math.max(1, Math.floor(Math.random() * this.height - 2)),
            ];
            let count = 0;
            while (windows.some((e) => e[0] == x && e[1] == y) && count < 5) {
              [x, y] = [
                Math.max(1, Math.floor(Math.random() * this.width - 2)),
                Math.max(1, Math.floor(Math.random() * this.height - 2)),
              ];
              count++;
            }
            build[y][x] = "█";
            windows.push([x, y]);
          }
          alert(build);
        }
      }
      let myVar = new Building(5,3,2)
    }
    //lane lookup
    {
      self.LANELOOKUP.sets = new Array(self.LANES)
        .fill(null)
        .map((_, u) =>
          new Array(seg.length).fill(null).map((_, i) => i + u * seg.length)
        );
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
    }
    //user control
    {
      class USER extends self.BASECLASS {
        #template;
        constructor(x, y, target) {
          super(x, y, target);
          this.#template = Object.freeze(
            new self.TMPLS[self.USER[self.LEVEL]](0, 0, 0, null).template
          );
        }
        get template() {
          return this.#template;
        }
      }
      self.USER = new USER(0, self.LANELOOKUP.inLane(1, "middle"), self.ROAD);
      self.USER.SETUP(self);
      self.QUEUE.push(self.USER);
    }
  }
}

const myGame = new Game(1, 1, 3, 50, document.querySelector("#game"), 500);

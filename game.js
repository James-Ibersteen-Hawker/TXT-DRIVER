"use strict";
class Game {
  MAXPOINTS;
  LEVEL;
  LANES;
  GAMEWIDTH;
  RENDERTO;
  SPEED;
  constructor(MAXPOINTS, LEVEL, LANES, GAMEWIDTH, RENDERTO, SPEED) {
    const self = this;
    (this.MAXPOINTS = MAXPOINTS),
      (this.LEVEL = LEVEL),
      (this.LANES = LANES),
      (this.GAMEWIDTH = GAMEWIDTH),
      (this.RENDERTO = RENDERTO),
      (this.QUEUE = (() => {
        let src = [];
        src.RUN = function (loc) {
          this.PROPSORT("z");
          this.forEach((e) => e.RENDER(loc));
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
          (this.x = x),
            (this.y = y),
            (this.z = null),
            (this.bounds = {
              TL: null,
              TR: null,
              BL: null,
              BR: null,
            }),
            (this.target = target);
        }
        RENDER(loc) {
          this.template.OVER(loc, this.x, this.y);
        }
        move() {}
        checkLane() {}
        collide() {}
      }),
      (this.SPEED = SPEED),
      (this.ROAD = null),
      (this.BUILDINGS = null),
      (this.ROADBASE = []),
      (this.LANELOOKUP = {
        sets: null,
        list: null,
        laneOf: function (index) {
          return this.list.find((e) => e.index === index).set || null;
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
    this.SETUP(self);
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
            constructor(x, y, target) {
              super(x, y, target);
              this.template = Object.freeze(Array.from(v).DIV(2));
            }
            SETUP() {
              this.z = self.LANELOOKUP.laneOf(this.y);
              console.log(this.template);
              this.bounds.TL = [this.x, this.y];
              this.bounds.TR = [this.x + this.template[0].length, this.y];
              this.bounds.BL = [this.x, this.y + this.template.length];
              this.bounds.BR = [
                this.x + this.template[0].width,
                this.y + this.template.length,
              ];
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
  async PLAY(self) {
    const seg = self.TMPLS.SGMT;
    function random(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function RENDER() {
      const tempROAD = Array.from({ length: self.ROAD.length }, (_, i) => [
        ...self.ROAD[i],
      ]);
      self.QUEUE.RUN(tempROAD);
      const temp = [
        new Array(self.ROAD[0].length).fill("‾"),
        ...self.BUILDINGS.ARR,
        ...tempROAD,
        ...new Array(self.BUILDINGS.ARR.length - 3)
          .fill(null)
          .map(() => new Array(self.ROAD[0].length).fill("░")),
        new Array(self.ROAD[0].length).fill("‾"),
      ];
      const result = temp
        .map((row, i) => {
          if (i != temp.length - 1) return "|" + row.join("") + "|";
          else return " " + row.join("") + " ";
        })
        .join("<br>");
      self.RENDERTO.innerHTML = result;
      self.RENDERQUEUE = false;
    }
    self.LANES = Math.max(3, self.LANES);
    self.LEVEL = Math.min(
      Object.keys(self.TMPLS).filter((v) => v[0] === "u").length,
      self.LEVEL
    );
    //road
    {
      self.ROAD = new Array(seg.length * self.LANES).fill(null).map(() => {
        const result = new Array(
          self.GAMEWIDTH - (self.GAMEWIDTH % seg[0].length)
        ).fill(" ");
        result.offset = 0;
        return result;
      });
      self.ROAD = self.ROAD.map((e, i, a) => {
        const row = i % seg.length;
        const segment = Math.floor(i / seg.length) * seg.length;
        if (i % seg.length === 0) {
          let offset = -Math.round(Math.random() * row);
          e.offset = offset;
          while (offset < e.length) {
            seg.OVER(a, offset, segment);
            offset += seg[0].length;
          }
        }
        self.ROADBASE.push(Object.freeze([...e]));
        return e;
      });
      self.ROAD.SHIFT = function (dir) {
        this.forEach((e, i, a) => {
          const segment = Math.floor(i / seg.length) * seg.length;
          let offset;
          if (dir < 0) offset = e.offset + dir;
          else if (dir > 0) offset = e.offset - (seg[0].length - dir);
          offset = offset % seg[0].length;
          e.offset = offset;
          while (offset < e.length) {
            seg.OVER(a, offset, segment);
            offset += seg[0].length;
          }
        });
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
          (this.height = height == 0 ? 1 : height),
            (this.windowCount = windowCount),
            (this.width = width),
            (this.arr = null),
            (this.x = 0),
            (this.y = 0);
          this.MAKE();
        }
        MAKE() {
          let build = new Array(this.height)
            .fill(null)
            .map(() => new Array(this.width + 2).fill(" "));
          build[0].fill("‾");
          build.forEach((e) => (e[0] = e[e.length - 1] = "|"));
          let windows = [];
          for (let i = 0; i < this.windowCount; i++) {
            let [x, y] = [
              random(1, build[0].length - 2),
              random(1, build.length - 2),
            ];
            let count = 0;
            while (windows.some((e) => e[0] == x && e[1] == y) && count < 5) {
              [x, y] = [
                random(1, build[0].length - 2),
                random(1, build.length - 2),
              ];
              count++;
            }
            if (!windows.some((e) => e[0] == x && e[1] == y)) {
              windows.push([x, y]);
              build[y][x] = "█";
            }
          }
          this.arr = build;
        }
      }
      self.BUILDINGS = {
        ARR: new Array(8)
          .fill(null)
          .map(() => new Array(self.ROAD[0].length).fill(" ")),
        QUEUE: [],
        async RENDER() {
          return new Promise((resolve, reject) => {
            const result = [];
            this.ARR = this.ARR.map((e) => {
              return e.map(() => " ");
            });
            this.QUEUE.forEach((e) => {
              if (e.arr.OVER(this.ARR, e.x, e.y) == true) result.push(e);
            });
            this.QUEUE = result;
            self.RENDERQUEUE = true;
            resolve();
          });
        },
        async ADD(b) {
          return new Promise((resolve, reject) => {
            const last = self.BUILDINGS.QUEUE.at(-1);
            b.x = last ? last.x + last.width + 2 : 0;
            b.y = self.BUILDINGS.ARR.length - b.height;
            self.BUILDINGS.QUEUE.push(b);
            resolve();
          });
        },
        async MOVE(dir) {
          return new Promise((resolve, reject) => {
            self.BUILDINGS.QUEUE.forEach((e) => (e.x += dir));
            resolve();
          });
        },
        async CLOCK(dir, [wMin, wMax], [winMin, winMax]) {
          await this.ADD(
            new Building(
              random(3, this.ARR.length),
              random(wMin, wMax),
              random(winMin, winMax)
            )
          );
          await this.MOVE(dir);
          await this.RENDER();
        },
      };
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
        constructor(x, y, target) {
          super(x, y, target);
          this.template = Object.freeze(
            new self.TMPLS[self.USER[self.LEVEL]](0, 0, 0, null).template
          );
          this.SETUP();
        }
        SETUP() {
          this.z = self.LANELOOKUP.laneOf(this.y);
          this.bounds.TL = [this.x, this.y];
          this.bounds.TR = [this.x + this.template[0].length, this.y];
          this.bounds.BL = [this.x, this.y + this.template.length];
          this.bounds.BR = [
            this.x + this.template[0].length,
            this.y + this.template.length,
          ];
        }
      }
      self.USER = new USER(4, self.LANELOOKUP.inLane(1, "middle"), self.ROAD);
      // self.QUEUE.push(self.USER);
    }
    // tick and game run
    self.TICK = setInterval(async () => {
      const dir = -2;
      await self.BUILDINGS.CLOCK(dir, [3, 5], [2, 6]);
      self.ROAD.SHIFT(dir | 1);
      if (self.RENDERQUEUE) RENDER();
    }, self.SPEED * (1 / self.LEVEL));
  }
}

const myGame = new Game(1, 1, 3, 100, document.querySelector("#game"), 300);

//good speed is 100

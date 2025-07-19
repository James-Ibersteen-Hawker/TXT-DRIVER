"use strict";
class Game {
  LEVEL;
  LANES;
  GAMEWIDTH;
  RENDERTO;
  SPEED;
  KEYCONTROLS;
  MOVESPEED;
  MAXSCORE;
  LIVES;
  MAXSPEED;
  MINSPEED;
  constructor(
    LEVEL,
    LANES,
    GAMEWIDTH,
    RENDERTO,
    SPEED,
    KEYCONTROLS,
    MOVESPEED,
    MAXSCORE,
    LIVES,
    MAXSPEED,
    MINSPEED
  ) {
    const self = this;
    (this.LEVEL = LEVEL),
      (this.LANES = LANES),
      (this.MOVESPEED = MOVESPEED),
      (this.GAMEWIDTH = GAMEWIDTH),
      (this.RENDERTO = RENDERTO),
      (this.QUEUE = (() => {
        let src = {
          ARR: [],
          RUN(loc) {
            this.ARR.PROPSORT("z");
            let newQueue = [];
            this.ARR.forEach((e) => {
              if (e.RENDER(loc)) newQueue.push(e);
            });
            this.ARR = newQueue;
            this.ARR.forEach((e) => {
              if (e != self.USER) e.MOVE();
            });
          },
          ADD(b = false) {
            if (!b) {
              const lane = Math.floor(Math.random() * self.ROAD.length);
              const vehicleArr = Object.entries(self.TMPLS).filter(
                ([k, _]) => k !== "SGMT" && k[0] !== "u"
              );
              const selected =
                self.TMPLS[
                  vehicleArr[Math.floor(Math.random() * vehicleArr.length)][0]
                ];
              let y = lane;
              let x = self.ROAD[0].length - 1;
              const speed =
                self.MOVESPEED +
                Math.round(Math.random() * 3 * Math.sign(self.MOVESPEED)) +
                1 * Math.sign(self.MOVESPEED);
              y = Math.min(
                y,
                self.ROAD.length - new selected(0, 0, 0).template.length
              );
              y = Math.max(-1, y);
              const sameLane = this.ARR.filter(
                (e) => e.y - self.BUILDINGS.ARR.length == y
              );
              if (sameLane.length > 0) {
                sameLane.PROPSORT("x");
                x =
                  sameLane.at(-1).x +
                  sameLane.at(-1).template[0].length +
                  self.USER.template.length +
                  self.USER.template[0].length;
                x = Math.max(x, self.ROAD[0].length - 1);
              }
              this.ARR.push(new selected(x, y, speed, false));
            } else this.ARR.push(b);
          },
        };
        return src;
      })()),
      (this.RENDERQUEUE = false),
      (this.TMPLS = {}),
      (this.BASECLASS = class {
        MOVESPEED;
        USER;
        set y(v) {
          this._y = v;
          this.RESET();
        }
        get y() {
          return this._y;
        }
        get fakeY() {
          return this.y - Math.ceil(this.template.length / 2);
        }
        constructor(x, y, MOVESPEED, USER) {
          (this._x = x), (this._y = y);
          (this.z = null),
            (this.bounds = {
              TL: null,
              TR: null,
              BL: null,
              BR: null,
            }),
            (this.MOVESPEED = MOVESPEED),
            (this.USER = USER);
        }
        SETUP() {
          this.z = this.y;
          this.y += self.BUILDINGS.ARR.length;
          const inself = this;
          this.bounds.TL = { x: inself.x, y: inself.y };
          this.bounds.TR = {
            x: inself.x + inself.template[0].length,
            y: inself.y,
          };
          this.bounds.BL = {
            x: inself.x,
            y: inself.y + inself.template.length,
          };
          this.bounds.BR = {
            x: inself.x + inself.template[0].width,
            y: inself.y + inself.template.length,
          };
        }
        RESET() {
          this.z = this.y;
          this.bounds.TL = [this.x, this.y];
          this.bounds.TR = [this.x + this.template[0].length, this.y];
          this.bounds.BL = [this.x, this.y + this.template.length];
          this.bounds.BR = [
            this.x + this.template[0].width,
            this.y + this.template.length,
          ];
        }
        RENDER(loc) {
          return this.template.OVER(loc, this.x, this.y);
        }
      }),
      (this.SPEED = SPEED),
      (this.ROAD = null),
      (this.BUILDINGS = {
        ARR: [],
      }),
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
      (this.USER = undefined),
      (this.KEYCONTROLS = KEYCONTROLS),
      (this.KEYS = new Set()),
      (this.BUILDINGS = []),
      (this.MINSPEED = MINSPEED),
      (this.MAXSPEED = MAXSPEED),
      (this.MAXLEVEL = null),
      (this.RENDERSPEED = 0),
      (this.USERPROPS = []),
      (this.SCORE = {
        _time: 0,
        _points: 0,
        _lives: LIVES,
        max: MAXSCORE,
        LOC: (() => {
          let e = document.createElement("div");
          e.id = "_game_score";
          return e;
        })(),
        set time(arg) {
          this._time = arg;
          this.points++;
        },
        get time() {
          return this._time;
        },
        set points(v) {
          this._points = v;
          self.SCORE.LOC.textContent = this.points;
          //game end
          if (this.points == this.max) {
            clearInterval(self.TICK);
            function RENDER() {
              return new Promise((resolve, reject) => {
                const tempROAD = Array.from(
                  { length: self.ROAD.length },
                  (_, i) => [...self.ROAD[i]]
                );
                const temp = [
                  ...self.BUILDINGS.ARR,
                  ...tempROAD,
                  ...new Array(self.BUILDINGS.ARR.length - 3)
                    .fill(null)
                    .map(() => new Array(self.ROAD[0].length).fill("░")),
                ];
                self.QUEUE.RUN(temp);
                temp.splice(0, 0, new Array(self.ROAD[0].length).fill("‾"));
                temp.push(new Array(self.ROAD[0].length).fill("‾"));
                const result = temp
                  .map((row, i) => {
                    if (i != temp.length - 1) return "|" + row.join("") + "|";
                    else return " " + row.join("") + " ";
                  })
                  .join("<br>");
                self.RENDERTO.innerHTML = result;
                resolve();
              });
            }
            self.QUEUE.ARR = [self.USER];
            self.ROAD.slice(0, self.ROAD.length - 1).forEach((e, i) => {
              self.QUEUE.ADD(
                new self.TMPLS.truckDouble(
                  self.ROAD[0].length,
                  i,
                  self.MOVESPEED + 1 * Math.sign(self.MOVESPEED)
                )
              );
            });
            self.TICK = setInterval(async () => {
              let truckCount = 0;
              let truckOverUSER = 0;
              await RENDER();
              self.QUEUE.ARR.forEach((e) => {
                if (self.MOVESPEED < 0) {
                  if (e.bounds.TR[0] < 0) truckCount++;
                  if (e.x == self.USER.x && e != self.USER) truckOverUSER++;
                }
              });
              if (truckOverUSER == self.QUEUE.ARR.length - 1) {
                const index = self.QUEUE.ARR.indexOf(self.USER);
                self.QUEUE.ARR.splice(index, 1);
              }
              if (truckCount == self.QUEUE.ARR.length) {
                clearInterval(self.TICK);
                self.GAMEEND(self);
              }
            }, self.RENDERSPEED);
          }
        },
        get points() {
          return this._points;
        },
        set lives(v) {
          const inself = this;
          const hold = inself.lives;
          this._lives = v;
          console.log(this.lives)
          //life change system
          if (hold > inself.lives) {
            clearInterval(self.TICK);
            inself.points = 0;
            self.SCORE.LOC.textContent = "CRASH!";
            setTimeout(() => {
              self.PLAY(self);
            }, 1000);
          }
          //end of game
          if (this.lives == 0) self.GAMEEND();
        },
        get lives() {
          return this._lives;
        },
      });
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
            constructor(x, y, MOVESPEED) {
              super(x, y, MOVESPEED);
              this.template = Object.freeze(Array.from(v).DIV(2));
              this.SETUP();
            }
            MOVE() {
              this.x += this.MOVESPEED;
            }
            DODGE() {
              let sameLane = self.QUEUE.ARR.filter(
                (e) => e.y == this.y && e.USER !== true && e != this
              );
              if (sameLane.length > 0) {
                sameLane = sameLane.filter((e) => {
                  if (self.MOVESPEED < 0) return e.x <= this.x;
                  else return e.x >= this.x;
                });
                if (sameLane.length > 0) {
                  sameLane.PROPSORT("x");
                  const last = sameLane.at(-1);
                  const lB = last.bounds;
                  if (Math.abs(last.MOVESPEED) < Math.abs(this.MOVESPEED)) {
                    const vDiff = this.MOVESPEED - last.MOVESPEED;
                    if (vDiff % 1 != 0) console.error(vDiff);
                    const fakeX =
                      self.MOVESPEED < 0
                        ? this.x
                        : this.x + this.template[0].length;
                    let xArr = new Array(Math.abs(vDiff))
                      .fill(null)
                      .map((_, i) => fakeX + i * Math.sign(this.MOVESPEED) + 1);
                    const dist = Math.abs(last.x - fakeX);
                    const dT = Math.abs(Math.ceil((dist / vDiff) * (2 / 3)));
                    const step = Math.ceil(Math.abs(vDiff / dT));
                    if (self.MOVESPEED < 0 && xArr.includes(lB.TR[0])) {
                      if (isFinite(step))
                        this.MOVESPEED -= step * Math.sign(this.MOVESPEED);
                    }
                  }
                }
              }
            }
            set x(v) {
              this._x = v;
              this.DODGE();
              this.RESET();
            }
            get x() {
              return this._x;
            }
          };
          if (i === 1) self.USERPROPS.push(k);
        });
      } else {
        const [name, val] = templates[2]?.[0];
        self.TMPLS[name] = Array.from(val).DIV(3);
      }
    });
    window.addEventListener("keydown", (event) => {
      const k = event.key;
      if (self.KEYCONTROLS.includes(k) && !self.KEYS.has(k)) {
        event.preventDefault();
        self.KEYS.add(k);
      }
    });
    window.addEventListener("keyup", (event) => {
      const k = event.key;
      if (self.KEYS.has(k)) self.KEYS.delete(k);
    });
    self.MAXLEVEL = Object.keys(self.TMPLS).filter((v) => v[0] === "u").length;
    self.RENDERTO.insertAdjacentElement("beforebegin", self.SCORE.LOC);
    self.PLAY(self);
  }
  async PLAY(self) {
    const seg = self.TMPLS.SGMT;
    self.QUEUE.ARR = [];
    function random(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function RENDER() {
      return new Promise((resolve, reject) => {
        const tempROAD = Array.from({ length: self.ROAD.length }, (_, i) => [
          ...self.ROAD[i],
        ]);
        const temp = [
          ...self.BUILDINGS.ARR,
          ...tempROAD,
          ...new Array(self.BUILDINGS.ARR.length - 3)
            .fill(null)
            .map(() => new Array(self.ROAD[0].length).fill("░")),
        ];
        self.USER.y = Math.min(
          self.USER.y,
          self.BUILDINGS.ARR.length +
            self.ROAD.length -
            self.USER.template.length
        );
        self.USER.y = Math.max(self.BUILDINGS.ARR.length - 1, self.USER.y);
        self.QUEUE.RUN(temp);
        temp.splice(0, 0, new Array(self.ROAD[0].length).fill("‾"));
        temp.push(new Array(self.ROAD[0].length).fill("‾"));
        const result = temp
          .map((row, i) => {
            if (i != temp.length - 1) return "|" + row.join("") + "|";
            else return " " + row.join("") + " ";
          })
          .join("<br>");
        self.RENDERTO.innerHTML = result;
        self.RENDERQUEUE = false;
        resolve();
      });
    }
    self.LANES = Math.max(3, self.LANES);
    self.LEVEL = Math.min(self.MAXLEVEL, self.LEVEL);
    self.RENDERSPEED = self.SPEED * (1 / self.LEVEL);
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
        constructor(x, y, MOVESPEED, USER) {
          super(x, y, MOVESPEED, USER);
          this.template = Object.freeze(
            new self.TMPLS[self.USERPROPS[self.LEVEL]](0, 0, 0, null).template
          );
          this.SETUP();
        }
        set x(v) {
          this._x = v;
        }
        get x() {
          return this._x;
        }
      }
      self.USER = new USER(4, self.LANELOOKUP.inLane(1, "middle"), 0, true);
      self.QUEUE.ARR.push(self.USER);
    }
    // tick and game run
    let tickCounter = 0;
    let pointCounter = 0;
    let everyPoint = 2;
    const incr = Math.round(
      (self.MAXSPEED - self.MINSPEED) / (self.MAXLEVEL - 1)
    );
    let addOffset = self.MINSPEED - incr * (self.LEVEL - 1);
    self.TICK = setInterval(async () => {
      await self.BUILDINGS.CLOCK(self.MOVESPEED, [3, 5], [2, 6]);
      self.ROAD.SHIFT(self.MOVESPEED);
      if (self.KEYS.has(self.KEYCONTROLS[0])) self.USER.y--;
      if (self.KEYS.has(self.KEYCONTROLS[1])) self.USER.y++;
      if (self.RENDERQUEUE) await RENDER();
      if (tickCounter % Math.round(addOffset / self.RENDERSPEED) == 0) {
        self.QUEUE.ADD();
      }
      if (tickCounter % Math.round(1000 / self.RENDERSPEED) == 0) {
        if (pointCounter % everyPoint == 0) self.SCORE.time++;
        if (pointCounter == 3) self.SCORE.lives--;
        pointCounter++;
      }
      if (tickCounter > 1000) tickCounter = 0;
      tickCounter++;
    }, self.RENDERSPEED);
  }
  GAMEEND(self) {
    setTimeout(async () => {
      let i = 0;
      let shift = 0;
      self.SCORE.LOC.textContent = "";
      self.TICK = new Promise((resolve, reject) => {
        setInterval(() => {
          let temp = [
            ...self.BUILDINGS.ARR,
            ...self.ROAD,
            ...new Array(self.BUILDINGS.ARR.length - 3)
              .fill(null)
              .map(() => new Array(self.ROAD[0].length).fill("░")),
          ];
          if (i <= temp.length) {
            for (let q = 0; q < i; q++) {
              let arr = new Array(1).fill(new Array(self.GAMEWIDTH).fill("^"));
              arr.OVER(temp, 0, q);
            }
          } else if (i > temp.length) {
            temp = new Array(temp.length)
              .fill(null)
              .map(() => new Array(self.ROAD[0].length).fill("^"));
            for (let q = 0; q < i - temp.length; q++) {
              let arr = new Array(1).fill(new Array(self.GAMEWIDTH).fill(" "));
              arr.OVER(temp, 0, q);
            }
            if (i >= temp.length * 2) {
              clearInterval(self.TICK);
              resolve();
            }
          }
          temp.splice(0, 0, new Array(self.ROAD[0].length).fill("‾"));
          temp.push(new Array(self.ROAD[0].length).fill("‾"));
          const result = temp
            .map((row, i) => {
              if (i != temp.length - 1) return `|${row.join("")}|`;
              else return ` ${row.join("")} `;
            })
            .join("<br>");
          self.RENDERTO.innerHTML = result;
          i++;
          shift++;
        }, self.RENDERSPEED);
      });
      await self.TICK;
    }, self.RENDERSPEED * 2);
  }
}

const myGame = new Game(
  1,
  3,
  70,
  document.querySelector("#game"),
  80,
  ["ArrowUp", "ArrowDown"],
  -1,
  10,
  3,
  400,
  800
);

//good speed is 100 or 80

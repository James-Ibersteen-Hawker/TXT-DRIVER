"use strict";
class Game {
  LEVEL;
  LANES;
  GAMEWIDTH;
  RENDERTO;
  MINRENDERSPEED;
  MAXRENDERSPEED;
  GENSPEED;
  KEYCONTROLS;
  MOVESPEED;
  LIVES;
  MAXSPEED;
  MINSPEED;
  SPEEDKEY;
  TYPETIME;
  SCROLLKEYS;
  SKIPKEY;
  constructor(
    LEVEL,
    LANES,
    GAMEWIDTH,
    RENDERTO,
    MINRENDERSPEED,
    MAXRENDERSPEED,
    GENSPEED,
    KEYCONTROLS,
    MOVESPEED,
    MAXSCORE,
    LIVES,
    MAXSPEED,
    MINSPEED,
    SPEEDKEY,
    TYPETIME,
    SCROLLKEYS,
    SKIPKEY
  ) {
    const self = this;
    (this.LEVEL = LEVEL),
      (this.LANES = LANES),
      (this.MOVESPEED = MOVESPEED),
      (this.GAMEWIDTH = GAMEWIDTH),
      (this.RENDERTO = RENDERTO),
      (this.QUEUE = {
        ARR: [],
        RUN(loc, checkBool) {
          this.ARR.PROPSORT("z");
          const newQueue = [];
          this.ARR.forEach((e) => {
            if (e.RENDER(loc)) newQueue.push(e);
          });
          this.ARR = newQueue;
          this.ARR.forEach((e) => {
            if (e !== self.USER) e.MOVE();
          });
          this.CHECKLOCK(self.USER.y, checkBool);
        },
        ADD(b = false) {
          if (!b) {
            const r = self.ROAD;
            const m = self.MOVESPEED;
            const vArr = Object.entries(self.TMPLS).filter(
              ([k, _]) => k !== "SGMT" && k[0] !== "u"
            );
            const selected =
              self.TMPLS[vArr[self.RANDOM(0, vArr.length - 1)][0]];
            let x = r[0].length - 1;
            let y = self.RANDOM(-1, r.length - 1);
            y = Math.max(
              -1,
              Math.min(y, r.length - new selected().template.length)
            );
            const speed = m + self.RANDOM(0, 3 * m.sign()) + m.sign();
            const sameLane = this.INLANE(y + self.BUILDINGS.ARR.length);
            if (sameLane.length > 0) {
              sameLane.PROPSORT("x");
              x =
                sameLane.at(-1).x +
                sameLane.at(-1).template[0].length +
                self.USER.template.length +
                self.USER.template[0].length;
              x = Math.max(x, r[0].length - 1);
            }
            this.ARR.push(new selected(x, y, speed, false));
          } else this.ARR.push(b);
        },
        INLANE(y) {
          return this.ARR.filter((e) => e.y === y);
        },
        CHECKLOCK(y, bool = true) {
          if (bool) {
            const inself = this;
            const U = self.USER;
            const indexes = [y - 1, y, y + 1];
            const cars = [];
            let number = 0;
            const range = U.template[0].length * 2.3;
            const m = self.MOVESPEED;
            if (
              y === self.BUILDINGS.ARR.length ||
              y === self.BUILDINGS.ARR.length + self.ROAD.length - 2
            )
              number++;
            indexes.forEach((index) => {
              let LANE = inself
                .INLANE(index)
                .filter((e) => !e.USER && (m < 0 ? e.x > U.x : e.x < U.x));
              if (LANE.length > 0) {
                LANE.PROPSORT("x");
                LANE = LANE.filter((e) => Math.abs(U.x - e.x) <= range);
                if (LANE.length > 0) {
                  cars.push(m < 0 ? LANE[0] : LANE.at(-1));
                  number++;
                }
              }
            });
            if (number === indexes.length || cars.length === indexes.length) {
              console.log("force kill!", cars);
              const delIndex = self.RANDOM(0, cars.length - 2);
              const carsDead = cars.slice(delIndex, delIndex + 2);
              carsDead.forEach((e) => {
                const index = inself.ARR.indexOf(e);
                inself.ARR.splice(index, 1);
              });
            }
          }
        },
      }),
      (this.RENDERQUEUE = false),
      (this.TMPLS = {}),
      (this.BASECLASS = class {
        MOVESPEED;
        USER;
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
        SETUP(inself, reset = false) {
          inself.z = inself._y;
          if (!reset) inself.y += self.BUILDINGS.ARR.length;
          inself.bounds.TL = { x: inself.x, y: inself.y };
          inself.bounds.TR = {
            x: inself.x + inself.template[0].length,
            y: inself.y,
          };
          inself.bounds.BL = {
            x: inself.x,
            y: inself.y + inself.template.length,
          };
          inself.bounds.BR = {
            x: inself.x + inself.template[0].length,
            y: inself.y + inself.template.length,
          };
        }
        RENDER(loc) {
          return this.template.OVER(loc, this.x, this.y);
        }
        set y(v) {
          this._y = v;
          this.SETUP(this, true);
        }
        get y() {
          return this._y;
        }
      }),
      (this.ROAD = null),
      (this.BUILDINGS = {
        ARR: [],
        QUEUE: [],
        CLASS: class Building {
          height;
          width;
          windowCount;
          constructor(height, width, windowCount) {
            (this.height = height === 0 ? 1 : height),
              (this.windowCount = windowCount),
              (this.width = width),
              (this.arr = null),
              (this.x = 0),
              (this.y = 0);
            this.MAKE();
          }
          MAKE() {
            const build = new Array(this.height)
              .fill(null)
              .map(() => new Array(this.width + 2).fill(" "));
            build[0].fill("‾");
            build.forEach((e) => (e[0] = e[e.length - 1] = "|"));
            const windows = [];
            for (let i = 0; i < this.windowCount; i++) {
              let [x, y] = [
                self.RANDOM(1, build[0].length - 2),
                self.RANDOM(1, build.length - 2),
              ];
              let count = 0;
              while (
                windows.some((e) => e[0] === x && e[1] === y) &&
                count < 5
              ) {
                [x, y] = [
                  self.RANDOM(1, build[0].length - 2),
                  self.RANDOM(1, build.length - 2),
                ];
                count++;
              }
              if (!windows.some((e) => e[0] === x && e[1] === y)) {
                windows.push([x, y]);
                build[y][x] = "█";
              }
            }
            this.arr = build;
          }
        },
        async RENDER() {
          return new Promise((resolve, reject) => {
            try {
              const result = [];
              this.ARR = this.ARR.map((e) => e.map(() => " "));
              this.QUEUE.forEach((e) => {
                if (e.arr.OVER(this.ARR, e.x, e.y) === true) result.push(e);
              });
              this.QUEUE = result;
              self.RENDERQUEUE = true;
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        },
        async ADD(b) {
          return new Promise((resolve, reject) => {
            try {
              const last = self.BUILDINGS.QUEUE.at(-1);
              b.x = last ? last.x + last.width + 2 : 0;
              b.y = self.BUILDINGS.ARR.length - b.height;
              self.BUILDINGS.QUEUE.push(b);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        },
        async MOVE(dir) {
          return new Promise((resolve, reject) => {
            try {
              self.BUILDINGS.QUEUE.forEach((e) => (e.x += dir));
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        },
        async CLOCK(dir, [wMin, wMax], [winMin, winMax]) {
          await this.ADD(
            new this.CLASS(
              self.RANDOM(3, this.ARR.length),
              self.RANDOM(wMin, wMax),
              self.RANDOM(winMin, winMax)
            )
          );
          await this.MOVE(dir);
          await this.RENDER();
        },
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
      (this.USER = null),
      (this.USERCLASS = class USER extends self.BASECLASS {
        constructor(x, y, MOVESPEED, USER) {
          super(x, y, MOVESPEED, USER);
          this.isColliding = false;
          this.template = Object.freeze(
            new self.TMPLS[self.USERPROPS[self.LEVEL - 1]](0, 0, 0, null)
              .template
          );
          this.SETUP(this, false);
        }
        set x(v) {
          this._x = v;
          this.SETUP(this, true);
        }
        get x() {
          return this._x;
        }
        set y(v) {
          this._y = v;
          this.SETUP(this, true);
        }
        get y() {
          return this._y;
        }
        collide() {
          if (!this.isColliding) {
            this.isColliding = true;
            const sameLane = self.QUEUE.INLANE(this.y).filter((e) => !e.USER);
            if (sameLane.length > 0) {
              sameLane.PROPSORT("x");
              const first = sameLane[0];
              const fB = { BR: first.bounds.BR, BL: first.bounds.BL };
              const tB = { BR: this.bounds.BR, BL: this.bounds.BL };
              for (let p in fB) {
                const b = fB[p];
                if (b.y == tB.BR.y) {
                  if (b.x <= tB.BR.x && b.x >= tB.BL.x) self.SCORE.lives--;
                }
              }
            }
            setTimeout(() => (this.isColliding = false), 10);
          } else return;
        }
      }),
      (this.KEYCONTROLS = KEYCONTROLS),
      (this.KEYS = new Set()),
      (this.MINSPEED = MINSPEED),
      (this.MAXSPEED = MAXSPEED),
      (this.TYPETIME = TYPETIME),
      (this.MINRENDERSPEED = MINRENDERSPEED),
      (this.MAXRENDERSPEED = MAXRENDERSPEED),
      (this.GENSPEED = GENSPEED),
      (this.MAXLEVEL = null),
      (this.RENDERSPEED = 0),
      (this.USERPROPS = []),
      (this.ISRESET = false),
      (this.incr = null),
      (this.USERTMPLS = []),
      (this.SPEEDKEY = SPEEDKEY || "z"),
      (this.SCROLLKEYS = SCROLLKEYS),
      (this.SKIPKEY = SKIPKEY),
      (this.SCORE = {
        _time: 0,
        _points: 0,
        _lives: LIVES,
        max: MAXSCORE,
        LOC: document.createElement("h2"),
        set time(v) {
          this._time = v;
          this.points++;
        },
        get time() {
          return this._time;
        },
        set points(v) {
          this._points = v;
          self.SCORE.LOC.textContent = `Points: ${this.points}  |  Lives: ${this.lives}`;
          if (this.points === this.max) {
            clearInterval(self.TICK);
            self.QUEUE.ARR = [self.USER];
            self.ROAD.forEach((_, i) => {
              self.QUEUE.ADD(
                new self.TMPLS.truckDouble(
                  self.ROAD[0].length,
                  i - 1,
                  self.MOVESPEED + self.MOVESPEED.sign()
                )
              );
            });
            self.TICK = setInterval(async () => {
              let truckCount = 0;
              let truckOverUSER = 0;
              await self.RENDER(self, false, false);
              self.QUEUE.ARR.forEach((e) => {
                if (self.MOVESPEED < 0) {
                  if (e.bounds.TR.x < 0) truckCount++;
                  if (e.x === self.USER.x && e !== self.USER) truckOverUSER++;
                }
              });
              if (truckOverUSER === self.QUEUE.ARR.length - 1) {
                const index = self.QUEUE.ARR.indexOf(self.USER);
                self.QUEUE.ARR.splice(index, 1);
              }
              if (truckCount === self.QUEUE.ARR.length) {
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
          inself._lives = v;
          let callback;
          if (inself._lives < 0)
            throw new Error("Lives Error! Game Overacceleration!");
          if (hold > inself.lives && inself.lives > 0) {
            callback = self.PLAY;
            inself.points = 0;
          } else if (inself.lives === 0) callback = self.GAMEEND;
          clearInterval(self.TICK);
          self.SCORE.LOC.textContent = "CRASH!";
          setTimeout(() => callback(self), 1000);
        },
        get lives() {
          return this._lives;
        },
      });
    this.SETUP(self);
  }
  async SETUP(self) {
    self.RENDERTO.innerHTML = "";
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
    Array.prototype.DOCPRINT = function (border = true) {
      return this.map((e, i, a) =>
        i !== a.length - 1 && border === true
          ? `|${e.join("")}|`
          : ` ${e.join("")} `
      ).join("<br>");
    };
    Number.prototype.sign = function () {
      return Math.sign(this);
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
            constructor(x, y, MOVESPEED, USER) {
              super(x, y, MOVESPEED, USER);
              this.template = Object.freeze(Array.from(v).DIV(2));
              this.SETUP(this, false);
            }
            MOVE() {
              this.x += this.MOVESPEED;
            }
            DODGE() {
              let sameLane = self.QUEUE.INLANE(this.y).filter((e) => !e.USER);
              if (sameLane.length > 0) {
                const m = self.MOVESPEED;
                sameLane = sameLane.filter((e) =>
                  m < 0 ? e.x <= this.x : e.x >= this.x
                );
                if (sameLane.length > 0) {
                  sameLane.PROPSORT("x");
                  const last = sameLane.at(-1);
                  const lB = last.bounds;
                  let tM = this.MOVESPEED;
                  const lM = last.MOVESPEED;
                  if (Math.abs(lM) < Math.abs(tM)) {
                    const vDiff = tM - lM;
                    if (vDiff % 1 !== 0)
                      throw new Error(`${vDiff} !== integer`);
                    const fakeX =
                      m < 0 ? this.x : this.x + this.template[0].length;
                    const dist = Math.abs(last.x - fakeX);
                    const dT = Math.abs(Math.ceil((dist / vDiff) * (2 / 3)));
                    const step = Math.ceil(Math.abs(vDiff / dT));
                    const xs = new Array(lB.TR.x - lB.TL.x + 1)
                      .fill(null)
                      .map((_, i) => lB.TR.x + i);
                    if (xs.includes(this.x + m.sign()) && tM !== lM) tM = lM;
                    if (isFinite(step)) tM -= step * tM.sign();
                  }
                }
              }
            }
            set x(v) {
              this._x = v;
              this.DODGE();
              this.SETUP(this, true);
            }
            get x() {
              return this._x;
            }
            set y(v) {
              this._y = v;
              this.DODGE();
              this.SETUP(this, true);
            }
            get y() {
              return this._y;
            }
          };
          if (i === 1) {
            self.USERPROPS.push(k);
            self.USERTMPLS.push(Array.from(v).DIV(2));
          }
        });
      } else {
        const [name, val] = templates[2]?.[0];
        self.TMPLS[name] = Array.from(val).DIV(3);
      }
    });
    self.MAXLEVEL = Object.keys(self.TMPLS).filter((v) => v[0] === "u").length;
    await self.OPEN(self);
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
    self.RENDERTO.insertAdjacentElement("beforebegin", self.SCORE.LOC);
    self.LEVEL = Math.min(self.MAXLEVEL, self.LEVEL);
    self.incr = Math.round(
      (self.MINSPEED - self.MAXSPEED) / (self.MAXLEVEL - 1)
    );
    const renderIncr = Math.round(
      (self.MINRENDERSPEED - self.MAXRENDERSPEED) / (self.MAXLEVEL - 1)
    );
    self.RENDERSPEED = self.MINRENDERSPEED - renderIncr * self.LEVEL;
    self.PLAY(self);
  }
  async OPEN(self) {
    return new Promise(async (resolveTOP, rejectTOP) => {
      const time = self.TYPETIME;
      const selectStep = 175;
      const speedIncr = 5;
      const h1 = document.createElement("h1");
      const h3 = document.createElement("h3");
      const selectionMenu = document.createElement("div");
      let mult = 1;
      let speedkey = false;
      function Time() {
        return time * mult;
      }
      function* laneCounter() {
        let start = 3;
        while (true) {
          for (let i = 0; i < start; i++) yield start;
          start++;
        }
      }
      const laneGen = laneCounter();
      String.prototype.TYPE = async function (loc) {
        const inself = this;
        return new Promise(async (resolveAll, reject) => {
          try {
            const split = inself.split("");
            let skipPressed = false;
            window.addEventListener("keydown", SKIP);
            for (let i = 0; i < split.length; i++) {
              if (skipPressed) {
                window.removeEventListener("keydown", SKIP);
                loc.textContent = inself;
                resolveAll();
                break;
              }
              await letter(split[i], Time());
              if (i === split.length - 1) resolveAll(inself);
            }
            function letter(e, t) {
              return new Promise((resolve, reject) => {
                try {
                  setTimeout(() => {
                    loc.appendChild(document.createTextNode(e));
                    resolve();
                  }, t);
                } catch (e) {
                  reject(e);
                }
              });
            }
            function SKIP(e) {
              if (e.key === self.SKIPKEY) {
                skipPressed = true;
                event.preventDefault();
              }
            }
          } catch (error) {
            reject(error);
          }
        });
      };
      HTMLElement.prototype.SELECT = async function (
        step = 100,
        hasCall = false,
        callBack = false,
        cancelKey,
        cancelCallback
      ) {
        const ref = this;
        const save = ref.textContent.split("");
        let i = 0;
        const int = setInterval(() => {
          ref.textContent = `${[">", " "][(i ^= 1)]}${save.slice(1).join("")}`;
        }, step);
        return hasCall
          ? new Promise(async (resolve, reject) => {
              const press = 1;
              let flag = 0;
              async function CTRLFC(e) {
                if (flag & press) return;
                if (e.key === "Enter") {
                  flag |= press;
                  clearInterval(int);
                  window.removeEventListener("keydown", CTRLFC);
                  if (callBack) {
                    await callBack();
                    resolve();
                  } else reject("No provided function");
                } else if (e.key === cancelKey && cancelKey) {
                  if (cancelCallback) await cancelCallback();
                  clearInterval(int);
                  resolve;
                }
              }
              window.addEventListener("keydown", CTRLFC);
            })
          : {
              stop() {
                clearInterval(int);
                ref.textContent = save.join("");
              },
            };
      };
      window.addEventListener("keydown", (event) => {
        if (speedkey === false && event.key === self.SPEEDKEY) {
          mult = 1 / speedIncr;
          speedkey = true;
        }
        if (event.key === self.SKIPKEY) event.preventDefault();
      });
      window.addEventListener("keyup", (event) => {
        if (event.key === self.SPEEDKEY) {
          speedkey = false;
          mult = 1;
        }
      });
      try {
        self.RENDERTO.append(h1);
        const speedh3 = document.createElement("h3");
        self.RENDERTO.append(speedh3);
        if (!self.ISRESET) {
          setTimeout(() => {
            speedh3.textContent = `- Press ${self.SPEEDKEY} to accelerate typing, and ${self.SKIPKEY} to skip. -`;
          }, 350);
          await ">>> Car.TXT >>>".TYPE(h1);
          await self.WAIT(500);
          self.RENDERTO.append(h3);
          h3.textContent = "  Play";
          await h3.SELECT(selectStep, true, async () => {
            h1.textContent = "";
            h3.textContent = "";
            speedh3.remove();
            await ">>> Select Difficulty >>>".TYPE(h1);
            await self.WAIT(500);
            h3.textContent = `- Use ${self.SCROLLKEYS[0]} and ${self.SCROLLKEYS[1]} to scroll. Press Enter to select. -`;
            await self.WAIT(500);
          });
        } else {
          await ">>> Select Difficulty >>>".TYPE(h1);
          await self.WAIT(500);
          h3.textContent = `- Use ${self.SCROLLKEYS[0]} and ${self.SCROLLKEYS[1]} to scroll. Press Enter to select. -`;
          await self.WAIT(500);
          self.ISRESET = false;
        }
        const boxWidth =
          [...self.USERTMPLS].sort((a, b) => b[0].length - a[0].length)?.[0][0]
            .length + 4;
        const boxArr = new Array(Math.max(Math.round(boxWidth / 2), 9))
          .fill(null)
          .map(() => new Array(boxWidth * self.MAXLEVEL + 1).fill(" "));
        let levelIncr = 1;
        let vehicleIncr = 0;
        let laneIncr = 0;
        const y = Math.floor(boxArr.length / 2);
        const boxArrRef = Object.fromEntries(
          Array.from({ length: self.MAXLEVEL }, (_, i) => [`_${i + 1}`, false])
        );
        Object.keys(boxArrRef).forEach((e) => {
          Object.defineProperty(boxArrRef, e.slice(1), {
            set: function (v) {
              this[e] = v;
              const fI = boxArr[2].indexOf(Number(e.slice(1)));
              const lI = boxArr[2].lastIndexOf(Number(e.slice(1)));
              let arrowL, arrowR;
              if (v) [arrowL, arrowR] = [[["-", "-", ">"]], [["<", "-", "-"]]];
              if (!v) [arrowL, arrowR] = [[[" ", " ", " "]], [[" ", " ", " "]]];
              arrowL.OVER(boxArr, fI - arrowL.length - 3, 2);
              arrowR.OVER(boxArr, lI + 2, 2);
              selectionMenu.innerHTML = boxArr.DOCPRINT(false);
            },
            get: function () {
              return this[e];
            },
          });
        });
        boxArrRef.currentCatalogue = {
          lives: null,
          lanes: null,
        };
        for (let i = 0; i < self.MAXLEVEL; i++) {
          boxArrRef[`${i + 1}Catalogue`] = {
            lives: 3,
            lanes: laneGen.next().value,
          };
        }
        for (let i = 0; i < boxArr.length; i++) {
          for (let q = 0; q < boxArr[i].length; q++) {
            if (q % boxWidth === 0) boxArr[i][q] = "|";
            else if (q % Math.round(boxWidth / 2) === 0 && i === 1) {
              boxArr[i][q] = levelIncr;
              levelIncr++;
            }
            if (q % Math.round(boxWidth / 2) === 0 && boxArr[i][q] !== "|") {
              if (i === y) {
                const current = self.USERTMPLS[vehicleIncr];
                if (current)
                  current.OVER(
                    boxArr,
                    q - Math.round(current[0].length / 2) + 1,
                    y - current.length / 2
                  );
                vehicleIncr++;
              }
              if (i === boxArr.length - 3) {
                const text = [`Lives: 3`.split("")];
                text.OVER(boxArr, q - Math.round(text[0].length / 2) + 1, i);
              }
              if (i === boxArr.length - 2) {
                const text = [
                  `Lanes: ${boxArrRef[`${laneIncr + 1}Catalogue`].lanes}`.split(
                    ""
                  ),
                ];
                text.OVER(boxArr, q - Math.round(text[0].length / 2) + 1, i);
                laneIncr++;
              }
            }
          }
        }
        boxArr.splice(0, 0, new Array(boxArr[0].length).fill("-"));
        boxArr.push(new Array(boxArr[0].length).fill("-"));
        self.RENDERTO.append(selectionMenu);
        selectionMenu.innerHTML = boxArr.DOCPRINT(false);
        boxArrRef["1"] = true;
        let activeI = 1;
        const subH3 = document.createElement("h3");
        self.RENDERTO.append(subH3);
        const undo = document.createElement("h3");
        self.RENDERTO.append(undo);
        function scrollLevels(e) {
          if (e.key === self.SCROLLKEYS[0]) {
            boxArrRef[`${activeI}`] = false;
            activeI++;
            if (activeI > self.MAXLEVEL) activeI = 1;
            boxArrRef[`${activeI}`] = true;
          } else if (e.key === self.SCROLLKEYS[1]) {
            boxArrRef[`${activeI}`] = false;
            activeI--;
            if (activeI < 1) activeI = self.MAXLEVEL;
            boxArrRef[`${activeI}`] = true;
          }
        }
        window.addEventListener("keydown", scrollLevels);
        //make loopable code
        await new Promise(async (resolveSelector, rejectSelector) => {
          try {
            async function CTRLFC(e) {
              if (e.key === "Enter") {
                window.removeEventListener("keydown", scrollLevels);
                window.removeEventListener("keydown", CTRLFC);
                self.LEVEL = activeI;
                self.LIVES = boxArrRef[`${activeI}Catalogue`].lives;
                self.LANES = boxArrRef[`${activeI}Catalogue`].lanes;
                self.SCORE._lives = self.LIVES;
                await `- Difficulty ${self.LEVEL} selected. -`.TYPE(subH3);
                await self.WAIT(200);
                undo.textContent = "  Undo Selection? Press X to cancel";
                await undo.SELECT(
                  selectStep,
                  true,
                  async function () {
                    window.addEventListener("keydown", scrollLevels);
                    window.addEventListener("keydown", CTRLFC);
                    subH3.textContent = "";
                    undo.textContent = "";
                  },
                  "x",
                  async function () {
                    window.removeEventListener("keydown", scrollLevels);
                    window.removeEventListener("keydown", CTRLFC);
                    undo.textContent = "  Undo Selection? Press X to cancel";
                    resolveSelector();
                  }
                );
              }
            }
            window.addEventListener("keydown", CTRLFC);
          } catch (error) {
            rejectSelector(error);
          }
        });
        const play = document.createElement("h2");
        self.RENDERTO.append(play);
        play.textContent = "  Play";
        await play.SELECT(selectStep, true, async () => {
          self.RENDERTO.innerHTML = "";
          resolveTOP();
        });
      } catch (error) {
        rejectTOP(error);
      }
    });
  }
  async PLAY(self) {
    await new Promise(async (resolve, reject) => {
      try {
        for (let i = 3; i > 0; i--) {
          self.SCORE.LOC.textContent = i;
          await new Promise((resolveIn) => setTimeout(resolveIn, 1000));
        }
        self.SCORE.LOC.textContent = "DRIVE!";
        setTimeout(resolve, 1000);
      } catch (error) {
        reject(error);
      }
    });
    const seg = self.TMPLS.SGMT;
    self.QUEUE.ARR = [];
    self.LANES = Math.max(3, self.LANES);
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
    self.BUILDINGS.ARR = new Array(8)
      .fill(null)
      .map(() => new Array(self.ROAD[0].length).fill(" "));
    //lane lookup
    self.LANELOOKUP.sets = new Array(self.LANES)
      .fill(null)
      .map((_, u) =>
        new Array(seg.length).fill(null).map((_, i) => i + u * seg.length)
      );
    self.LANELOOKUP.list = new Array(self.ROAD.length)
      .fill(null)
      .map((_, i) => ({
        index: i,
        set: self.LANELOOKUP.sets.indexOf(
          self.LANELOOKUP.sets.find((v) => v.includes(i))
        ),
      }));
    //user control
    {
      self.USER = new self.USERCLASS(
        4,
        self.LANELOOKUP.inLane(1, "middle"),
        0,
        true
      );
      self.QUEUE.ARR.push(self.USER);
    }
    // tick and game run
    let tickCounter = 0;
    let pointCounter = 0;
    const everyPoint = 1;
    const addOffset =
      self.MINSPEED - self.incr * (self.LEVEL - 1) - self.ROAD.length * 10;
    let tickFlag = true;
    self.TICK = setInterval(async () => {
      if (tickFlag) {
        tickFlag = false;
        await self.BUILDINGS.CLOCK(self.MOVESPEED, [3, 5], [2, 6]);
        self.ROAD.SHIFT(self.MOVESPEED);
        if (self.KEYS.has(self.KEYCONTROLS[0])) self.USER.y--;
        if (self.KEYS.has(self.KEYCONTROLS[1])) self.USER.y++;
        if (self.RENDERQUEUE) await self.RENDER(self, true, true);
        self.USER.collide();
        if (tickCounter % Math.round(addOffset / self.RENDERSPEED) === 0)
          self.QUEUE.ADD();
        if (tickCounter % Math.round(1000 / self.RENDERSPEED) === 0) {
          if (pointCounter % everyPoint === 0) self.SCORE.time++;
          pointCounter++;
        }
        if (tickCounter > 1000) tickCounter = 0;
        if (pointCounter > 100) pointCounter = 0;
        tickCounter++;
        tickFlag = true;
      }
    }, self.RENDERSPEED);
  }
  GAMEEND(self) {
    clearInterval(self.TICK);
    setTimeout(async () => {
      let i = 0;
      let shift = 0;
      self.SCORE.LOC.textContent = "Game Over";
      let tempLength, outTemp;
      self.TICK = new Promise((resolve, reject) => {
        try {
          const intervalID = setInterval(() => {
            let temp = [
              ...self.BUILDINGS.ARR,
              ...self.ROAD,
              ...new Array(self.BUILDINGS.ARR.length - 3)
                .fill(null)
                .map(() => new Array(self.ROAD[0].length).fill("░")),
            ];
            if (i <= temp.length) {
              for (let q = 0; q < i; q++) {
                const arr = new Array(1).fill(
                  new Array(self.GAMEWIDTH).fill("^")
                );
                arr.OVER(temp, 0, q);
              }
            } else if (i > temp.length) {
              temp = new Array(temp.length)
                .fill(null)
                .map(() => new Array(self.ROAD[0].length).fill("^"));
              for (let q = 0; q < i - temp.length; q++) {
                const arr = new Array(1).fill(
                  new Array(self.GAMEWIDTH).fill(" ")
                );
                arr.OVER(temp, 0, q);
              }
              if (i >= temp.length * 2) {
                clearInterval(intervalID);
                outTemp = temp;
                resolve();
              }
            }
            temp.splice(0, 0, new Array(self.ROAD[0].length).fill("‾"));
            temp.push(new Array(self.ROAD[0].length).fill("‾"));
            tempLength = temp.length;
            self.RENDERTO.innerHTML = temp.DOCPRINT();
            i++;
            shift++;
          }, self.RENDERSPEED);
        } catch (error) {
          reject(error);
        }
      });
      await self.TICK;
      const endArr = [
        `Your Score: ${self.SCORE.points}  |  Top Score: ${self.SCORE.max}`.split(
          ""
        ),
      ];
      const nextArr = ["Press Enter to continue".split("")];
      const centerY = Math.floor((tempLength - 1) / 2);
      const centerX =
        Math.floor(self.ROAD[0].length / 2) - Math.floor(endArr[0].length / 2);
      const nextX =
        Math.floor(self.ROAD[0].length / 2) - Math.floor(nextArr[0].length / 2);
      endArr.OVER(outTemp, centerX, centerY);
      self.RENDERTO.innerHTML = outTemp.DOCPRINT();
      await self.WAIT(1000);
      nextArr.OVER(outTemp, nextX, centerY + 2);
      self.RENDERTO.innerHTML = outTemp.DOCPRINT();
      function enterRESET(e) {
        if (e.key === "Enter") {
          self.BUILDINGS.ARR = [];
          self.ROAD = [];
          self.USER = undefined;
          self.SCORE._lives = null;
          self.SCORE._time = 0;
          self.LIVES = null;
          self.QUEUE.ARR = [];
          self.SCORE._points = 0;
          self.LEVEL = null;
          self.LANES = null;
          self.TMPLS = {};
          self.USERTMPLS = [];
          self.USERPROPS = [];
          self.SCORE.LOC.remove();
          window.removeEventListener("keydown", enterRESET);
          self.ISRESET = true;
          self.SETUP(self);
        }
      }
      window.addEventListener("keydown", enterRESET);
    }, self.GENSPEED);
  }
  //utilities
  RANDOM(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  RENDER(self, controlUser = false, checkBool) {
    return new Promise((resolve, reject) => {
      try {
        const tempROAD = Array.from({ length: self.ROAD.length }, (_, i) => [
          ...self.ROAD[i],
        ]);
        const temp = [
          ...self.BUILDINGS.ARR.map((e) => [...e]),
          ...tempROAD,
          ...new Array(self.BUILDINGS.ARR.length - 3)
            .fill(null)
            .map(() => new Array(self.ROAD[0].length).fill("░")),
        ];
        if (controlUser) {
          self.USER.y = Math.min(
            self.USER.y,
            self.BUILDINGS.ARR.length +
              self.ROAD.length -
              self.USER.template.length
          );
          self.USER.y = Math.max(self.BUILDINGS.ARR.length - 1, self.USER.y);
          self.RENDERQUEUE = false;
        }
        self.QUEUE.RUN(temp, checkBool);
        temp.splice(0, 0, new Array(self.ROAD[0].length).fill("‾"));
        temp.push(new Array(self.ROAD[0].length).fill("‾"));
        self.RENDERTO.innerHTML = temp.DOCPRINT();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  WAIT(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
  }
}
const myGame = new Game(
  null,
  null,
  70,
  document.querySelector("#game"),
  80,
  40,
  80,
  ["ArrowUp", "ArrowDown"],
  -1,
  30,
  null,
  600,
  800,
  "z",
  150,
  ["ArrowRight", "ArrowLeft"],
  "Tab"
);
//good speed is 100 or 80

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
  SPEEDINCR;
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
    SKIPKEY,
    SPEEDINCR
  ) {
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
    const self = this;
    (this.LEVEL = LEVEL),
      (this.LANES = Math.max(1, LANES)),
      (this.MOVESPEED = -Math.abs(MOVESPEED)),
      (this.GAMEWIDTH = Math.max(1, GAMEWIDTH)),
      (this.RENDERTO = RENDERTO),
      (this.QUEUE = {
        ARR: [],
        RUN(loc, checkBool) {
          this.ARR.PROPSORT("z");
          this.ARR = this.ARR.filter((e) => e.RENDER(loc));
          this.ARR.forEach((e) => {
            if (e !== self.USER) e.MOVE();
          });
          this.CHECKLOCK(self.USER.y, checkBool);
        },
        ADD(b = false) {
          const { ROAD: r, MOVESPEED: m, TMPLS, RANDOM: RAND, USER: U } = self;
          if (b) return this.ARR.push(b);
          const vArr = Object.entries(TMPLS).filter(
            ([k, _]) => k !== "SGMT" && k[0] !== "u"
          );
          const selected = TMPLS[vArr[RAND(0, vArr.length - 1)][0]];
          let x = r[0].length - 1;
          let y = RAND(-1, r.length - 1);
          y = Math.max(
            -1,
            Math.min(y, r.length - new selected().template.length)
          );
          const speed = m + RAND(0, 3 * m.sign()) + m.sign();
          const sL = this.INLANE(y + self.BUILDINGS.ARR.length);
          if (sL.length > 0) {
            sL.PROPSORT("x");
            x =
              sL.at(-1).x +
              sL.at(-1).template[0].length +
              U.template.length +
              U.template[0].length;
            x = Math.max(x, r[0].length - 1);
          }
          this.ARR.push(new selected(x, y, speed, false));
        },
        INLANE(y) {
          return this.ARR.filter((e) => e.y === y);
        },
        CHECKLOCK(y, bool = true) {
          if (!bool) return;
          const { USER: U, BUILDINGS: BD } = self;
          const indexes = [y - 1, y, y + 1];
          const cars = [];
          const range = U.template[0].length * 2.3;
          let count = 0;
          if (y === BD.ARR.length || y === BD.ARR.length + self.ROAD.length - 2)
            count++;
          indexes.forEach((index) => {
            let LANE = this.INLANE(index).filter(
              (e) => (!e.USER && e.x <= U.x) || e.bounds.TR.x >= U.bounds.TR.x
            );
            if (LANE.length <= 0) return;
            LANE.PROPSORT("x");
            LANE = LANE.filter(
              (e) =>
                Math.abs(U.x - e.x) <= range ||
                (e.bounds.TL.x <= U.x && e.bounds.TR.x >= U.x)
            );
            if (LANE.length <= 0) return;
            cars.push(LANE[0]);
            count++;
          });
          if (count === indexes.length || cars.length === indexes.length) {
            const delIndex = self.RANDOM(0, cars.length - 2);
            const carsDead = cars.slice(delIndex, delIndex + 2);
            carsDead.forEach((e) => this.ARR.splice(this.ARR.indexOf(e), 1));
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
          const { x, y, template: t } = inself;
          const w = t[0].length,
            h = t.length;
          inself.bounds = {
            TR: { x: x + w, y: y },
            TL: { x: x, y: y },
            BR: { x: x + w, y: y + h },
            BL: { x: x, y: y + h },
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
            this.height = height === 0 ? 1 : height;
            this.windowCount = windowCount;
            this.width = width;
            this.arr = null;
            this.x = this.y = 0;
            this.MAKE();
          }
          MAKE() {
            const windows = new Set();
            const RAND = self.RANDOM;
            const build = Array.from({ length: this.height }, () =>
              new Array(this.width + 2).fill(" ")
            );
            build[0].fill("‾");
            build.forEach((e) => (e[0] = e[e.length - 1] = "|"));
            let count = 0;
            while (windows.size < this.windowCount && count < 10) {
              const X = RAND(1, build[0].length - 2);
              const Y = RAND(1, build.length - 2);
              const key = `${X} ${Y}`;
              if (!windows.has(key)) {
                windows.add(key);
                build[Y][X] = "█";
              } else count++;
            }
            this.arr = build;
          }
        },
        async RENDER(ME) {
          return new Promise((resolve, reject) => {
            try {
              ME.ARR = ME.ARR.map((e) => e.map(() => " "));
              ME.QUEUE = ME.QUEUE.filter((e) => e.arr.OVER(ME.ARR, e.x, e.y));
              self.RENDERQUEUE = true;
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        },
        async ADD(ME, b) {
          return new Promise((resolve, reject) => {
            try {
              const last = ME.QUEUE.at(-1);
              b.x = last ? last.x + last.width + 2 : 0;
              b.y = ME.ARR.length - b.height;
              ME.QUEUE.push(b);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        },
        async MOVE(ME, dir) {
          return new Promise((resolve, reject) => {
            try {
              ME.QUEUE.forEach((e) => (e.x += dir));
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        },
        async CLOCK(dir, [wMin, wMax], [winMin, winMax]) {
          await this.ADD(
            this,
            new this.CLASS(
              self.RANDOM(3, this.ARR.length),
              self.RANDOM(wMin, wMax),
              self.RANDOM(winMin, winMax)
            )
          );
          await this.MOVE(this, dir);
          await this.RENDER(this);
        },
      }),
      (this.LANELOOKUP = {
        sets: null,
        list: null,
        laneOf: function (index) {
          return this.list.find((e) => e.index === index).set || null;
        },
        middle: function (lane) {
          const result = this.sets[lane];
          return result[Math.floor(result.length / 2) - 1];
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
          if (this.isColliding) return;
          this.isColliding = true;
          const sameLane = self.QUEUE.INLANE(this.y).filter((e) => !e.USER);
          if (sameLane.length > 0) {
            sameLane.PROPSORT("x");
            const first = sameLane[0];
            const fB = { BR: first.bounds.BR, BL: first.bounds.BL };
            const tB = { BR: this.bounds.BR, BL: this.bounds.BL };
            for (let p in fB) {
              const b = fB[p];
              if (b.y === tB.BR.y) {
                if (b.x <= tB.BR.x && b.x >= tB.BL.x) self.SCORE.lives--;
              }
            }
          }
          setTimeout(() => (this.isColliding = false), 10);
        }
      }),
      (this.KEYCONTROLS = KEYCONTROLS || ["ArrowUp", "ArrowDown"]),
      (this.KEYS = new Set()),
      (this.MINSPEED = Math.max(1, MINSPEED)),
      (this.MAXSPEED = Math.max(1, MAXSPEED)),
      (this.TYPETIME = Math.max(1, TYPETIME)),
      (this.MINRENDERSPEED = Math.max(1, MINRENDERSPEED)),
      (this.MAXRENDERSPEED = Math.max(1, MAXRENDERSPEED)),
      (this.GENSPEED = Math.max(1, GENSPEED)),
      (this.MAXLEVEL = null),
      (this.RENDERSPEED = 0),
      (this.USERPROPS = []),
      (this.ISRESET = false),
      (this.incr = null),
      (this.USERTMPLS = []),
      (this.SPEEDKEY = SPEEDKEY || "z"),
      (this.SCROLLKEYS = SCROLLKEYS || ["ArrowLeft", "ArrowRight"]),
      (this.SKIPKEY = SKIPKEY || "Tab"),
      (this.SPEEDINCR = Math.max(1, SPEEDINCR)),
      (this.SCORE = {
        _time: 0,
        _points: 0,
        _lives: LIVES,
        max: Math.min(0, MAXSCORE),
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
          if (this.points !== this.max) return;
          const { QUEUE, USER, ROAD, MOVESPEED: m } = self;
          clearInterval(self.TICK);
          QUEUE.ARR = [USER];
          ROAD.forEach((_, i) => {
            QUEUE.ADD(
              new self.TMPLS.truckDouble(ROAD[0].length, i - 1, m + m.sign())
            );
          });
          self.TICK = setInterval(async () => {
            let [truckCount, truckOverUSER] = [0, 0];
            await self.RENDER(self, false, false);
            QUEUE.ARR.forEach((e) => {
              if (e.bounds.TR.x < 0) truckCount++;
              if (e.x === self.USER.x && e !== self.USER) truckOverUSER++;
            });
            if (truckOverUSER === QUEUE.ARR.length - 1) {
              const index = QUEUE.ARR.indexOf(USER);
              QUEUE.ARR.splice(index, 1);
            }
            if (truckCount === QUEUE.ARR.length) {
              clearInterval(self.TICK);
              self.GAMEEND(self);
            }
          }, self.RENDERSPEED);
        },
        get points() {
          return this._points;
        },
        set lives(v) {
          const inself = this;
          const hold = inself.lives;
          inself._lives = v;
          let callback;
          if (inself._lives < 0) {
            clearInterval(self.TICK);
            throw new Error("Lives Error! Game Overacceleration!");
          }
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
                sameLane = sameLane.filter((e) => e.x <= this.x);
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
                    const fakeX = this.x;
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
    const { MAXLEVEL: MXL, LEVEL: LL, MINSPEED: MSPD, MAXSPEED: MXSPD } = self;
    const { MINRENDERSPEED: MRSPD, MAXRENDERSPEED: MXRSPD } = self;
    self.RENDERTO.insertAdjacentElement("beforebegin", self.SCORE.LOC);
    self.LEVEL = Math.min(MXL, LL);
    self.incr = Math.round((MSPD - MXSPD) / (MXL - 1));
    const renderIncr = Math.round((MRSPD - MXRSPD) / (MXL - 1));
    self.RENDERSPEED = MRSPD - renderIncr * self.LEVEL;
    self.PLAY(self);
  }
  async OPEN(self) {
    return new Promise(async (resolveTOP, rejectTOP) => {
      const { TYPETIME: time, SPEEDINCR: speedIncr, RENDERTO: RLOC } = self;
      const selectStep = 175;
      const h1 = document.createElement("h1");
      const h3 = document.createElement("h3");
      const selectionMenu = document.createElement("div");
      let mult = 1;
      let speedkey = false;
      const Time = () => time * mult;
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
                e.preventDefault();
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
        if (!hasCall)
          return {
            stop() {
              clearInterval(int);
              ref.textContent = save.join("");
            },
          };
        return new Promise(async (resolve, reject) => {
          let press = false;
          async function CTRLFC(e) {
            if (press) return;
            if (e.key === "Enter") {
              press = true;
              clearInterval(int);
              window.removeEventListener("keydown", CTRLFC);
              callBack ? await callBack() : reject("No provided function");
              resolve();
            } else if (e.key === cancelKey && cancelKey) {
              press = true;
              clearInterval(int);
              window.removeEventListener("keydown", CTRLFC);
              if (cancelCallback) await cancelCallback();
              resolve();
            }
          }
          window.addEventListener("keydown", CTRLFC);
        });
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
        if (!self.ISRESET) {
          const by = document.createElement("h2");
          const speedh3 = document.createElement("h3");
          RLOC.append(by), RLOC.append(speedh3);
          setTimeout(() => {
            speedh3.textContent = `- Press ${self.SPEEDKEY} to accelerate typing, and ${self.SKIPKEY} to skip -`;
          }, 350);
          await ">>> Car.TXT >>>".TYPE(h1), await "By Remy Serbinenko".TYPE(by);
          await self.WAIT(500);
          RLOC.append(h3);
          h3.textContent = "  Play";
          await h3.SELECT(selectStep, true, async () => {
            (h1.textContent = ""), (h3.textContent = "");
            speedh3.remove(), by.remove();
            await ">>> Select Difficulty >>>".TYPE(h1), await self.WAIT(500);
            h3.textContent = `- Use ${self.SCROLLKEYS[0]} and ${self.SCROLLKEYS[1]} to scroll, and Enter to select -`;
            await self.WAIT(500);
          });
        } else {
          await ">>> Select Difficulty >>>".TYPE(h1), await self.WAIT(500);
          h3.textContent = `- Use ${self.SCROLLKEYS[0]} and ${self.SCROLLKEYS[1]} to scroll. Press Enter to select. -`;
          await self.WAIT(500), (self.ISRESET = false);
        }
        const boxWidth =
          [...self.USERTMPLS].sort((a, b) => b[0].length - a[0].length)?.[0][0]
            .length + 4;
        const boxArr = new Array(Math.max(Math.round(boxWidth / 2), 9))
          .fill(null)
          .map(() => new Array(boxWidth * self.MAXLEVEL + 1).fill(" "));
        let [levelIncr, vehicleIncr, laneIncr] = [1, 0, 0];
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
              const [arrowL, arrowR] = v
                ? [[["-", "-", ">"]], [["<", "-", "-"]]]
                : [[[" ", " ", " "]], [[" ", " ", " "]]];
              arrowL.OVER(boxArr, fI - arrowL.length - 3, 2);
              arrowR.OVER(boxArr, lI + 2, 2);
              selectionMenu.innerHTML = boxArr.DOCPRINT(false);
            },
            get: function () {
              return this[e];
            },
          });
        });
        for (let i = 0; i < self.MAXLEVEL; i++) {
          boxArrRef[`${i + 1}Catalogue`] = {
            lives: 3,
            lanes: laneGen.next().value,
          };
        }
        for (let i = 0; i < boxArr.length; i++) {
          for (let q = 0; q < boxArr[i].length; q++) {
            const bool = q % Math.round(boxWidth / 2) === 0;
            if (q % boxWidth === 0) boxArr[i][q] = "|";
            else if (bool && i === 1) boxArr[i][q] = levelIncr++;
            if (bool && boxArr[i][q] !== "|") {
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
        RLOC.append(selectionMenu);
        selectionMenu.innerHTML = boxArr.DOCPRINT(false);
        boxArrRef["1"] = true;
        let activeI = 1;
        const confirm = document.createElement("h3");
        self.RENDERTO.append(confirm);
        const subH3 = document.createElement("h3");
        self.RENDERTO.append(subH3);
        function scrollLevels(e) {
          if (!self.SCROLLKEYS.includes(e.key)) return;
          boxArrRef[`${activeI}`] = false;
          if (e.key === self.SCROLLKEYS[0])
            activeI = activeI >= self.MAXLEVEL ? 1 : ++activeI;
          else if (e.key === self.SCROLLKEYS[1])
            activeI = activeI <= 1 ? self.MAXLEVEL : --activeI;
          boxArrRef[`${activeI}`] = true;
        }
        window.addEventListener("keydown", scrollLevels);
        await new Promise(async (resolveSelector, rejectSelector) => {
          try {
            async function CTRLFC(e) {
              if (e.key !== "Enter") return;
              window.removeEventListener("keydown", scrollLevels);
              window.removeEventListener("keydown", CTRLFC);
              self.LEVEL = activeI;
              self.LIVES = boxArrRef[`${activeI}Catalogue`].lives;
              self.LANES = boxArrRef[`${activeI}Catalogue`].lanes;
              self.SCORE._lives = self.LIVES;
              confirm.textContent = "  Confirm Selection? Press X to cancel.";
              await confirm.SELECT(
                selectStep,
                true,
                async function () {
                  window.removeEventListener("keydown", scrollLevels);
                  window.removeEventListener("keydown", CTRLFC);
                  confirm.textContent =
                    "  Confirm Selection? Press X to cancel.";
                  await `- Difficulty ${self.LEVEL} selected -`.TYPE(subH3);
                  await self.WAIT(200);
                  resolveSelector();
                },
                "x",
                async function () {
                  window.addEventListener("keydown", scrollLevels);
                  window.addEventListener("keydown", CTRLFC);
                  (subH3.textContent = ""), (confirm.textContent = "");
                }
              );
            }
            window.addEventListener("keydown", CTRLFC);
          } catch (error) {
            rejectSelector(error);
          }
        });
        const controls = document.createElement("h3");
        self.RENDERTO.append(controls);
        await `- Use ${self.KEYCONTROLS.join(
          " and "
        )} to move up and down -`.TYPE(controls);
        const play = document.createElement("h2");
        self.RENDERTO.append(play), (play.textContent = "  Play");
        await play.SELECT(selectStep, true, async () => {
          (self.RENDERTO.innerHTML = ""), resolveTOP();
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
    (self.QUEUE.ARR = []), (self.LANES = Math.max(3, self.LANES));
    self.ROAD = new Array(seg.length * self.LANES).fill(null).map(() => {
      const result = new Array(
        self.GAMEWIDTH - (self.GAMEWIDTH % seg[0].length)
      ).fill(" ");
      result.offset = 0;
      return result;
    });
    self.ROAD.forEach((e, i, a) => {
      const row = i % seg.length;
      const segment = Math.floor(i / seg.length) * seg.length;
      if (i % seg.length !== 0) return;
      let offset = (e.offset = -Math.round(Math.random() * row));
      while (offset < e.length) {
        seg.OVER(a, offset, segment);
        offset += seg[0].length;
      }
    });
    self.ROAD.SHIFT = function (dir) {
      this.forEach((e, i, a) => {
        const segment = Math.floor(i / seg.length) * seg.length;
        let offset;
        offset = e.offset + dir;
        offset = e.offset = offset % seg[0].length;
        while (offset < e.length) {
          seg.OVER(a, offset, segment);
          offset += seg[0].length;
        }
      });
    };
    self.BUILDINGS.ARR = new Array(8)
      .fill(null)
      .map(() => new Array(self.ROAD[0].length).fill(" "));
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
    self.USER = new self.USERCLASS(4, self.LANELOOKUP.middle(1), 0, true);
    self.QUEUE.ARR.push(self.USER);
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
        tickCounter++, (tickFlag = true);
      }
    }, self.RENDERSPEED);
  }
  GAMEEND(self) {
    clearInterval(self.TICK);
    setTimeout(async () => {
      let [i, shift] = [0, 0];
      let tempLength, outTemp;
      self.SCORE.LOC.textContent = "Game Over";
      self.TICK = new Promise((resolve, reject) => {
        try {
          const intervalID = setInterval(() => {
            const { BUILDINGS: BD, ROAD: R, GAMEWIDTH: GW } = self;
            let temp = [
              ...BD.ARR,
              ...R,
              ...new Array(BD.ARR.length - 3)
                .fill(null)
                .map(() => new Array(R[0].length).fill("░")),
            ];
            if (i <= temp.length || i > temp.length) {
              const fillChar = i > temp.length ? " " : "^";
              const condition = i > temp.length ? i - temp.length : i;
              if (i > temp.length) {
                temp = new Array(temp.length)
                  .fill(null)
                  .map(() => new Array(R[0].length).fill("^"));
              }
              for (let q = 0; q < condition; q++) {
                const arr = [new Array(GW).fill(fillChar)];
                arr.OVER(temp, 0, q);
              }
              if (i > temp.length && i >= temp.length * 2) {
                clearInterval(intervalID);
                outTemp = temp;
                resolve();
              }
            }
            temp.splice(0, 0, new Array(R[0].length).fill("‾"));
            temp.push(new Array(R[0].length).fill("‾"));
            tempLength = temp.length;
            self.RENDERTO.innerHTML = temp.DOCPRINT();
            i++, shift++;
          }, self.RENDERSPEED);
        } catch (error) {
          reject(error);
        }
      });
      await self.TICK;
      const endArr = [`Your Score: ${self.SCORE.points}`.split("")];
      const nextArr = ["Press Enter for Main Menu".split("")];
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
          self.SCORE._time = 0;
          self.QUEUE.ARR = [];
          self.SCORE._points = 0;
          self.LEVEL = self.LANES = self.LIVES = null;
          self.SCORE._lives = self.LIVES;
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
  RANDOM(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  RENDER(self, controlUser = false, checkBool) {
    return new Promise((resolve, reject) => {
      try {
        const r = self.ROAD;
        const b = self.BUILDINGS.ARR;
        if (!r || !b) reject();
        const tempROAD = Array.from({ length: r.length }, (_, i) => [...r[i]]);
        const temp = [
          ...b.map((e) => [...e]),
          ...tempROAD,
          ...new Array(b.length - 3)
            .fill(null)
            .map(() => new Array(r[0].length).fill("░")),
        ];
        if (controlUser) {
          const U = self.USER;
          U.y = Math.min(U.y, b.length + r.length - U.template.length);
          self.USER.y = Math.max(b.length - 1, self.USER.y);
          self.RENDERQUEUE = false;
        }
        self.QUEUE.RUN(temp, checkBool);
        temp.splice(0, 0, new Array(r[0].length).fill("‾"));
        temp.push(new Array(r[0].length).fill("‾"));
        self.RENDERTO.innerHTML = temp.DOCPRINT();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  WAIT(t = 4) {
    return new Promise((resolve) => setTimeout(resolve, t));
  }
}

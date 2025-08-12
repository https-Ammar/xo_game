"use strict";
const pauseSwitch = document.getElementById("pauseSwitch");
const lightSwitch = document.getElementById("lightSwitch");
const soundSwitch = document.getElementById("soundSwitch");
const resetBtn = document.getElementById("resetBtn");
const gameBox = document.querySelector(".gamebox");

const player1 = {
  name: "Player 1",
  mark: "X",
  color: "#FC6262",
  score: 0,
  usedBucket: [],
  confettiObject: {
    angle: 50,
    particleCount: 5100,
    spread: 100,
    origin: { y: 1, x: 0 },
  },
  htmlElements: {
    self: document.querySelector("#player1"),
    avater: document.querySelector("#player1 .player__avater"),
    mark: document.querySelector("#player1 .player__mark"),
    name: document.querySelector("#player1 .player__name"),
    score: document.querySelector("#player1 .player__score"),
    editor: {
      nameInput: document.querySelector("#p1-menu input[name='name']"),
      avaterPreview: document.querySelector("#p1-menu .avater img"),
      avatersGallary: document.querySelector("#gallary1"),
      colorOptions: document.querySelector("#p1-menu fieldset"),
      applyBtn: document.querySelector("#p1-menu .applyBtn"),
    },
  },
};

const player2 = {
  name: "Player 2",
  mark: "O",
  color: "#396AEB",
  score: 0,
  usedBucket: [],
  confettiObject: {
    angle: 130,
    particleCount: 100,
    spread: 100,
    origin: { y: 1, x: 1 },
  },
  htmlElements: {
    self: document.querySelector("#player2"),
    avater: document.querySelector("#player2 .player__avater"),
    mark: document.querySelector("#player2 .player__mark"),
    name: document.querySelector("#player2 .player__name"),
    score: document.querySelector("#player2 .player__score"),
    editor: {
      nameInput: document.querySelector("#p2-menu input[name='name']"),
      avaterPreview: document.querySelector("#p2-menu .avater img"),
      avatersGallary: document.querySelector("#gallary2"),
      colorOptions: document.querySelector("#p2-menu fieldset"),
      applyBtn: document.querySelector("#p2-menu .applyBtn"),
    },
  },
};

const Game = {
  activePlayer: null,
  muted: false,
  paused: true,
  roundNumber: 0,
  maxWins: 3,
  winOptions: new Set(["123", "456", "789", "147", "258", "369", "159", "357"]),
  soundEffects: {
    click: new Audio("/assets/audios/click.mp3"),
    uiClick: new Audio("/assets/audios/pause.wav"),
    switch: new Audio("/assets/audios/switch.wav"),
    reset: new Audio("/assets/audios/reset.mp3"),
    unmute: new Audio("/assets/audios/unmute.wav"),
    popupShow: new Audio("/assets/audios/popup.wav"),
    tap: new Audio("/assets/audios/tap.wav"),
    win: new Audio("/assets/audios/win.wav"),
  },
  players: { player1, player2 },

  playSound(soundName) {
    if (!this.muted && this.soundEffects[soundName]) {
      this.soundEffects[soundName].cloneNode().play();
    }
  },

  enterFocusMode() {
    Game.paused = false;
    if (!this.activePlayer)
      this.activePlayer = [player1, player2][Game.roundNumber % 2];
    this.activePlayer.htmlElements.self.classList.add("player--active");
    document.querySelector("button[popovertarget='p1-menu']").disabled = true;
    document.querySelector("button[popovertarget='p2-menu']").disabled = true;
    resetBtn.disabled = true;
  },

  leaveFocusMode() {
    Game.paused = true;
    this.activePlayer.htmlElements.self.classList.remove("player--active");
    document.querySelector("button[popovertarget='p1-menu']").disabled = false;
    document.querySelector("button[popovertarget='p2-menu']").disabled = false;
    resetBtn.disabled = false;
  },

  swapActivePlayer() {
    this.activePlayer.htmlElements.self.classList.remove("player--active");
    if (this.activePlayer === player1) {
      this.activePlayer = player2;
    } else if (this.activePlayer === player2) {
      this.activePlayer = player1;
    }
    this.activePlayer.htmlElements.self.classList.add("player--active");
    this.markNextMoveBucket();
  },

  getBucketElement(id) {
    if (id < 1 || id > 9) return null;
    return document.getElementById(`bucket${id}`);
  },

  fillBucket(bucketElement) {
    let fillColor = this.activePlayer === player1 ? "--p1-brand" : "--p2-brand";
    bucketElement.innerHTML = `
    <span class="bucket__value" style="--fill-color:var(${fillColor})">
      ${this.activePlayer.mark}
    </span>`;
  },

  moveBucketValue(fromBucket, toBucket) {
    toBucket.append(fromBucket.querySelector(".bucket__value"));
  },

  markNextMoveBucket() {
    if (this.activePlayer.usedBucket.length < 3) return;
    let targetBucket = this.getBucketElement(this.activePlayer.usedBucket[0]);
    let oldTarget = document.querySelector(".next-move");
    oldTarget?.classList.remove("next-move");
    targetBucket?.classList.add("next-move");
  },

  showConfetti() {
    confetti(this.activePlayer.confettiObject);
  },

  editWinnerScore() {
    let newScore = ++this.activePlayer.score;
    this.activePlayer.htmlElements.score.textContent = newScore;
  },

  endRound() {
    pauseSwitch.click();
    this.editWinnerScore();
    this.playSound("win");
    this.showConfetti();

    if (this.activePlayer.score >= this.maxWins) {
      this.endGame();
    } else {
      this.clearGameBox();
      this.roundNumber++;
      this.activePlayer = null;
      updateLocalStorage();
    }
  },

  endGame() {
    document.querySelector("dialog").showModal();
    document.querySelector(
      ".winner-name"
    ).textContent = `${this.activePlayer.name} wins the game!`;

    setTimeout(() => {
      document.querySelector("dialog").close();
      this.reset();
    }, 5000);
  },

  async clearGameBox() {
    document.querySelector("dialog").showModal();
    await new Promise((r) => {
      document.querySelector(".winner-name").textContent =
        Game.activePlayer.name;
      setTimeout(r, 3000);
    });
    document.querySelector("dialog").close();

    for (let bucket of document.getElementsByClassName("bucket")) {
      bucket.innerHTML = "";
    }

    player1.usedBucket = [];
    player2.usedBucket = [];
    document.querySelector(".next-move")?.classList.remove("next-move");
  },

  reset() {
    player1.score = player2.score = this.roundNumber = 0;
    player1.htmlElements.score.textContent =
      player2.htmlElements.score.textContent = "0";

    for (let bucket of document.getElementsByClassName("bucket")) {
      bucket.innerHTML = "";
    }

    player1.usedBucket = [];
    player2.usedBucket = [];
    document.querySelector(".next-move")?.classList.remove("next-move");
    updateLocalStorage();
  },

  initializePlayer(player) {
    let storageKey = player === player1 ? "p1" : "p2";
    const data = JSON.parse(localStorage.getItem(storageKey));

    if (data) {
      player.name = data.name;
      player.color = data.color;
      player.score = data.score;

      player.htmlElements.name.innerHTML = data.name;
      player.htmlElements.score.innerHTML = data.score;
      player.htmlElements.editor.nameInput.value = data.name;

      player.htmlElements.avater.src = data.avaterSrc;
      player.htmlElements.editor.avaterPreview.src = data.avaterSrc;

      let oldAvater = player.htmlElements.editor.avatersGallary.querySelector(
        ".gallary__item--selected"
      );
      oldAvater.classList.remove("gallary__item--selected");
      oldAvater.removeAttribute("aria-selected");

      let newAvater =
        player.htmlElements.self.querySelectorAll(".gallary__item")[
          +data.avaterSrc.match(/\d+/)[0] - 1
        ];
      newAvater.classList.add("gallary__item--selected");
      oldAvater.setAttribute("aria-selected", "true");

      document.body.style.setProperty(data.cssColorVarName, data.color);
      let oldColor =
        player.htmlElements.editor.colorOptions.querySelector("input[checked]");
      oldColor.removeAttribute("checked");
      oldColor.removeAttribute("aria-checked");

      let newColor = player.htmlElements.editor.colorOptions.querySelector(
        `input[style='--brand:${data.color}']`
      );
      newColor.setAttribute("checked", "true");
      newColor.setAttribute("aria-checked", "true");
    }
  },
};

let p1 = initialize();
let p2 = new Promise((r) => (window.onload = () => r("loading done")));
let p3 = new Promise((r) => setTimeout(r, 2000));

document.querySelector("#loadingScreen").showModal();

Promise.allSettled([p1, p2, p3]).then((v) => {
  document.querySelector(".page-content").hidden = false;
  document.querySelector("#loadingScreen").close();
});

pauseSwitch.whenTurnOn = function (event) {
  pauseSwitch.setAttribute("aria-label", "Pause");
  Game.enterFocusMode();
  Game.playSound("uiClick");
};

pauseSwitch.whenTurnOff = function (event) {
  pauseSwitch.setAttribute("aria-label", "Start");
  Game.leaveFocusMode();
  Game.playSound("uiClick");
};

lightSwitch.whenTurnOn = function (event) {
  lightSwitch.setAttribute("aria-label", "Turn off lights");
  changeThemeTo("light");
  Game.playSound("switch");
};

lightSwitch.whenTurnOff = function (event) {
  lightSwitch.setAttribute("aria-label", "Turn on lights");
  changeThemeTo("dark");
  Game.playSound("switch");
};

soundSwitch.whenTurnOn = function (event) {
  soundSwitch.setAttribute("aria-label", "Mute");
  Game.muted = false;
  Game.playSound("unmute");
};

soundSwitch.whenTurnOff = function (event) {
  soundSwitch.setAttribute("aria-label", "Unmute");
  Game.playSound("click");
  Game.muted = true;
};

resetBtn.addEventListener("click", (e) => {
  Game.playSound("reset");
  Game.reset();
});

addHandlers({
  targets: [
    player1.htmlElements.editor.avatersGallary,
    player2.htmlElements.editor.avatersGallary,
  ],
  events: ["click", "keypress"],
  callbacks: [changeSelectedAvater],
});

addHandlers({
  targets: [
    player1.htmlElements.editor.colorOptions,
    player2.htmlElements.editor.colorOptions,
  ],
  events: ["click"],
  callbacks: [changeSelectedColor],
});

addHandlers({
  targets: [
    player1.htmlElements.editor.applyBtn,
    player2.htmlElements.editor.applyBtn,
  ],
  events: ["click"],
  callbacks: [updatePlayerInfo, updateLocalStorage],
});

addHandlers({
  targets: document.querySelectorAll("[popover]"),
  events: ["toggle"],
  callbacks: [
    (e) => {
      if (e.newState === "open") Game.playSound("popupShow");
    },
  ],
});

gameBox.addEventListener("click", function (e) {
  let selectedBuckedt = e.target.closest(".bucket");

  if (
    !Game.paused &&
    Game.activePlayer &&
    selectedBuckedt &&
    selectedBuckedt.childElementCount <= 0
  ) {
    if (Game.activePlayer.usedBucket.length < 3) {
      Game.fillBucket(selectedBuckedt);
    } else {
      Game.moveBucketValue(
        Game.getBucketElement(Game.activePlayer.usedBucket.shift()),
        selectedBuckedt
      );
    }
    Game.activePlayer.usedBucket.push(selectedBuckedt.id.slice(-1));

    let isWin = Game.winOptions.has(
      Game.activePlayer.usedBucket.slice().sort().join("")
    );

    if (isWin) {
      Game.endRound();
    } else {
      Game.swapActivePlayer();
    }

    Game.playSound("tap");
  }
});

async function initialize() {
  initializePageTheme();
  Game.initializePlayer(player1);
  Game.initializePlayer(player2);
  return "initialize done";
}

function changeThemeTo(theme) {
  localStorage.setItem("theme", theme);

  if (theme === "dark") {
    document.body.classList.remove("light-mode");
  } else if (theme === "light") {
    document.body.classList.add("light-mode");
  }
}

function initializePageTheme() {
  if (!localStorage.getItem("theme")) {
    let userPreferDark = window.matchMedia(
      "(prefers-color-scheme:dark)"
    ).matches;

    if (userPreferDark) {
      changeThemeTo("dark");
    } else {
      changeThemeTo("light");
    }
  } else {
    let storedThemeValue = localStorage.getItem("theme");

    changeThemeTo(storedThemeValue);

    if (storedThemeValue === "dark") {
      lightSwitch.switchTo("off");
      lightSwitch.setAttribute("aria-label", "Turn on lights");
    } else {
      lightSwitch.switchTo("on");
      lightSwitch.setAttribute("aria-label", "Turn off lights");
    }
  }
}

function addHandlers({ targets, events, callbacks }) {
  try {
    for (let target of targets) {
      for (let event of events) {
        for (let callback of callbacks) {
          target.addEventListener(event, callback);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function changeSelectedAvater(event) {
  let newSelectedOption = event.target.closest("li");
  let oldSelectedOption = event.currentTarget.querySelector(
    ".gallary__item--selected"
  );
  let targetPlayer = event.target.closest(".player").id;

  if (newSelectedOption === null || newSelectedOption === oldSelectedOption)
    return;
  if (
    event.type === "keypress" &&
    event.code !== "Space" &&
    event.code !== "Enter"
  )
    return;

  oldSelectedOption.classList.remove("gallary__item--selected");
  oldSelectedOption.removeAttribute("aria-selected");

  newSelectedOption.classList.add("gallary__item--selected");
  newSelectedOption.setAttribute("aria-selected", "true");

  Game.playSound("click");
  updateAvaterPreview(targetPlayer, newSelectedOption.querySelector("img").src);
}

function updateAvaterPreview(targetPlayerId, newSrc) {
  Game.players[targetPlayerId].htmlElements.editor.avaterPreview.src = newSrc;
}

function changeSelectedColor(event) {
  let newSelectedOption = event.target.closest("input");
  let oldSelectedOption = event.currentTarget.querySelector("input[checked]");

  if (newSelectedOption === null || newSelectedOption === oldSelectedOption)
    return;

  oldSelectedOption.removeAttribute("checked");
  oldSelectedOption.removeAttribute("aria-checked");

  newSelectedOption.setAttribute("checked", "");
  newSelectedOption.setAttribute("aria-checked", "true");

  Game.playSound("click");
}

function updatePlayerInfo(event) {
  const id = event.target.closest(".player").id;
  const targetPlayer = Game.players[id];

  if (targetPlayer) {
    const newValues = {
      name: targetPlayer.htmlElements.editor.nameInput.value || id,
      color: targetPlayer.htmlElements.editor.colorOptions
        .querySelector("[checked]")
        .computedStyleMap()
        .get("--brand")[0],
      avaterSrc: new URL(targetPlayer.htmlElements.editor.avaterPreview.src)
        .pathname,
    };

    targetPlayer.name = targetPlayer.htmlElements.name.textContent =
      newValues.name;
    targetPlayer.htmlElements.avater.src = newValues.avaterSrc;
    targetPlayer.color = newValues.color;
    document.body.style.setProperty(
      { player1: `--p1-brand`, player2: `--p2-brand` }[id],
      newValues.color
    );
  }
  Game.playSound("click");
}

function updateLocalStorage() {
  const gameData = {
    roundNumber: Game.roundNumber,
    muted: Game.muted,
  };

  const p1Data = {
    name: player1.name,
    color: player1.color,
    score: player1.score,
    avaterSrc: new URL(player1.htmlElements.avater.src).pathname,
    cssColorVarName: "--p1-brand",
  };

  const p2Data = {
    name: player2.name,
    color: player2.color,
    score: player2.score,
    avaterSrc: new URL(player2.htmlElements.avater.src).pathname,
    cssColorVarName: "--p2-brand",
  };

  localStorage.setItem("game", JSON.stringify(gameData));
  localStorage.setItem("p1", JSON.stringify(p1Data));
  localStorage.setItem("p2", JSON.stringify(p2Data));
}

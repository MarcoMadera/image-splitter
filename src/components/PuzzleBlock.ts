import { ToastTypes } from "types/toast";
import { Direction, isInEnum } from "utils";
import { convertStringToNumber } from "utils/convertStringToNumber";

interface Coordinate {
  col: number;
  row: number;
}

function getBoard(size: number) {
  let tiles = [];
  for (let i = 0; i < size; i++) {
    const set = [];
    for (let j = 0; j < size; j++) {
      set.push(i + j + 1);
    }
    tiles.push(set);
  }
  return tiles;
}

export class PuzzleBlock extends HTMLElement {
  shadow: ShadowRoot;
  image: string;
  playing: boolean;
  paused: boolean;
  time: number;
  timer: NodeJS.Timeout | null;
  moveCount: number;
  showTime: boolean;
  pauseButtonIcon: string;
  resumeButtonIcon: string;
  board: number[][];
  originalPos: Coordinate[];
  boardSize: number;

  constructor(image: string, size: number = 4) {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.image = image;
    this.playing = false;
    this.paused = false;
    this.time = 0;
    this.timer = null;
    this.moveCount = 0;
    this.showTime = true;
    this.pauseButtonIcon = "fa fa-pause-circle-o";
    this.resumeButtonIcon = "fa fa-play-circle-o";
    this.boardSize = size;
    this.board = getBoard(size);
    this.originalPos = [];
  }
  $ = (selector: string) => this.shadow.querySelector(selector);
  $$ = (selector: string) => this.shadow.querySelectorAll(selector);
  controller = new AbortController();

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.controller.abort();
    this.playing = false;
    this.paused = false;
    this.time = 0;
    this.timer = null;
    this.moveCount = 0;
    this.showTime = true;
    this.originalPos = [];
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "data-image" && oldValue !== newValue) {
      this.updateImage(newValue);
    }

    if (name === "data-size" && oldValue !== newValue) {
      this.updateSize(newValue);
    }
  }

  static get observedAttributes() {
    return ["data-image", "data-size"];
  }

  addContainer() {
    const container = document.createElement("div");
    container.id = "container";

    const playboxEl = document.createElement("div");
    playboxEl.id = "playbox";
    container.appendChild(playboxEl);

    this.shadow.appendChild(container);
    const style = document.createElement("style");

    style.textContent = `
    #container {
      background-color: var(--card-bg);
      border: 8px solid var(--card-bg);
      border-radius: 5px;
      box-shadow: 0 0 4px 4px #0000001f;
      box-sizing: content-box;
      width: fit-content;
      --board-width: 800px;
      --piece-size: calc(var(--board-width) / ${this.boardSize});
      --background-size-side: calc(var(--board-width) + var(--piece-size));
      background-color: var(--enter-btn-bg);
      background-size: var(--piece-size) var(--piece-size);
      background-position: -4px -4px;
      box-sizing: border-box;
    }

    .row {
      width: var(--board-width);
    }
    .piece {
      width: var(--piece-size);
      height: var(--piece-size);
      filter: grayscale(20%);
      background-size: var(--background-size-side) var(--background-size-side);
      transition:
        all ease-in-out 0.3s,
        outline 0s;
      cursor: pointer;
      position: absolute;
      border-radius: 5px;
    }
    .shutter {
      position: absolute;
      display: none;
      top: 0;
      left: 0;
      z-index: 1;
      padding-top: 45%;
      background-color: rgba(255, 255, 255, 0.7);
      width: 100%;
    }
    .off {
      display: block;
    }
    #playbox {
      position: relative;
      cursor: pointer;
      padding-bottom: 100%;
    }
    .outlined {
      outline: 4px solid var(--card-bg);
      outline-offset: -2px;
      
    }
    .shine {
      filter: brightness(110%);
    }
    .number {
      font-family: "Open Sans";
      font-weight: bold;
      -webkit-text-stroke-width: 1px;
      -webkit-text-stroke-color: rgba(0, 0, 0, 0.2);
      color: rgba(255, 255, 255, 0.7);
      position: absolute;
      left: 0;
      transition: all ease-in-out 0.1s;
    }

    @media screen and (max-width: 768px) {
      .number {
        font-size: 10vw;
        padding-top: 1vw;
      }
    }

    @media screen and (min-width: 768px) {
      .number {
        font-size: 4vw;
        padding-top: 1vh;
      }
    }
    .fade {
      opacity: 0;
    }
    `;

    this.shadow.appendChild(style);
  }

  startNewGame() {
    this.playing = true;
    this.hideShutter();
    this.time = 0;
    this.scramble();
    if (this.showTime) {
      this.updateTimer(0, 0);
      this.startTimer();
    }
    this.moveCount = 0;
  }

  startTimer() {
    this.addOutline();
    this.timer = setInterval(() => {
      this.time++;
      const minute = Math.floor(this.time / 60);
      const second = this.time % 60;
      this.updateTimer(minute, second);
    }, 1000);
  }

  updateTimer(minute: number, second: number) {
    const timer = this.$("#timer");
    if (timer?.children[1]) {
      timer.children[1].innerHTML = this.pad(minute) + ":" + this.pad(second);
    }
  }

  updateMove() {
    const move = this.$("#move");
    if (!move) return;
    const secondElement = move.children[1];
    if (!secondElement) return;
    const moveCountString = this.moveCount.toString();
    secondElement.innerHTML = moveCountString;
  }

  pauseTimer() {
    if (!this.timer) return;
    clearInterval(this.timer);
  }

  clearTimer() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.updateTimer(0, 0);
    this.time = 0;
  }

  pad(n: number) {
    return n < 10 ? "0" + n : n;
  }

  wonGame() {
    this.winEffect();
    setTimeout(() => {
      this.playing = false;
      this.paused = false;
      if (this.timer) {
        clearInterval(this.timer);
      }
      window.toast({ message: "You won!", type: ToastTypes.SUCCESS });
    }, 500);

    setTimeout(() => {
      const startButton = document.querySelector(
        "#puzzle-block-start",
      ) as HTMLButtonElement;
      if (!startButton) return;
      this.changeLabel("puzzle-block-start", "Restart");
      startButton.disabled = false;
    }, 1500);
  }

  initiate() {
    this.addEventListeners();
    this.preparatoryPosition();
    const playbox = this.$("#playbox");
    if (!playbox) {
      window.toast({
        message: "Playbox is not available initiazing the game",
        type: ToastTypes.ERROR,
      });
      return;
    }
    playbox.innerHTML = "";
    this.drawNewGame();
  }

  drawNewGame() {
    const playbox = this.$("#playbox");
    this.drawShutter("Start");
    if (!playbox) return;
    if (!this.board) return;

    for (let i = 0; i < this.boardSize; i++) {
      const row = document.createElement("div");
      row.classList.add("row", "mx-0");
      playbox.appendChild(row);
      for (let j = 0; j < this.boardSize; j++) {
        const boardRow = this.board[i];
        if (boardRow === undefined) break;
        boardRow[j] = i * this.boardSize + (j + 1);
        this.drawPiece(row, i, j, i, j);
      }
    }

    this.repaint();
    this.addPiecesClickEvent();
  }

  drawPiece(
    row: HTMLElement,
    rowNum: number,
    colNum: number,
    rowPos: number,
    colPos: number,
  ) {
    const number = rowNum * this.boardSize + (colNum + 1);
    if (number !== this.boardSize * this.boardSize) {
      const piece = document.createElement("div");
      const pieceNum = "piece" + number;
      piece.classList.add("w-25", "piece", "outlined");
      piece.id = pieceNum;
      piece.style.top = rowPos * (100 / this.boardSize) + "%";
      piece.style.left = colPos * (100 / this.boardSize) + "%";
      piece.style.backgroundPosition =
        colNum * (100 / this.boardSize) +
        "% " +
        rowNum * (100 / this.boardSize) +
        "%";
      row.appendChild(piece);
      this.addNumber(number, piece);
    }
  }

  repaint() {
    const pieces = this.$$(".piece");

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (i * this.boardSize + j !== this.boardSize * this.boardSize - 1) {
          const piece = pieces[i * this.boardSize + j];
          if (piece) {
            this.paintPiece(piece as HTMLElement, i, j);
          }
        }
      }
    }
  }

  paintPiece(piece: HTMLElement, x: number, y: number) {
    const number = x * this.boardSize + y;
    setTimeout(() => {
      piece.style.backgroundImage = `url(${this.image})`;
    }, 40 * number);
  }

  drawShutter(message: string) {
    const playbox = this.$("#playbox");
    if (!playbox) return;
    const startButton = document.querySelector(
      "#puzzle-block-start",
    ) as HTMLButtonElement;
    if (!startButton) {
      window.toast({ message: "something went wrong", type: ToastTypes.ERROR });
      return;
    }
    startButton.addEventListener("click", this.handleShutterClick.bind(this), {
      signal: this.controller.signal,
    });
    startButton.innerHTML = message;
    startButton.disabled = false;
  }

  hideShutter() {
    const startButton = document.querySelector(
      "#puzzle-block-start",
    ) as HTMLButtonElement;

    if (!startButton) {
      window.toast({ message: "something went wrong", type: ToastTypes.ERROR });
      return;
    }

    startButton.disabled = true;
  }

  changeLabel(button: string, message: string, icon?: string) {
    const btn = document.querySelector(`#${button}`);
    if (!btn) return;
    const iconElement = icon ? `<span class='${icon} ml-2'></span>` : "";
    btn.innerHTML = `<small>${message}</small>${iconElement}`;
  }

  winEffect() {
    this.$$(".piece").forEach((piece) => {
      piece.classList.remove("outlined");
      piece.classList.add("shine");
      setTimeout(() => {
        piece.classList.remove("shine");
      }, 500);
    });
  }

  addOutline() {
    this.$$(".piece").forEach((piece) => {
      piece.classList.add("outlined");
    });
  }

  preparatoryPosition() {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        this.originalPos.push({ row: i, col: j });
      }
    }
  }

  addNumber(id: number, piece: HTMLElement) {
    const number = document.createElement("div");
    number.classList.add(
      "number",
      "w-100",
      "h-100",
      "d-inline-block",
      "align-middle",
    );
    number.innerHTML = id.toString();
    piece.appendChild(number);
  }

  move(direction: Direction, playerMove: boolean): number {
    let temp = -1;
    const emptyPos = this.whereIsId(this.boardSize * this.boardSize);
    if (!emptyPos) {
      console.warn("No empty pos while trying to move", emptyPos);
      return 0;
    }
    const row = emptyPos.row;
    const col = emptyPos.col;

    const createMove = (vertical = 0, horizontal = 0) => {
      const moveRow = row + vertical;
      const moveCol = col + horizontal;
      const boardMoveRow = this.board[moveRow];
      const boardMove = boardMoveRow?.[moveCol];
      if (boardMove !== undefined) {
        temp = boardMove;
      }
      const boardRow = this.board[moveRow];
      if (boardRow !== undefined) {
        boardRow[moveCol] = this.boardSize * this.boardSize;
      }
    };

    const move: Record<Direction, { rule: boolean; action: () => void }> = {
      [Direction.LEFT]: { rule: col > 0, action: () => createMove(0, -1) },
      [Direction.UP]: { rule: row > 0, action: () => createMove(-1, 0) },
      [Direction.RIGHT]: {
        rule: col < this.boardSize - 1,
        action: () => createMove(0, 1),
      },
      [Direction.DOWN]: {
        rule: row < this.boardSize - 1,
        action: () => createMove(1, 0),
      },
    };

    function handleMove(direction: Direction) {
      const movement = move[direction];
      if (movement.rule) {
        movement.action();
      } else if (playerMove) {
        window.toast({ message: "Invalid Move", type: ToastTypes.WARNING });
      }
    }

    handleMove(direction);

    if (temp === -1) {
      return 0;
    }

    const boardRow = this.board[row];
    if (boardRow) {
      boardRow[col] = temp;
    }
    const mover = this.$(`#piece${temp}`) as HTMLElement | null;
    if (mover) {
      this.moveTranslate(mover, row, col);
    }
    if (playerMove) {
      this.moveCount++;
      this.updateMove();
    }
    if (playerMove && this.win()) {
      this.wonGame();
    }
    return 1;
  }

  moveTranslate(mover: HTMLElement, moveRow: number, moveCol: number) {
    if (!mover) {
      console.warn("No mover found:", mover);
      return;
    }
    mover.style.left = `${moveCol * (100 / this.boardSize)}%`;
    mover.style.top = `${moveRow * (100 / this.boardSize)}%`;
  }

  moveMouse(piece: HTMLElement) {
    const id = parseInt(piece.id.replace("piece", ""));
    const coord = this.whereIsId(id);
    if (!coord) {
      console.warn("coord is undefined", coord);
      return;
    }
    const row = coord.row;
    const col = coord.col;
    const coordEmpty = this.whereIsId(this.boardSize * this.boardSize);
    const rowEmpty = coordEmpty.row;
    const colEmpty = coordEmpty.col;
    const direction = this.relativePosition(coord, coordEmpty);

    const repeat = {
      [Direction.LEFT]: () =>
        this.moveRepeatedly(Direction.LEFT, colEmpty - col),
      [Direction.RIGHT]: () =>
        this.moveRepeatedly(Direction.RIGHT, col - colEmpty),
      [Direction.UP]: () => this.moveRepeatedly(Direction.UP, rowEmpty - row),
      [Direction.DOWN]: () =>
        this.moveRepeatedly(Direction.DOWN, row - rowEmpty),
    };

    if (direction) {
      repeat[direction]();
    }
  }

  relativePosition(
    coord: Coordinate,
    coordEmpty: Coordinate,
  ): Direction | null {
    if (coordEmpty.row === coord.row) {
      return coord.col < coordEmpty.col ? Direction.LEFT : Direction.RIGHT;
    }
    if (coordEmpty.col === coord.col) {
      return coord.row < coordEmpty.row ? Direction.UP : Direction.DOWN;
    }
    return null;
  }

  moveRepeatedly(direction: Direction, times: number) {
    for (let i = 0; i < times; i++) {
      this.move(direction, true);
    }
  }

  whereIsId(id: number) {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const boardRow = this.board[i];
        if (boardRow) {
          const boardPosition = boardRow[j];
          if (boardPosition === id) {
            return { row: i, col: j };
          }
        }
      }
    }

    return { row: -1, col: -1 };
  }

  scramble() {
    let direction: Direction = Direction.LEFT;
    let timesMoved = 0;
    while (timesMoved < 120 * this.boardSize) {
      const directions = Object.values(Direction);
      const randomIndex = Math.floor(Math.random() * directions.length);
      const randomDirection = directions[randomIndex];
      if (randomDirection) {
        direction = randomDirection;
      }
      timesMoved += this.move(direction, false);
    }
  }

  win() {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const boardRow = this.board[i];
        if (boardRow) {
          const value = boardRow[j];
          if (i * this.boardSize + j + 1 !== value) {
            return false;
          }
        }
      }
    }
    return true;
  }

  handleKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    if (this.playing && !this.paused && isInEnum(e.key, Direction)) {
      this.move(e.key, true);
    }
  }

  handleTimerClick() {
    this.showTime = !this.showTime;
    if (!this.showTime) {
      this.clearTimer();
    } else {
      this.updateTimer(0, 0);
      if (this.playing && !this.paused) {
        this.startTimer();
      }
    }
  }

  handlePauseClick() {
    if (this.playing) {
      this.paused = !this.paused;
      if (this.paused) {
        this.pauseTimer();
        this.changeLabel("pause", "Resume", this.resumeButtonIcon);
      } else {
        if (this.showTime) {
          this.startTimer();
        }
        this.hideShutter();
        this.changeLabel("pause", "Pause", this.pauseButtonIcon);
      }
    }
  }

  handleToggleNumberClick() {
    this.$$(".number").forEach((number) => {
      number.classList.toggle("fade");
    });
  }

  handleShutterClick() {
    if (!this.playing) {
      this.startNewGame();
    } else {
      if (this.showTime) {
        this.startTimer();
      }
      this.hideShutter();
      this.changeLabel("pause", "Pause", this.pauseButtonIcon);
    }
  }

  addPiecesClickEvent() {
    this.$$(".piece").forEach((piece) => {
      piece.addEventListener(
        "click",
        () => {
          if (this.playing && !this.paused) {
            this.moveMouse(piece as HTMLElement);
          }
        },
        { signal: this.controller.signal },
      );
    });
  }

  handleRestartClick() {
    this.playing = false;
    this.paused = false;
    this.changeLabel("pause", "Pause", this.pauseButtonIcon);
    if (this.showTime) {
      this.updateTimer(0, 0);
    }
    this.moveCount = 0;
    this.updateMove();
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.initiate();
  }

  addEventListeners() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this), {
      signal: this.controller.signal,
    });
    this.$("#timer")?.addEventListener(
      "click",
      this.handleTimerClick.bind(this),
      { signal: this.controller.signal },
    );
    this.$("#pause")?.addEventListener(
      "click",
      this.handlePauseClick.bind(this),
      { signal: this.controller.signal },
    );
    this.$("#restart")?.addEventListener(
      "click",
      this.handleRestartClick.bind(this),
      { signal: this.controller.signal },
    );
    this.$("#toggleNumber")?.addEventListener(
      "click",
      this.handleToggleNumberClick.bind(this),
      { signal: this.controller.signal },
    );
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeyDown);
    const startButton = document.querySelector(
      "#puzzle-block-start",
    ) as HTMLButtonElement;
    startButton.removeEventListener(
      "click",
      this.handleShutterClick.bind(this),
    );

    this.$("#timer")?.removeEventListener(
      "click",
      this.handleTimerClick.bind(this),
    );
    this.$("#pause")?.removeEventListener(
      "click",
      this.handlePauseClick.bind(this),
    );
    this.$("#restart")?.removeEventListener(
      "click",
      this.handleRestartClick.bind(this),
    );
    this.$("#toggleNumber")?.removeEventListener(
      "click",
      this.handleToggleNumberClick.bind(this),
    );
    this.$("#shutter")?.removeEventListener(
      "click",
      this.handleShutterClick.bind(this),
    );
  }

  render() {
    const imageUrl = this.getAttribute("data-image");
    const size = this.getAttribute("data-size");

    if (imageUrl) {
      this.updateImage(imageUrl);
    }
    if (size) {
      this.updateSize(size);
    }
    this.addContainer();
    this.initiate();
  }

  updateImage(imageUrl: string) {
    this.image = imageUrl;
  }

  updateSize(size: string) {
    const convertedNumber = convertStringToNumber(size);
    if (convertedNumber) {
      this.boardSize = convertedNumber;
      this.board = getBoard(convertedNumber);
    }
  }
}

customElements.define("puzzle-block", PuzzleBlock);

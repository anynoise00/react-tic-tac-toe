import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOARD_SIZE = 3;

function Square(props) {
  return (
    <button
      className = {"square " + (props.highlight ? "square-highlight" : null)}
      onClick = {props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value = {this.props.squares[i]}
        onClick = {() => this.props.onClick(i)}
        highlight = {this.props.highlightedSquares.includes(i)}
        key = {"square-" + i}
      />
    );
  }

  render() {
    const rows = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      let squares = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        const index = i * BOARD_SIZE + j;
        squares.push(this.renderSquare(index));
      }
      
      const r = React.createElement("div", {
        className: "board-row",
        key: "board-row-" + i,
      }, squares);

      rows.push(r);
    }
    
    const board = React.createElement("div", null, rows);
    
    return board;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
        play: null,
      }],
      stepNumber: 0,
      xIsNext: true,

      sortAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{
        squares: squares,
        play: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const desc = move ?
        "Go to move #" + move :
        "Go to game start";

      const play = step.play !== null ? (() => {
        const play = step.play;

        const currentRow = Math.floor(play / BOARD_SIZE);
        const currentCol = play - (currentRow * BOARD_SIZE);

        return ("(Col: " + (currentCol + 1) + ", Row: " + (currentRow + 1) + ")");
      })() : "";

      let item = (
        <li key = {"move-" + move}>
          <button onClick = {() => this.jumpTo(move)}>{desc} {play}</button>
        </li>
      );

      if (move === this.state.stepNumber) {
        item = (<b key = {"selected-item"}>{item}</b>);
      }

      return item;
    });
    moves = this.state.sortAscending ? moves : moves.reverse();

    let status;
    if (winner) {
      status = "Winner: " + winner.player;
    } else if (!current.squares.includes(null)) {
      status = "It's a draw!";
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? "X" : "O");
    }

    const sortOrder = this.state.sortAscending ? "Ascending" : "Descending";
    const sortButton = React.createElement("button", {
      onClick: () => this.setState({
        sortAscending: !this.state.sortAscending,
      }),
    }, null, "Sort Order: " + sortOrder);
      
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            onClick = {(i) => this.handleClick(i)}
            highlightedSquares = {winner ? winner.line : []}
          />
        </div>
        <div className="game-info">
          <div><h2>{status}</h2></div>
          <h3>Move history {sortButton}</h3>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [];

  // add rows
  for (let row = 0; row < BOARD_SIZE; row++) {
    const l = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      l.push((row * BOARD_SIZE) + col);
    }

    lines.push(l);
  }

  // add columns
  for (let col = 0; col < BOARD_SIZE; col++) {
    const l = [];
    let cur = col;

    for (let row = 0; row < BOARD_SIZE; row++) {
      l.push(cur);
      cur += BOARD_SIZE;
    }

    lines.push(l);
  }

  // add diagonals
  const diagonal = [];
  const invDiagonal = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (row === j) {
        diagonal.push((row * BOARD_SIZE) + j);
        invDiagonal.push((row * BOARD_SIZE) + (BOARD_SIZE - j) - 1);
      }
    }
  }
  lines.push(diagonal);
  lines.push(invDiagonal);

  for (let i = 0; i < lines.length; i++) {
    let cont_x = 0;
    let cont_o = 0;
    for (let j = 0; j < lines[i].length; j++) {
      const index = lines[i][j];

      if (squares[index] != null && squares[index] === "X") {
        cont_x++;
      } else if (squares[index] != null && squares[index] === "O") {
        cont_o++;
      } else {
        continue;
      }
    }

    let winner = "";
    if (cont_x >= BOARD_SIZE) {
      winner = "X";
    } else if (cont_o >= BOARD_SIZE) {
      winner = "O";
    }

    if (winner !== "") {
      return ({
        player: winner,
        line: lines[i],
      });
    }
  }

  return null;
}
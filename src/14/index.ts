import { input } from "./input";

enum Cell {
  RoundRock = "O",
  CubeRock = "#",
  EmptySpace = ".",
}

type Row = Cell[];

type PuzzleMap = {
  id?: number;
  rows: Row[];
};

enum Direction {
  North,
  West,
  South,
  East,
}

function parseInput(input: string): PuzzleMap {
  return {
    rows: input.split("\n").map((line) => {
      return line.split("").map((char) => {
        switch (char) {
          case "O":
            return Cell.RoundRock;
          case "#":
            return Cell.CubeRock;
          case ".":
            return Cell.EmptySpace;
          default:
            throw new Error("Unknown cell type");
        }
      });
    }),
  };
}

function tiltNorth(map: PuzzleMap): PuzzleMap {
  let hasChanged = false;
  const newMap: PuzzleMap = {
    rows: JSON.parse(JSON.stringify(map.rows)),
  };
  for (let rowIndex = 1; rowIndex < newMap.rows.length; rowIndex++) {
    const rowAbove = newMap.rows[rowIndex - 1];
    const row = newMap.rows[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      if (row[columnIndex] === Cell.RoundRock) {
        // See if we can move it up
        if (rowAbove[columnIndex] === Cell.EmptySpace) {
          rowAbove[columnIndex] = Cell.RoundRock;
          row[columnIndex] = Cell.EmptySpace;
          hasChanged = true;
        }
      }
    }
  }
  if (hasChanged) {
    return newMap;
  }
  return map;
}

function tiltNorthMutate(map: PuzzleMap): boolean {
  let hasChanged = false;
  for (let rowIndex = 1; rowIndex < map.rows.length; rowIndex++) {
    const rowAbove = map.rows[rowIndex - 1];
    const row = map.rows[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      if (row[columnIndex] === Cell.RoundRock) {
        // See if we can move it up
        if (rowAbove[columnIndex] === Cell.EmptySpace) {
          rowAbove[columnIndex] = Cell.RoundRock;
          row[columnIndex] = Cell.EmptySpace;
          hasChanged = true;
        }
      }
    }
  }
  return !hasChanged;
}
function tiltWestMutate(map: PuzzleMap): boolean {
  let hasChange = false;
  for (let columnIndex = 1; columnIndex < map.rows[0].length; columnIndex++) {
    for (let rowIndex = 0; rowIndex < map.rows.length; rowIndex++) {
      if (map.rows[rowIndex][columnIndex] === Cell.RoundRock) {
        if (map.rows[rowIndex][columnIndex - 1] === Cell.EmptySpace) {
          map.rows[rowIndex][columnIndex - 1] = Cell.RoundRock;
          map.rows[rowIndex][columnIndex] = Cell.EmptySpace;
          hasChange = true;
        }
      }
    }
  }
  return !hasChange;
}

function tiltSouthMutate(map: PuzzleMap): boolean {
  let hasChange = false;
  for (let rowIndex = map.rows.length - 2; rowIndex >= 0; rowIndex--) {
    const rowBelow = map.rows[rowIndex + 1];
    const row = map.rows[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      if (row[columnIndex] === Cell.RoundRock) {
        // See if we can move it up
        if (rowBelow[columnIndex] === Cell.EmptySpace) {
          rowBelow[columnIndex] = Cell.RoundRock;
          row[columnIndex] = Cell.EmptySpace;
          hasChange = true;
        }
      }
    }
  }
  return !hasChange;
}

function tiltEastMutate(map: PuzzleMap): boolean {
  let hasChange = false;
  for (
    let columnIndex = map.rows[0].length - 2;
    columnIndex >= 0;
    columnIndex--
  ) {
    for (let rowIndex = 0; rowIndex < map.rows.length; rowIndex++) {
      if (map.rows[rowIndex][columnIndex] === Cell.RoundRock) {
        if (map.rows[rowIndex][columnIndex + 1] === Cell.EmptySpace) {
          map.rows[rowIndex][columnIndex + 1] = Cell.RoundRock;
          map.rows[rowIndex][columnIndex] = Cell.EmptySpace;
          hasChange = true;
        }
      }
    }
  }
  return !hasChange;
}

function isPuzzleEqual(p1: PuzzleMap, p2: PuzzleMap): boolean {
  if (p1.rows.length !== p2.rows.length) {
    return false;
  }
  for (let rowIndex = 0; rowIndex < p1.rows.length; rowIndex++) {
    const row1 = p1.rows[rowIndex];
    const row2 = p2.rows[rowIndex];
    if (row1.length !== row2.length) {
      return false;
    }
    for (let columnIndex = 0; columnIndex < row1.length; columnIndex++) {
      if (row1[columnIndex] !== row2[columnIndex]) {
        return false;
      }
    }
  }
  return true;
}

let globalId = 100;
function tiltDirection(map: PuzzleMap, direction: Direction): PuzzleMap {
  switch (direction) {
    case Direction.North:
      while (!tiltNorthMutate(map)) {
        // Do nothing
      }
      break;
    case Direction.West:
      while (!tiltWestMutate(map)) {
        // Do nothing
      }
      break;
    case Direction.South:
      while (!tiltSouthMutate(map)) {
        // Do nothing
      }
      break;
    case Direction.East:
      while (!tiltEastMutate(map)) {
        // Do nothing
      }
      break;
  }
  const newMap = { id: globalId++, rows: map.rows };
  return newMap;
}

function rotateMapCW(map: PuzzleMap): PuzzleMap {
  const newMap: PuzzleMap = {
    rows: [],
  };
  for (let columnIndex = 0; columnIndex < map.rows[0].length; columnIndex++) {
    const newRow: Row = [];
    for (let rowIndex = map.rows.length - 1; rowIndex >= 0; rowIndex--) {
      newRow.push(map.rows[rowIndex][columnIndex]);
    }
    newMap.rows.push(newRow);
  }
  return newMap;
}

function rotateMapCWMutate(map: PuzzleMap): void {
  // Transpose with mutation
  for (let rowIndex = 0; rowIndex < map.rows.length; rowIndex++) {
    for (
      let columnIndex = rowIndex;
      columnIndex < map.rows.length;
      columnIndex++
    ) {
      const temp = map.rows[rowIndex][columnIndex];
      map.rows[rowIndex][columnIndex] = map.rows[columnIndex][rowIndex];
      map.rows[columnIndex][rowIndex] = temp;
    }
  }
}

function scoreMap(map: PuzzleMap): number {
  const rowCount = map.rows.length;
  let score = 0;
  for (let rowIndex = 0; rowIndex < map.rows.length; rowIndex++) {
    let rowScore = 0;
    const row = map.rows[rowIndex];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      if (row[columnIndex] === Cell.RoundRock) {
        rowScore += 1;
      }
    }
    rowScore *= rowCount - rowIndex;
    score += rowScore;
  }
  return score;
}

let map = parseInput(input);
let done = false;
while (!done) {
  if (tiltNorthMutate(map)) {
    done = true;
  }
}

console.log(scoreMap(map));

map = parseInput(input);
map.id = 1;

const trackedStates: Map<string, string> = new Map();

let loopStart = -1;
let loopStartJson = "";
let loopSize = -1;
let loopHandled = false;
for (var i = 0; i < 1000000000; i++) {
  let input = JSON.stringify(map.rows);
  if (!loopHandled && trackedStates.has(input)) {
    if (loopStart === -1) {
      loopStart = i;
      loopStartJson = input;
      loopSize = 1;
    } else {
      if (loopStartJson === input) {
        console.log("Found loop at", i);
        i += Math.floor((1000000000 - i) / loopSize) * loopSize;
        loopHandled = true;
      } else {
        loopSize++;
      }
    }
  }
  map = tiltDirection(map, Direction.North);
  map = tiltDirection(map, Direction.West);
  map = tiltDirection(map, Direction.South);
  map = tiltDirection(map, Direction.East);
  const output = JSON.stringify(map.rows);
  trackedStates.set(input, output);
}

console.log(scoreMap(map));

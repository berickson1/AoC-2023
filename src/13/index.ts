import { input } from "./input";

enum Cell {
  Ash = ".",
  Rock = "#",
}

type Row = Cell[];

type PuzzleMap = {
  rows: Row[];
};

function parseInput(input: string): PuzzleMap[] {
  return input.split("\n\n").map((group) => {
    return {
      rows: group.split("\n").map((line) => {
        return line.split("").map((char) => {
          switch (char) {
            case "#":
              return Cell.Rock;
            case ".":
              return Cell.Ash;
            default:
              throw new Error("Unknown cell type");
          }
        });
      }),
    };
  });
}

function isMirrorRow(rowOne: Row, rowTwo: Row): boolean {
  return rowOne.every((cell, index) => {
    return cell === rowTwo[index];
  });
}

function isMirrorColumn(map: PuzzleMap, columnOne: number, columnTwo: number) {
  return map.rows.every((row) => {
    return row[columnOne] === row[columnTwo];
  });
}

function findRowReflectionScore(map: PuzzleMap, scoreToIgnore: number): number {
  for (
    var startRowIndex = 1;
    startRowIndex < map.rows.length;
    startRowIndex++
  ) {
    // If row mirrors the last, continue checking until we've hit a bound
    if (isMirrorRow(map.rows[startRowIndex], map.rows[startRowIndex - 1])) {
      let mirrorPossible = true;
      for (
        var offsetToCheck = 1;
        mirrorPossible &&
        startRowIndex - 1 + offsetToCheck < map.rows.length &&
        startRowIndex - offsetToCheck >= 0;
        offsetToCheck++
      ) {
        if (
          !isMirrorRow(
            map.rows[startRowIndex - 1 + offsetToCheck],
            map.rows[startRowIndex - offsetToCheck]
          )
        ) {
          mirrorPossible = false;
        }
      }
      if (mirrorPossible) {
        let possibleScore = startRowIndex * 100;
        if (possibleScore !== scoreToIgnore) {
          return possibleScore;
        }
      }
    }
  }
  return -1;
}

function findColumnReflectionScore(
  map: PuzzleMap,
  scoreToIgnore: number
): number {
  for (
    var startColumnIndex = 1;
    startColumnIndex < map.rows[0].length;
    startColumnIndex++
  ) {
    // If column mirrors the last, continue checking until we've hit a bound
    if (isMirrorColumn(map, startColumnIndex, startColumnIndex - 1)) {
      let mirrorPossible = true;
      for (
        var offsetToCheck = 1;
        mirrorPossible &&
        startColumnIndex - 1 + offsetToCheck < map.rows[0].length &&
        startColumnIndex - offsetToCheck >= 0;
        offsetToCheck++
      ) {
        if (
          !isMirrorColumn(
            map,
            startColumnIndex - 1 + offsetToCheck,
            startColumnIndex - offsetToCheck
          )
        ) {
          mirrorPossible = false;
        }
      }
      if (mirrorPossible) {
        let possibleScore = startColumnIndex;
        if (possibleScore !== scoreToIgnore) {
          return possibleScore;
        }
      }
    }
  }
  return -1;
}

const maps = parseInput(input);
let sum = 0;
const solutions = new Map<PuzzleMap, [number, number]>();
for (const map of maps) {
  const rowReflectionScore = findRowReflectionScore(map, -1);
  const columnReflectionScore = findColumnReflectionScore(map, -1);
  if (rowReflectionScore > -1) {
    solutions.set(map, [rowReflectionScore, -1]);
    sum += rowReflectionScore;
  } else if (columnReflectionScore > -1) {
    solutions.set(map, [-1, columnReflectionScore]);
    sum += columnReflectionScore;
  }
}

console.log(sum);

function invertVal(map: PuzzleMap, rowIndex: number, columnIndex: number) {
  if (map.rows[rowIndex][columnIndex] === Cell.Ash) {
    map.rows[rowIndex][columnIndex] = Cell.Rock;
  } else {
    map.rows[rowIndex][columnIndex] = Cell.Ash;
  }
}

sum = 0;
let found = false;
let i = 0;
for (const map of maps) {
  i++;
  found = false;
  for (var rowIndex = 0; rowIndex < map.rows.length; rowIndex++) {
    for (var columnIndex = 0; columnIndex < map.rows[0].length; columnIndex++) {
      if (found) {
        continue;
      }
      invertVal(map, rowIndex, columnIndex);
      const oldScores = solutions.get(map)!;
      const rowReflectionScore = findRowReflectionScore(map, oldScores[0]);
      const columnReflectionScore = findColumnReflectionScore(
        map,
        oldScores[1]
      );
      if (rowReflectionScore > -1) {
        sum += rowReflectionScore;
        found = true;
      } else if (columnReflectionScore > -1) {
        sum += columnReflectionScore;
        found = true;
      }
      invertVal(map, rowIndex, columnIndex);
    }
  }
}

console.log(sum);

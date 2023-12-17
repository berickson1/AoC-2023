import { input } from "./input";

interface Position {
  x: number;
  y: number;
}

enum Direction {
  Left,
  Right,
  Up,
  Down,
}
interface Cell {
  heatLoss: number;
}

type Row = Cell[];

type PuzzleMap = {
  rows: Row[];
};

function parseInput(input: string): PuzzleMap {
  return {
    rows: input.split("\n").map((line) => {
      return line.split("").map((char) => {
        return {
          heatLoss: Number(char),
        }

      });
    }),
  };
}


function insertIntoCheckerMap(candidateMap: Map<number, Candidate[]>, candidate: Candidate) {
  const value = candidate[2];
  if (!candidateMap.has(value)) {
    candidateMap.set(value, []);
  }
  candidateMap.get(value)!.push(candidate);
}

function getNextCandidate(candidateMap: Map<number, Candidate[]>): Candidate | undefined {
  if (candidateMap.size === 0) {
    return undefined;
  }
  const minDistance = Math.min(...candidateMap.keys());
  const candidates = candidateMap.get(minDistance)!;
  const candidate = candidates.pop()!;
  if (candidates.length === 0) {
    candidateMap.delete(minDistance);
  }
  return candidate;
}

type Candidate = [toCheck: Position, motionDirection: Direction, currentCost: number, straightMoves: number];
function fillminCostToStart(map: PuzzleMap, minStraightMoves = 1, maxStraightMoves = 3) {
  const checkerMap: Map<number, Candidate[]> = new Map();
  const visitedMap: Set<string> = new Set();
  insertIntoCheckerMap(checkerMap, [{ x: 1, y: 0 }, Direction.Right, 0, 1]);
  insertIntoCheckerMap(checkerMap, [{ x: 0, y: 1 }, Direction.Down, 0, 1]);
  let candidate;
  while ((candidate = getNextCandidate(checkerMap)) !== undefined) {
    const [toCheck, motionDirection, currentCost, straightMoves] = candidate;
    const visitedKey = `${toCheck.x},${toCheck.y},${motionDirection},${straightMoves}`;
    if (visitedMap.has(visitedKey)) {
      continue;
    }
    if (straightMoves > maxStraightMoves) {
      continue;
    }
    visitedMap.add(visitedKey);
    const cell = map.rows[toCheck.y]?.[toCheck.x];
    if (!cell) {
      continue;
    }
    if (straightMoves < minStraightMoves) {
      switch (motionDirection) {
        case Direction.Left:
          insertIntoCheckerMap(checkerMap, [{ x: toCheck.x - 1, y: toCheck.y }, Direction.Left, currentCost + cell.heatLoss, straightMoves + 1]);
          break;
        case Direction.Right:
          insertIntoCheckerMap(checkerMap, [{ x: toCheck.x + 1, y: toCheck.y }, Direction.Right, currentCost + cell.heatLoss, straightMoves + 1]);
          break;
        case Direction.Up:
          insertIntoCheckerMap(checkerMap, [{ x: toCheck.x, y: toCheck.y - 1 }, Direction.Up, currentCost + cell.heatLoss, straightMoves + 1]);
          break;
        case Direction.Down:
          insertIntoCheckerMap(checkerMap, [{ x: toCheck.x, y: toCheck.y + 1 }, Direction.Down, currentCost + cell.heatLoss, straightMoves + 1]);
          break;
      }
      continue;
    }
    if (toCheck.x === map.rows[0].length - 1 && toCheck.y === map.rows.length - 1) {
      return currentCost + cell.heatLoss;
    }
    // Left
    if (toCheck.x > 0 && motionDirection !== Direction.Right) {
      insertIntoCheckerMap(checkerMap, [{ x: toCheck.x - 1, y: toCheck.y }, Direction.Left, currentCost + cell.heatLoss, motionDirection === Direction.Left ? straightMoves + 1 : 1]);
    }
    // Right
    if (toCheck.x < map.rows[0].length - 1 && motionDirection !== Direction.Left) {
      insertIntoCheckerMap(checkerMap, [{ x: toCheck.x + 1, y: toCheck.y }, Direction.Right, currentCost + cell.heatLoss, motionDirection === Direction.Right ? straightMoves + 1 : 1]);
    }
    // Up
    if (toCheck.y > 0 && motionDirection !== Direction.Down) {
      insertIntoCheckerMap(checkerMap, [{ x: toCheck.x, y: toCheck.y - 1 }, Direction.Up, currentCost + cell.heatLoss, motionDirection === Direction.Up ? straightMoves + 1 : 1]);
    }
    // Down
    if (toCheck.y < map.rows.length - 1 && motionDirection !== Direction.Up) {
      insertIntoCheckerMap(checkerMap, [{ x: toCheck.x, y: toCheck.y + 1 }, Direction.Down, currentCost + cell.heatLoss, motionDirection === Direction.Down ? straightMoves + 1 : 1]);
    }
  }
}

const map = parseInput(input);
console.log(fillminCostToStart(map));
console.log(fillminCostToStart(map, 4, 10));
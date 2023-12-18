import { input } from "./input";

interface Position {
  x: number;
  y: number;
}

enum Direction {
  Left = "L",
  Right = "R",
  Up = "U",
  Down = "D",
}

interface Cell {
  state: undefined | 'trench' | 'excavated';
}

interface Instruction {
  direction: Direction;
  direction2: Direction;
  steps: number;
  steps2: number;
}

// Map<row, Map<column, Cell>>
type PuzzleMap = Map<number, Map<number, Cell>>;

function numberToDirection(direction: number): Direction {
  switch (direction) {
    case 0:
      return Direction.Right;
    case 1:
      return Direction.Down;
    case 2:
      return Direction.Left;
    case 3:
      return Direction.Up;
  }
  throw new Error("Invalid direction");
}

function parseInput(input: string): Instruction[] {
  //L 6 (#0a4720)
  return input.split("\n").map((line) => {
    const splitLine = line.split(" ");
    return {
      direction: splitLine[0] as Direction,
      direction2: numberToDirection(parseInt(splitLine[2].slice(-2, -1), 10)),

      steps: parseInt(splitLine[1], 10),
      steps2: parseInt(splitLine[2].slice(2, -2), 16),
    }
  });
}
function dig(map: PuzzleMap, fromPosition: Position, instruction: Instruction, part2 = false): Position {
  let { direction, steps } = instruction;
  if (part2) {
    direction = instruction.direction2;
    steps = instruction.steps2;
  }
  let currentPosition = fromPosition;
  for (let i = 0; i < steps; i++) {
    switch (direction) {
      case Direction.Left:
        currentPosition = { x: currentPosition.x - 1, y: currentPosition.y };
        break;
      case Direction.Right:
        currentPosition = { x: currentPosition.x + 1, y: currentPosition.y };
        break;
      case Direction.Up:
        currentPosition = { x: currentPosition.x, y: currentPosition.y - 1 };
        break;
      case Direction.Down:
        currentPosition = { x: currentPosition.x, y: currentPosition.y + 1 };
        break;
    }
    const { x, y } = currentPosition;
    const row = map.get(y) || new Map<number, Cell>();
    const cell: Cell = {
      state: "trench",
    };
    row.set(x, cell);
    map.set(y, row);
  }
  return currentPosition
}

function excavateInterior(map: PuzzleMap) {
  // Find all outer left edges
  let found = false;
  const positionsToCheck = Array.from(map.entries()).map(([y, row]) => {
    const leftEdge = Array.from(row.keys()).sort()[0];
    const leftInside = row.get(leftEdge + 1);
    if (!leftInside && !found) {
      found = true
      return { x: leftEdge + 1, y };
    }
    return undefined;
  });
  // Fill from all positions until a trench is found
  while (positionsToCheck.length > 0) {
    const position = positionsToCheck.pop();
    if (!position) {
      continue;
    }
    let currentPosition = position;
    const row = map.get(currentPosition.y);

    if (!row) {
      continue;
    }
    const cell: Cell = row.get(currentPosition.x) ||
    {
      state: undefined,
    };
    if (cell.state === "trench" || cell.state === "excavated") {
      continue;
    }
    row.set(currentPosition.x, cell);
    map.set(currentPosition.y, row);
    cell.state = "excavated";
    // Add all adjacent cells to positions to check
    positionsToCheck.push({ x: currentPosition.x + 1, y: currentPosition.y });
    positionsToCheck.push({ x: currentPosition.x - 1, y: currentPosition.y });
    positionsToCheck.push({ x: currentPosition.x, y: currentPosition.y + 1 });
    positionsToCheck.push({ x: currentPosition.x, y: currentPosition.y - 1 });

  }
}

const instructions = parseInput(input);
{
  let position = { x: 0, y: 0 };
  let map: PuzzleMap = new Map();
  for (const instruction of instructions) {
    position = dig(map, position, instruction);
  }
  // flood fill all inside of map
  excavateInterior(map);

  // Count all trenched or excavated cells
  let count = 0;
  for (const row of map.values()) {
    for (const cell of row.values()) {
      if (cell.state === "trench" || cell.state === "excavated") {
        count++;
      }
    }
  }
  console.log(count);
}

function countArea(map: PuzzleMap): number {
  // get Map Extreme values
  let rowMin = Number.MAX_SAFE_INTEGER;
  let rowMax = Number.MIN_SAFE_INTEGER;
  let columnMin = Number.MAX_SAFE_INTEGER;
  let columnMax = Number.MIN_SAFE_INTEGER;
  map.forEach((row, rowKey) => {
    if (rowKey < rowMin) {
      rowMin = rowKey;
    }
    if (rowKey > rowMax) {
      rowMax = rowKey;
    }
    row.forEach((value, key) => {
      if (key < columnMin) {
        columnMin = key;
      }
      if (key > columnMax) {
        columnMax = key;
      }
    });
  });
  let count = 0;
  for (let y = rowMin; y <= rowMax; y++) {
    const row = map.get(y);
    if (!row) {
      continue;
    }
    let isInside = false;
    let consecutive = 0;
    let columnIndicies = Array.from(row.keys()).sort();
    for (let columnIndex = 0; columnIndex < columnIndicies.length; columnIndex++) {
      const currentTrenchCellIndex = columnIndicies[columnIndex]
      const previousTrenchCellIndex = columnIndicies[columnIndex - 1];
      const nextTrenchCellIndex = columnIndicies[columnIndex + 1];
      const previousCellIndex = currentTrenchCellIndex - 1;
      const nextCellIndex = currentTrenchCellIndex + 1;
      // Traversing across a trench
      // Trench ends, stay inside
      // Trench ends, outside
      // Gap between trenches
    }

  }
  return count;
}

{
  let position = { x: 0, y: 0 };
  let map: PuzzleMap = new Map();
  for (const instruction of instructions) {
    position = dig(map, position, instruction, true);
  }

  // Count all trenched or excavated cells
  let count = countArea(map);
  console.log('asdf')
  console.log(count);
}
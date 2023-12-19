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
  state: undefined | "trench" | "excavated";
  xDelta: number;
  yDelta: number;
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
    };
  });
}

function dig(
  map: PuzzleMap,
  fromPosition: Position,
  instruction: Instruction,
  part2 = false
): Position {
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
      xDelta: 1,
      yDelta: 1,
    };
    row.set(x, cell);
    map.set(y, row);
  }
  return currentPosition;
}

function digOptimized(
  fromPosition: Position,
  instructions: Instruction[],
  part2 = false
): PuzzleMap {
  // Build out an optimized map
  const optimizedMap: PuzzleMap = new Map();
  const rowStopPoints = new Set<number>();
  const columnStopPoints = new Set<number>();
  let currentPosition = fromPosition;
  for (const instruction of instructions) {
    let { direction, steps } = instruction;
    if (part2) {
      direction = instruction.direction2;
      steps = instruction.steps2;
    }
    switch (direction) {
      case Direction.Left:
        currentPosition = {
          x: currentPosition.x - steps,
          y: currentPosition.y,
        };
        break;
      case Direction.Right:
        currentPosition = {
          x: currentPosition.x + steps,
          y: currentPosition.y,
        };
        break;
      case Direction.Up:
        currentPosition = {
          x: currentPosition.x,
          y: currentPosition.y - steps,
        };
        break;
      case Direction.Down:
        currentPosition = {
          x: currentPosition.x,
          y: currentPosition.y + steps,
        };
        break;
    }
    rowStopPoints.add(currentPosition.y);
    rowStopPoints.add(currentPosition.y + 0.5);
    columnStopPoints.add(currentPosition.x);
    columnStopPoints.add(currentPosition.x + 0.5);
  }
  const rowStopPointsArray = Array.from(rowStopPoints.keys()).sort(
    (a, b) => a - b
  );
  for (let i = 0; i < rowStopPointsArray.length - 1; i++) {
    const rowValue = rowStopPointsArray[i];
    const rowHeight =
      rowValue % 1 != 0
        ? rowStopPointsArray[i + 1] - rowStopPointsArray[i - 1] - 1
        : 1;
    const row = new Map<number, Cell>();
    const columnStopPointsArray = Array.from(columnStopPoints.keys()).sort(
      (a, b) => a - b
    );
    for (let j = 0; j < columnStopPointsArray.length - 1; j++) {
      const columnValue = columnStopPointsArray[j];
      const columnWidth =
        columnValue % 1 != 0
          ? columnStopPointsArray[j + 1] - columnStopPointsArray[j - 1] - 1
          : 1;
      const cell: Cell = {
        state: undefined,
        xDelta: columnWidth,
        yDelta: rowHeight,
      };
      row.set(columnValue, cell);
    }
    optimizedMap.set(rowValue, row);
  }
  // We now have a smaller map, we can run all the instructions again
  currentPosition = fromPosition;
  for (const instruction of instructions) {
    let startPosition = currentPosition;
    let { direction, steps } = instruction;
    if (part2) {
      direction = instruction.direction2;
      steps = instruction.steps2;
    }
    switch (direction) {
      case Direction.Left:
        currentPosition = {
          x: currentPosition.x - steps,
          y: currentPosition.y,
        };
        // From start, mark all cells to the left as trenched
        const row = optimizedMap.get(startPosition.y);
        if (!row) {
          break;
        }
        row.forEach((cell, x) => {
          if (x <= startPosition.x && x >= currentPosition.x) {
            cell.state = "trench";
          }
        });
        break;
      case Direction.Right:
        currentPosition = {
          x: currentPosition.x + steps,
          y: currentPosition.y,
        };
        // From start, mark all cells to the right as trenched
        const row2 = optimizedMap.get(startPosition.y);
        if (!row2) {
          break;
        }
        row2.forEach((cell, x) => {
          if (x >= startPosition.x && x <= currentPosition.x) {
            cell.state = "trench";
          }
        });
        break;
      case Direction.Up:
        currentPosition = {
          x: currentPosition.x,
          y: currentPosition.y - steps,
        };
        // From start, mark all cells upwards as trenched
        optimizedMap.forEach((row, y) => {
          if (y <= startPosition.y && y >= currentPosition.y) {
            const cell = row.get(currentPosition.x);
            if (cell) {
              cell.state = "trench";
            }
          }
        });
        break;
      case Direction.Down:
        currentPosition = {
          x: currentPosition.x,
          y: currentPosition.y + steps,
        };
        // From start, mark all cells downwards as trenched
        optimizedMap.forEach((row, y) => {
          if (y >= startPosition.y && y <= currentPosition.y) {
            const cell = row.get(currentPosition.x);
            if (cell) {
              cell.state = "trench";
            }
          }
        });
        break;
    }
  }
  return optimizedMap;
}

function excavateInterior(map: PuzzleMap) {
  // Find all outer left edges
  let found = false;
  const positionsToCheck = Array.from(map.entries()).map(([y, row]) => {
    const leftEdge = Array.from(row.keys()).sort((a, b) => a - b)[0];
    const leftInside = row.get(leftEdge + 1);
    if (!leftInside && !found) {
      found = true;
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
    const cell: Cell = row.get(currentPosition.x) || {
      state: undefined,
      xDelta: 1,
      yDelta: 1,
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

function excavateInteriorOptimized(map: PuzzleMap) {
  // Find all outer left edges
  let found = false;
  const rowIds = Array.from(map.keys()).sort((a, b) => a - b);
  const columnIds = Array.from(map.get(rowIds[0])?.keys() || []).sort(
    (a, b) => a - b
  );
  const positionsToCheck = rowIds
    .map((y) => {
      const row = map.get(y)!;
      const leftEdgeIndex = Array.from(row.keys()).sort((a, b) => a - b)[0];
      const leftEdge = row.get(leftEdgeIndex);
      const leftInside = row.get(leftEdgeIndex + 0.5);
      if (
        leftEdge &&
        leftEdge.state === "trench" &&
        leftInside &&
        leftInside.state === undefined &&
        !found
      ) {
        return { x: leftEdgeIndex + 0.5, y };
      }
      return undefined;
    })
    .filter((x) => x);
  // Fill from all positions until a trench is found
  while (positionsToCheck.length > 0) {
    const position = positionsToCheck.pop();
    if (!position || position.x == undefined || position.y === undefined) {
      continue;
    }
    let currentPosition = position;
    const row = map.get(currentPosition.y);
    if (!row) {
      continue;
    }
    const cell = row.get(currentPosition.x);
    if (!cell) {
      continue;
    }
    if (cell.state === "trench" || cell.state === "excavated") {
      continue;
    }
    cell.state = "excavated";
    // Add all adjacent cells to positions to check
    positionsToCheck.push({
      x: columnIds[columnIds.indexOf(currentPosition.x) + 1],
      y: currentPosition.y,
    });
    positionsToCheck.push({
      x: columnIds[columnIds.indexOf(currentPosition.x) - 1],
      y: currentPosition.y,
    });
    positionsToCheck.push({
      x: currentPosition.x,
      y: rowIds[rowIds.indexOf(currentPosition.y) + 1],
    });
    positionsToCheck.push({
      x: currentPosition.x,
      y: rowIds[rowIds.indexOf(currentPosition.y) - 1],
    });
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
        count += cell.xDelta * cell.yDelta;
      }
    }
  }
  console.log(count);
}

function printOptimizedMap(map: PuzzleMap) {
  console.clear();
  for (const row of map.values()) {
    for (let j = 0; j < row.get(0)!.yDelta; j++) {
      let line = "";
      for (const cell of row.values()) {
        for (let i = 0; i < cell.xDelta; i++)
          if (cell.state === "trench") {
            line += "#";
          } else if (cell.state === "excavated") {
            line += ".";
          } else {
            line += " ";
          }
      }
      console.log(line);
    }
  }
}

{
  /*let map: PuzzleMap = new Map();
  for (const instruction of instructions) {
    position = dig(map, position, instruction, true);
  }*/

  let optimizedMap = digOptimized({ x: 0, y: 0 }, instructions, true);
  //printOptimizedMap(optimizedMap);
  console.log(optimizedMap.size);
  excavateInteriorOptimized(optimizedMap);
  //printOptimizedMap(optimizedMap);

  let count = 0;
  for (const row of optimizedMap.values()) {
    for (const cell of row.values()) {
      if (cell.state === "trench" || cell.state === "excavated") {
        count += cell.xDelta * cell.yDelta;
      }
    }
  }
  console.log(count);
}

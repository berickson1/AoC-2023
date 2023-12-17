import { input } from "./input";

interface Position {
  x: number;
  y: number;
}

enum MirrorType {
  HorizontalSplitter = "-",
  VerticalSplitter = "|",
  MirrorLeft = "\\",
  MirrorRight = "/",
  EmptySpace = ".",
}

enum Direction {
  Up = 1 << 0,
  Down = 1 << 1,
  Left = 1 << 2,
  Right = 1 << 3,
}

interface Cell {
  lightExitDirection: number;
  mirrorType: MirrorType;
}

type Row = Cell[];

type PuzzleMap = {
  rows: Row[];
};

function parseInput(input: string): PuzzleMap {
  return {
    rows: input.split("\n").map((line) => {
      return line.split("").map((char) => {
        let mirrorType: MirrorType;
        switch (char) {
          case MirrorType.HorizontalSplitter:
            mirrorType = MirrorType.HorizontalSplitter;
            break;
          case MirrorType.VerticalSplitter:
            mirrorType = MirrorType.VerticalSplitter;
            break;
          case MirrorType.MirrorLeft:
            mirrorType = MirrorType.MirrorLeft;
            break;
          case MirrorType.MirrorRight:
            mirrorType = MirrorType.MirrorRight;
            break;
          case MirrorType.EmptySpace:
            mirrorType = MirrorType.EmptySpace;
            break;
          default:
            throw new Error("Unknown character: " + char);
        }
        return {
          mirrorType,
          lightExitDirection: 0,
        }

      });
    }),
  };
}

function maskHasDirection(mask: number, direction: Direction): boolean {
  return (mask & direction) === direction;
}

function propagateLight(map: PuzzleMap, entryDirection: Direction, cellPosition: Position) {
  const { x, y } = cellPosition;
  const cell = map.rows[y][x];
  let lightExitDirections = [];
  const mirrorType = cell.mirrorType;
  switch (mirrorType) {
    case MirrorType.HorizontalSplitter:
      if (entryDirection === Direction.Up || entryDirection === Direction.Down) {
        lightExitDirections.push(Direction.Left)
        lightExitDirections.push(Direction.Right);
      } else {
        lightExitDirections.push(entryDirection);
      }
      break;
    case MirrorType.VerticalSplitter:
      if (entryDirection === Direction.Left || entryDirection === Direction.Right) {
        lightExitDirections.push(Direction.Up);
        lightExitDirections.push(Direction.Down);
      } else {
        lightExitDirections.push(entryDirection);
      }
      break;
    case MirrorType.MirrorLeft: // \
      switch (entryDirection) {
        case Direction.Up:
          lightExitDirections.push(Direction.Left);
          break;
        case Direction.Right:
          lightExitDirections.push(Direction.Down);
          break;
        case Direction.Down:
          lightExitDirections.push(Direction.Right);
          break;
        case Direction.Left:
          lightExitDirections.push(Direction.Up);
          break;
      }
      break;
    case MirrorType.MirrorRight: // /
      switch (entryDirection) {
        case Direction.Up:
          lightExitDirections.push(Direction.Right);
          break;
        case Direction.Right:
          lightExitDirections.push(Direction.Up);
          break;
        case Direction.Down:
          lightExitDirections.push(Direction.Left);
          break;
        case Direction.Left:
          lightExitDirections.push(Direction.Down);
          break;
      }
      break;
    case MirrorType.EmptySpace:
      lightExitDirections.push(entryDirection);
      break;
    default:
      throw new Error("Unknown mirror type: " + mirrorType);
  }

  // Check if the light is already exiting in the same direction
  for (const lightExitDirection of lightExitDirections) {
    if (!maskHasDirection(cell.lightExitDirection, lightExitDirection)) {
      cell.lightExitDirection |= lightExitDirection;
      // Propagate light
      if (lightExitDirection === Direction.Up) {
        if (y > 0) {
          propagateLight(map, lightExitDirection, { x, y: y - 1 });
        }
      } else if (lightExitDirection === Direction.Down) {
        if (y < map.rows.length - 1) {
          propagateLight(map, lightExitDirection, { x, y: y + 1 });
        }
      } else if (lightExitDirection === Direction.Left) {
        if (x > 0) {
          propagateLight(map, lightExitDirection, { x: x - 1, y });
        }
      } else if (lightExitDirection === Direction.Right) {
        if (x < map.rows[y].length - 1) {
          propagateLight(map, lightExitDirection, { x: x + 1, y });
        }
      }
    }
  }
}
{
  const map = parseInput(input);
  propagateLight(map, Direction.Right, { x: 0, y: 0 });
  // Count cell with light exiting in any direction
  let count = 0;
  for (let x = 0; x < map.rows[0].length; x++) {
    for (let y = 0; y < map.rows.length; y++) {
      const cell = map.rows[y][x];
      if (cell.lightExitDirection !== 0) {
        count++;
      }
    }
  }
  console.log(count)
}

let map = parseInput(input);
let maxScore = 0;
{
  for (let x = 0; x < map.rows[0].length; x++) {
    map = parseInput(input);
    propagateLight(map, Direction.Down, { x: x, y: 0 });
    // Count cell with light exiting in any direction
    let count = 0;
    for (let x = 0; x < map.rows[0].length; x++) {
      for (let y = 0; y < map.rows.length; y++) {
        const cell = map.rows[y][x];
        if (cell.lightExitDirection !== 0) {
          count++;
        }
      }
    }
    if (count > maxScore) {
      maxScore = count;
    }
  }

  for (let y = 0; y < map.rows.length; y++) {
    map = parseInput(input);
    propagateLight(map, Direction.Right, { x: 0, y });
    // Count cell with light exiting in any direction
    let count = 0;
    for (let x = 0; x < map.rows[0].length; x++) {
      for (let y = 0; y < map.rows.length; y++) {
        const cell = map.rows[y][x];
        if (cell.lightExitDirection !== 0) {
          count++;
        }
      }
    }
    if (count > maxScore) {
      maxScore = count;
    }
  }

  for (let x = 0; x < map.rows[0].length; x++) {
    map = parseInput(input);
    propagateLight(map, Direction.Up, { x: x, y: map.rows.length - 1 });
    // Count cell with light exiting in any direction
    let count = 0;
    for (let x = 0; x < map.rows[0].length; x++) {
      for (let y = 0; y < map.rows.length; y++) {
        const cell = map.rows[y][x];
        if (cell.lightExitDirection !== 0) {
          count++;
        }
      }
    }
    if (count > maxScore) {
      maxScore = count;
    }
  }

  for (let y = 0; y < map.rows.length; y++) {
    map = parseInput(input);
    propagateLight(map, Direction.Left, { x: map.rows[0].length - 1, y });
    // Count cell with light exiting in any direction
    let count = 0;
    for (let x = 0; x < map.rows[0].length; x++) {
      for (let y = 0; y < map.rows.length; y++) {
        const cell = map.rows[y][x];
        if (cell.lightExitDirection !== 0) {
          count++;
        }
      }
    }
    if (count > maxScore) {
      maxScore = count;
    }
  }


  console.log(maxScore)
}

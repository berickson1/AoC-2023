import { input } from "./input";

enum Cell {
  Operational = ".",
  Damaged = "#",
  Unknown = "?",
}

type Row = {
  cells: Cell[];
  conditionRecord: number[];
};

type PuzzleMap = Row[];

function solve(
  cells: Cell[],
  startCellIndex: number,
  currentGroupSize = 0,
  remainingConditions: number[]
): number {
  const cache: Map<number, Map<number, number>> = new Map();
  return solveInner(
    cells,
    startCellIndex,
    currentGroupSize,
    remainingConditions,
    cache
  );
}

function returnAndCache(
  cache: Map<number, Map<number, number>>,
  startCellIndex: number,
  remainingConditionCount: number,
  val: number
): number {
  let cacheVal = cache.get(startCellIndex);
  if (!cacheVal) {
    cacheVal = new Map();
    cache.set(startCellIndex, cacheVal);
  }
  let conditionCountCacheVal = cacheVal.get(remainingConditionCount);
  if (!conditionCountCacheVal) {
    conditionCountCacheVal = val;
    cacheVal.set(remainingConditionCount, conditionCountCacheVal);
  }
  return conditionCountCacheVal;
}

function solveInner(
  cells: Cell[],
  startCellIndex: number,
  currentGroupSize = 0,
  remainingConditions: number[],
  cache: Map<number, Map<number, number>>
): number {
  // If we're out of cells, check end conditions
  if (cells.length === startCellIndex) {
    // Not in a group, no conditions left
    if (!currentGroupSize && remainingConditions.length === 0) {
      return 1;
    }
    if (
      remainingConditions.length === 1 &&
      currentGroupSize === remainingConditions[0]
    ) {
      return 1;
    }
    return 0;
  }

  const maybeCacheVal = cache
    .get(startCellIndex)
    ?.get(remainingConditions.length);
  if (maybeCacheVal !== undefined) {
    return maybeCacheVal;
  }

  let brokenSpringCount = 0;
  let unknownSpringCount = 0;
  for (var i = startCellIndex; i < cells.length; i++) {
    const cell = cells[i];
    if (cell === Cell.Damaged) {
      brokenSpringCount += 1;
    } else if (cell === Cell.Unknown) {
      unknownSpringCount += 1;
    }
  }

  if (remainingConditions.length === 0) {
    // If there's a single damaged cell left, fail
    for (let i = startCellIndex; i < cells.length; i++) {
      if (cells[i] === Cell.Damaged) {
        return returnAndCache(
          cache,
          startCellIndex + 1,
          remainingConditions.length,
          0
        );
      }
    }
  }

  if (cells[startCellIndex] === Cell.Operational) {
    if (currentGroupSize === remainingConditions[0]) {
      return returnAndCache(
        cache,
        startCellIndex + 1,
        remainingConditions.length - 1,
        solveInner(
          cells,
          startCellIndex + 1,
          0,
          remainingConditions.slice(1),
          cache
        )
      );
    }
    if (currentGroupSize > 0) {
      return 0;
    }
    return solveInner(cells, startCellIndex + 1, 0, remainingConditions, cache);
  }

  // If we have no conditions left, fail
  if (currentGroupSize && remainingConditions.length === 0) {
    return returnAndCache(
      cache,
      startCellIndex + 1,
      remainingConditions.length - 1,
      0
    );
  }

  // If we're in a current group, try to extend it
  if (currentGroupSize) {
    if (remainingConditions[0] === currentGroupSize) {
      if (cells[startCellIndex] === Cell.Damaged) {
        return 0;
      }
    }
    const [currentCondition, ...restCondition] = remainingConditions;
    // Group is done, start a new one
    if (currentCondition === currentGroupSize) {
      return returnAndCache(
        cache,
        startCellIndex + 1,
        remainingConditions.length - 1,
        solveInner(cells, startCellIndex + 1, 0, restCondition, cache)
      );
    } else {
      return solveInner(
        cells,
        startCellIndex + 1,
        currentGroupSize + 1,
        remainingConditions,
        cache
      );
    }
  }

  // If there's more conditions than remaining cells, fail
  const conditionCount = remainingConditions.reduce((a, b) => a + b, 0);
  if (
    brokenSpringCount + unknownSpringCount + currentGroupSize <
      conditionCount ||
    brokenSpringCount > conditionCount - currentGroupSize
  ) {
    return 0;
  }

  // Try to start a new group
  if (cells[startCellIndex] === Cell.Damaged) {
    // In a group for sure
    return solveInner(cells, startCellIndex + 1, 1, remainingConditions, cache);
  } else if (cells[startCellIndex] === Cell.Unknown) {
    // Check new group and no group case
    return (
      solveInner(cells, startCellIndex + 1, 1, remainingConditions, cache) +
      solveInner(cells, startCellIndex + 1, 0, remainingConditions, cache)
    );
  }

  // Otherwise, check the next char
  return solveInner(cells, startCellIndex + 1, 0, remainingConditions, cache);
}

function parseInput(input: string): PuzzleMap {
  return input.split("\n").map((line) => {
    const [cells, condition] = line.split(" ");
    return {
      cells: cells.split("").map((char) => {
        switch (char) {
          case Cell.Operational:
            return Cell.Operational;
          case "#":
            return Cell.Damaged;
          case "?":
            return Cell.Unknown;
          default:
            throw new Error("Unknown cell type");
        }
      }),
      conditionRecord: condition.split(",").map(Number),
    };
  });
}

const map = parseInput(input);

let sum = 0;
for (const row of map) {
  sum += solve(row.cells, 0, 0, row.conditionRecord);
}
console.log(sum);

function expandMap(map: PuzzleMap): PuzzleMap {
  const newMap: PuzzleMap = [];
  for (const row of map) {
    const cells = [...row.cells];
    const conditionRecord = [...row.conditionRecord];
    for (let copied = 0; copied < 4; copied++) {
      cells.push(Cell.Unknown);
      cells.push(...row.cells);
      conditionRecord.push(...row.conditionRecord);
    }
    const newRow: Row = {
      cells,
      conditionRecord,
    };
    newMap.push(newRow);
  }
  return newMap;
}

const newMap = expandMap(map);
sum = 0;
for (const row of newMap) {
  //console.log(sum);
  sum += solve(row.cells, 0, 0, row.conditionRecord);
}
console.log(sum);

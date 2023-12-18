import { input } from "./input";

interface Step {
  chars: string[];
  prefix: string[];
  value: number;
}

type PuzzleMap = {
  steps: Step[];
};

function parseInput(input: string): PuzzleMap {
  return {
    steps: input.split(",").map((item) => {
      const groups = item.split("=");
      if (groups.length === 2) {
        return {
          chars: item.split(""),
          prefix: groups[0].split(""),
          value: Number(groups[1]),
        };
      } else {
        return {
          chars: item.split(""),
          prefix: groups[0].split("-"),
          value: NaN,
        };
      }
    }),
  };
}

function getAsciiCode(char: string): number {
  return char.charCodeAt(0);
}
function hash(step: Step, usePrefix = false): number {
  let value = 0;
  for (let i = 0; i < (usePrefix ? step.prefix : step.chars).length; i++) {
    value += getAsciiCode((usePrefix ? step.prefix : step.chars)[i]);
    value *= 17
    value = value % 256
  }
  return value;
}

let puzzle = parseInput(input);

let sum = 0;
for (let i = 0; i < puzzle.steps.length; i++) {
  sum += hash(puzzle.steps[i])
}
console.log(sum)

// Part 2
interface Box {
  lenses: Step[];
}

const boxes: Box[] = Array(256).fill(0).map(() => ({ lenses: [] }))
const focalLengthMap: Map<number, Step> = new Map()
const labelToBoxMap: Map<string, number> = new Map()
// Calculate all hashes
for (let i = 0; i < puzzle.steps.length; i++) {
  const step = puzzle.steps[i];
  const hashValue = hash(step, true)
  if (!isNaN(hashValue)) {
    labelToBoxMap.set(step.prefix.join(''), hashValue)
  }
}

for (let i = 0; i < puzzle.steps.length; i++) {
  const step = puzzle.steps[i];
  const boxId = labelToBoxMap.get(step.prefix.join(''))
  if (!boxId) {
    continue;
  }
  const box = boxes[boxId];
  if (isNaN(step.value)) {
    const index = box.lenses.findIndex((lens) => lens.prefix.join('') === step.prefix.join(''))
    if (index !== -1) {
      box.lenses.splice(index, 1)
    }
  } else {
    const existingLensIndex = box.lenses.findIndex((lens) => lens.prefix.join('') === step.prefix.join(''))
    if (existingLensIndex !== -1) {
      box.lenses.splice(existingLensIndex, 1, step)
    } else {
      box.lenses.push(step);
    }
  }
}

sum = 0;
for (let i = 0; i < boxes.length; i++) {
  const box = boxes[i];
  for (let j = 0; j < box.lenses.length; j++) {
    const lens = box.lenses[j];
    sum += (i + 1) * (j + 1) * lens.value;
  }
}

console.log(sum)
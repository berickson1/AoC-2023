import { input } from './input';

enum Cell {
    Space,
    Galaxy
}

interface Position {
    x: number;
    y: number;
}

type Map = Cell[][];

function parseInput(input: string): Map {
    return input.split('\n').map((line) => {
        return line.split('').map((char) => {
            switch (char) {
                case '.':
                    return Cell.Space;
                case '#':
                    return Cell.Galaxy;
                default:
                    throw new Error('Unknown cell type');
            }
        });
    });
}

const map = parseInput(input);
const blankRowIds: number[] = [];
// Track all blank rows
for (let i = 0; i < map.length; i++) {
    if (map[i].every((cell) => cell === Cell.Space)) {
        blankRowIds.push(i);
    }
}
// Expand all blank columns
const blankColumnIds: number[] = [];
for (let i = 0; i < map[0].length; i++) {
    if (map.every((row) => row[i] === Cell.Space)) {
        blankColumnIds.push(i);
    }
}

// Find all galaxy coordinates
const galaxyCoordinates: Position[] = [];
for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === Cell.Galaxy) {
            galaxyCoordinates.push({ x, y });
        }
    }
}

function distanceBetween(a: Position, b: Position, voidDistance = 1): number {
    const rawDistance = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const voidDistanceRows = blankRowIds.filter((rowId) => { return rowId > a.y && rowId < b.y || rowId > b.y && rowId < a.y });
    const voidDistanceColumns = blankColumnIds.filter((columnId) => { return columnId > a.x && columnId < b.x || columnId > b.x && columnId < a.x });
    return rawDistance + voidDistance * (voidDistanceRows.length + voidDistanceColumns.length);
}

// Find distance between each pair and add to sum
let sum = 0;
for (let i = 0; i < galaxyCoordinates.length; i++) {
    for (let j = i + 1; j < galaxyCoordinates.length; j++) {
        sum += distanceBetween(galaxyCoordinates[i], galaxyCoordinates[j], 1);
    }
}


console.log(sum);

sum = 0;
for (let i = 0; i < galaxyCoordinates.length; i++) {
    for (let j = i + 1; j < galaxyCoordinates.length; j++) {
        sum += distanceBetween(galaxyCoordinates[i], galaxyCoordinates[j], 1000000 - 1);
    }
}


console.log(sum);
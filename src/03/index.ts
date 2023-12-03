import { input } from './input';

type Part = { type: 'part', partId: number }
type RowItem = { type: 'none' } |
    Part |
{ type: 'symbol', value: string };

type RowInfo = RowItem[];

interface MapInfo {
    row: RowInfo[];
}

function getPartId(input: string, index: number): number {
    // Walk back from index to first non-number and forwards to last non-number
    let start = index;
    let end = index;
    while (start > 0 && input[start - 1] >= '0' && input[start - 1] <= '9') {
        start--;
    }
    while (end < input.length && input[end + 1] >= '0' && input[end + 1] <= '9') {
        end++;
    }
    return parseInt(input.substring(start, end + 1), 10);
}


function parseInput(input: string): MapInfo {
    const results: MapInfo = { row: [] };
    let rowId = -1;
    for (const line of input.split('\n')) {
        rowId++;
        const chars = line.split('');
        let partBeingCreated = undefined;
        for (let i = 0; i < chars.length; i++) {
            if (results.row[rowId] === undefined) {
                results.row[rowId] = [];
            }
            const char = chars[i];
            if (char === '.') {
                partBeingCreated = undefined;
                results.row[rowId].push({ type: 'none' });
            } else if (char < '0' || char > '9') {
                partBeingCreated = undefined;
                results.row[rowId].push({ type: 'symbol', value: char });
            } else {
                if (!partBeingCreated) {
                    partBeingCreated = { type: 'part', partId: getPartId(line, i) } as const;
                }

                results.row[rowId].push(partBeingCreated);
            }
        }
    }
    return results;
}

function getAdjacentParts(map: MapInfo, row: number, col: number): Part[] {
    const result: Set<Part> = new Set();
    // above
    if (row > 0) {
        const part = map.row[row - 1][col];
        if (part.type === 'part') {
            result.add(part);
        }
    }
    // top right
    if (row > 0 && col < map.row[row - 1].length - 1) {
        const part = map.row[row - 1][col + 1];
        if (part.type === 'part') {
            result.add(part);
        }
    }
    // top left
    if (row > 0 && col > 0) {
        const part = map.row[row - 1][col - 1];
        if (part.type === 'part') {
            result.add(part);
        }
    }

    // left
    if (col > 0) {
        const part = map.row[row][col - 1];
        if (part.type === 'part') {
            result.add(part);
        }
    }
    // right
    if (col < map.row[row].length - 1) {
        const part = map.row[row][col + 1];
        if (part.type === 'part') {
            result.add(part);
        }
    }

    // below
    if (row < map.row.length - 1) {
        const part = map.row[row + 1][col];
        if (part.type === 'part') {
            result.add(part);
        }
    }
    // bottom right
    if (row < map.row.length - 1 && col < map.row[row + 1].length - 1) {
        const part = map.row[row + 1][col + 1];
        if (part.type === 'part') {
            result.add(part);
        }
    }
    // bottom left
    if (row < map.row.length - 1 && col > 0) {
        const part = map.row[row + 1][col - 1];
        if (part.type === 'part') {
            result.add(part);
        }
    }
    return Array.from(result);
}

let potentialParts: Set<Part> = new Set();
parseInput(input).row.forEach((row, rowId) => {
    row.forEach((item, colId) => {
        if (item.type === 'symbol') {
            const adjacentParts = getAdjacentParts(parseInput(input), rowId, colId);
            for (const part of adjacentParts) {
                potentialParts.add(part);
            }
        }
    });
});

console.log(Array.from(potentialParts).map((x) => x.partId).reduce((a, b) => a + b, 0));


let potentialParts2: Set<number> = new Set();
parseInput(input).row.forEach((row, rowId) => {
    row.forEach((item, colId) => {
        if (item.type === 'symbol' && item.value === '*') {
            const adjacentParts = getAdjacentParts(parseInput(input), rowId, colId);
            if (adjacentParts.length === 2) {
                potentialParts2.add(adjacentParts[0].partId * adjacentParts[1].partId);
            }
        }
    });
});

console.log(Array.from(potentialParts2).reduce((a, b) => a + b, 0))
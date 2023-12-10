import { input } from './input';

enum TileType {
    VerticalPipe = '|',
    HorizontalPipe = '-',
    NEPipe = 'L',
    NWPipe = 'J',
    SWPipe = '7',
    SEPipe = 'F',
    Ground = '.',
    Start = 'S',
}

type Position = [row: number, col: number];


type Row = TileType[];
type Map = Row[];

function parseInput(input: string): Map {
    const map: Map = [];
    input.split('\n').forEach(row => {
        const cols = row.split('').map(val => val as TileType)
        map.push(cols);
    });
    return map;
}

function findNextPosition(map: Map, currentPosition: Position, fromPosition: Position): Position {
    const [row, col] = currentPosition;
    const [fromRow, fromCol] = fromPosition;
    let currentTile = map[row][col];
    if (currentTile === TileType.Start) {
        // P2 needs to infer tile type
        // Check right
        let hasRight = false, hasLeft = false, hasUp = false, hasDown = false;
        const right = map[row][col + 1];
        if (right === TileType.HorizontalPipe || right === TileType.NWPipe || right === TileType.SWPipe) {
            hasRight = true
        }
        // Check left
        const left = map[row][col - 1];
        if (left === TileType.HorizontalPipe || left === TileType.NEPipe || left === TileType.SEPipe) {
            hasLeft = true;
        }
        // Check down
        const down = map[row + 1]?.[col];
        if (down === TileType.VerticalPipe || down === TileType.NWPipe || down === TileType.NEPipe) {
            hasDown = true;
        }
        // Check up
        const up = map[row - 1]?.[col];
        if (up === TileType.VerticalPipe || up === TileType.SWPipe || up === TileType.SEPipe) {
            hasUp = true;
        }

        // determine Type
        let type: TileType;
        if (hasUp && hasDown) {
            type = TileType.VerticalPipe;
        } else if (hasLeft && hasRight) {
            type = TileType.HorizontalPipe;
        } else if (hasUp && hasRight) {
            type = TileType.NEPipe;
        } else if (hasUp && hasLeft) {
            type = TileType.NWPipe;
        } else if (hasDown && hasLeft) {
            type = TileType.SWPipe;
        } else if (hasDown && hasRight) {
            type = TileType.SEPipe;
        } else {
            throw new Error('Nothing found');
        }
        currentTile = type;
        map[row][col] = type;
    }
    if (currentTile === TileType.Ground) {
        throw new Error('Cannot move from ground');
    }
    if (currentTile === TileType.HorizontalPipe) {
        if (fromCol === col - 1) {
            return [row, col + 1];
        }
        return [row, col - 1];
    }
    if (currentTile === TileType.VerticalPipe) {
        if (fromRow === row - 1) {
            return [row + 1, col];
        }
        return [row - 1, col];
    }
    if (currentTile === TileType.NEPipe) {
        if (fromRow === row) {
            return [row - 1, col];
        }
        return [row, col + 1];
    }
    if (currentTile === TileType.NWPipe) {
        if (fromRow === row) {
            return [row - 1, col];
        }
        return [row, col - 1];
    }
    if (currentTile === TileType.SWPipe) {
        if (fromRow === row) {
            return [row + 1, col];
        }
        return [row, col - 1];
    }
    if (currentTile === TileType.SEPipe) {
        if (fromRow === row) {
            return [row + 1, col];
        }
        return [row, col + 1];
    }
    throw new Error('Unknown');
}

const map = parseInput(input)
let startRow = map.findIndex(row => row.includes(TileType.Start));
let startCol = map[startRow].findIndex(tile => tile === TileType.Start);

let previousPosition: Position = [startRow, startCol];
let currentPosition: Position = [startRow, startCol];
let loopLength = 0;
let tilePositions: Position[] = [];
do {
    tilePositions.push(currentPosition);
    const nextPosition = findNextPosition(map, currentPosition, previousPosition);
    previousPosition = currentPosition;
    currentPosition = nextPosition;
    loopLength++;
} while (!(currentPosition[0] === startRow && currentPosition[1] === startCol));

console.log(loopLength);
console.log('half: ', loopLength / 2);

const areaMask: boolean[][] = [];
// Fill in mask
for (let row = 0; row < map.length; row++) {
    areaMask.push([]);
    for (let col = 0; col < map[row].length; col++) {
        areaMask[row].push(true);
    }
}

// Find starting piece
for (let col = 0; col < map[0].length; col++) {
    if (tilePositions.some(pos => pos[0] === currentPosition[0] && pos[1] === col)) {
        currentPosition = [currentPosition[0], col];
        break;
    }
}

// Clear junk tiles
for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        const tileType = map[row][col];
        if (tileType !== TileType.Ground && !tilePositions.some(pos => pos[0] === row && pos[1] === col)) {
            map[row][col] = TileType.Ground;
        }
    }
}

function printMask(mask: boolean[][]) {
    //console.clear();;
    //console.log(mask.map(row => row.map(val => val ? '#' : '.').join('')).join('\n'));
}

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

function maybeMarkMask(map: Map, mask: boolean[][], position: Position, direction: Direction) {
    const [row, col] = position;
    if (direction === Direction.Up) {
        if (map[row - 1]?.[col] === TileType.Ground) {
            mask[row - 1][col] = false;
        }
    } else if (direction === Direction.Down) {
        if (map[row + 1]?.[col] === TileType.Ground) {
            mask[row + 1][col] = false;
        }
    } else if (direction === Direction.Left) {
        if (map[row][col - 1] === TileType.Ground) {
            mask[row][col - 1] = false;
        }
    } else if (direction === Direction.Right) {
        if (map[row][col + 1] === TileType.Ground) {
            mask[row][col + 1] = false;
        }
    }
}
function maybeMarkMaskDiagonal(map: Map, mask: boolean[][], position: Position, horizontalDirection: Direction, verticalDirection: Direction) {
    const [row, col] = position;

    maybeMarkMask(map, areaMask, currentPosition, horizontalDirection);
    maybeMarkMask(map, areaMask, currentPosition, verticalDirection);
    if (horizontalDirection === Direction.Left && verticalDirection === Direction.Up) {
        if (map[row - 1]?.[col - 1] === TileType.Ground) {
            mask[row - 1][col - 1] = false;
        }
    } else if (horizontalDirection === Direction.Left && verticalDirection === Direction.Down) {
        if (map[row + 1]?.[col - 1] === TileType.Ground) {
            mask[row + 1][col - 1] = false;
        }
    } else if (horizontalDirection === Direction.Right && verticalDirection === Direction.Up) {
        if (map[row - 1]?.[col + 1] === TileType.Ground) {
            mask[row - 1][col + 1] = false;
        }
    } else if (horizontalDirection === Direction.Right && verticalDirection === Direction.Down) {
        if (map[row + 1]?.[col + 1] === TileType.Ground) {
            mask[row + 1][col + 1] = false;
        }
    }
}
// Follow the outside of the loop (left of current position) and mark mask as false for outer side of tiles
previousPosition = currentPosition;
startRow = currentPosition[0];
startCol = currentPosition[1];
let outsidePosition: Direction = Direction.Left
do {
    const isStart = previousPosition === currentPosition;
    const tileType = map[currentPosition[0]][currentPosition[1]];

    maybeMarkMask(map, areaMask, currentPosition, outsidePosition);
    if (tileType === TileType.HorizontalPipe || tileType === TileType.VerticalPipe) {
        //nada
    } else if (tileType === TileType.NEPipe) {
        if (outsidePosition === Direction.Left || outsidePosition === Direction.Down) {
            if (!isStart) {
                if (outsidePosition === Direction.Left) {
                    outsidePosition = Direction.Down;
                } else {
                    outsidePosition = Direction.Left;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Left, Direction.Down);
        } else {
            if (!isStart) {
                if (outsidePosition === Direction.Up) {
                    outsidePosition = Direction.Right;
                } else {
                    outsidePosition = Direction.Up;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Right, Direction.Up);
        }
    } else if (tileType === TileType.NWPipe) {
        if (outsidePosition === Direction.Right || outsidePosition === Direction.Down) {
            if (!isStart) {
                if (outsidePosition === Direction.Right) {
                    outsidePosition = Direction.Down;
                } else {
                    outsidePosition = Direction.Right;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Right, Direction.Down);
        } else {
            if (!isStart) {
                if (outsidePosition === Direction.Up) {
                    outsidePosition = Direction.Left;
                } else {
                    outsidePosition = Direction.Up;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Left, Direction.Up);
        }
    } else if (tileType === TileType.SWPipe) {

        if (outsidePosition === Direction.Right || outsidePosition === Direction.Up) {
            if (!isStart) {
                if (outsidePosition === Direction.Right) {
                    outsidePosition = Direction.Up;
                } else {
                    outsidePosition = Direction.Right;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Right, Direction.Up);
        } else {

            if (!isStart) {
                if (outsidePosition === Direction.Down) {
                    outsidePosition = Direction.Left;
                } else {
                    outsidePosition = Direction.Down;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Left, Direction.Down);
        }
    } else if (tileType === TileType.SEPipe) {
        if (outsidePosition === Direction.Left || outsidePosition === Direction.Up) {
            if (!isStart) {
                if (outsidePosition === Direction.Left) {
                    outsidePosition = Direction.Up;
                } else {
                    outsidePosition = Direction.Left;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Left, Direction.Up);
        } else {

            if (!isStart) {
                if (outsidePosition === Direction.Down) {
                    outsidePosition = Direction.Right;
                } else {
                    outsidePosition = Direction.Down;
                }
            }
            maybeMarkMaskDiagonal(map, areaMask, currentPosition, Direction.Right, Direction.Down);
        }
    }

    const nextPosition = findNextPosition(map, currentPosition, previousPosition);
    previousPosition = currentPosition;
    currentPosition = nextPosition;
    printMask(areaMask);
} while (!(currentPosition[0] === startRow && currentPosition[1] === startCol));


// Mark all outside ground as false
for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        const tile = map[row][col];
        if (tile === TileType.Ground && (row === 0 || col === 0 || row === map.length - 1 || col === map[row].length - 1)) {
            areaMask[row][col] = false;
        }
    }
}
printMask(areaMask);

// propagate false values in areaMap to touching
let hasChanged = true;
while (hasChanged) {
    hasChanged = false;
    for (let row = 0; row < areaMask.length; row++) {
        for (let col = 0; col < areaMask[row].length; col++) {
            const tileType = map[row][col];
            if (tileType !== TileType.Ground) {
                continue;
            }
            if (areaMask[row][col]) {
                // Check up
                if (areaMask[row - 1]?.[col] === false) {
                    areaMask[row][col] = false;
                    hasChanged = true;
                }
                // Check down
                if (areaMask[row + 1]?.[col] === false) {
                    areaMask[row][col] = false;
                    hasChanged = true;
                }
                // Check left
                if (areaMask[row]?.[col - 1] === false) {
                    areaMask[row][col] = false;
                    hasChanged = true;
                }
                // Check right
                if (areaMask[row]?.[col + 1] === false) {
                    areaMask[row][col] = false;
                    hasChanged = true;
                }
            }
        }
    }
    printMask(areaMask);
}

// Mask all tiles
for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
        const tileType = map[row][col];
        if (tileType !== TileType.Ground) {
            areaMask[row][col] = false;
        }
    }
}
printMask(areaMask);

// Count all area mask true values
let count = 0;
for (let row = 0; row < areaMask.length; row++) {
    for (let col = 0; col < areaMask[row].length; col++) {
        if (areaMask[row][col]) {
            count++;
        }
    }
}

console.log('mask count: ', count)
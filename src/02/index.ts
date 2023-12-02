import { input } from './input';

interface GameInfo {
    id: number;
    maxRed: number;
    maxGreen: number;
    maxBlue: number;
}

function getColorInfo(color: string): { red: number, green: number, blue: number } {
    let info = { red: 0, green: 0, blue: 0 };
    color.split(',').forEach((x) => {
        if (x.includes('red')) {
            info.red = parseInt(x, 10)
        } else if (x.includes('green')) {
            info.green = parseInt(x, 10)
        } else if (x.includes('blue')) {
            info.blue = parseInt(x, 10)
        }
    });

    return info;
}

function parseInput(input: string): GameInfo[] {
    const results: GameInfo[] = [];
    for (const line of input.split('\n')) {
        const splitInput = line.split(':');
        const gameId = splitInput[0].substring(4)
        const reveled = splitInput[1].split(';').map((x) => x.trim());
        const result = {
            id: parseInt(gameId, 10),
            maxRed: 0,
            maxGreen: 0,
            maxBlue: 0,
        };
        for (const colorInfoString of reveled) {
            const colorInfo = getColorInfo(colorInfoString);
            if (colorInfo.red > result.maxRed) {
                result.maxRed = colorInfo.red;
            }
            if (colorInfo.green > result.maxGreen) {
                result.maxGreen = colorInfo.green;
            }
            if (colorInfo.blue > result.maxBlue) {
                result.maxBlue = colorInfo.blue;
            }
        }
        results.push(result);
    }
    return results;
}

function isValidGame(info: GameInfo): boolean {
    return info.maxRed <= 12 && info.maxGreen <= 13 && info.maxBlue <= 14;
}

console.log(parseInput(input).filter(isValidGame).map((x) => x.id).reduce((a, b) => a + b, 0))

console.log(parseInput(input).map((x) => x.maxBlue * x.maxGreen * x.maxRed).reduce((a, b) => a + b, 0))
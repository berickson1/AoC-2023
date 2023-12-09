import { input } from './input';

type Values = number[]

function parseInput(input: string): number[][] {
    return input.split('\n').map(line => {
        return line.split(' ').map(val => parseInt(val, 10))
    })
}

function getReadingDiff(input: Values): Values {
    const results = [];
    for (let i = 0; i < input.length - 1; i++) {
        results.push(input[i + 1] - input[i]);
    }
    return results;
}

function extrapolateNextValue(input: Values[]): number {
    let sum = 0;
    for (let i = input.length - 1; i >= 0; i--) {
        const values = input[i];
        sum += values[values.length - 1];
    }
    return sum;
}

function extrapolatePreviousValue(input: Values[]): number {
    let calculatedVal = 0
    for (let i = input.length - 1; i >= 0; i--) {
        const values = input[i];
        calculatedVal = values[0] - calculatedVal;
    }
    return calculatedVal;
}

const readings = parseInput(input);
let sum = 0
for (const reading of readings) {
    let allReadings = [[...reading]];
    let nextReading = getReadingDiff(allReadings[allReadings.length - 1]);
    while (nextReading.some(val => val !== 0)) {
        allReadings.push(nextReading);
        nextReading = getReadingDiff(allReadings[allReadings.length - 1]);
    }
    sum += extrapolateNextValue(allReadings);
}

console.log(sum)

sum = 0
for (const reading of readings) {
    let allReadings = [[...reading]];
    let nextReading = getReadingDiff(allReadings[allReadings.length - 1]);
    while (nextReading.some(val => val !== 0)) {
        allReadings.push(nextReading);
        nextReading = getReadingDiff(allReadings[allReadings.length - 1]);
    }
    sum += extrapolatePreviousValue(allReadings);
}
console.log(sum)
import { input } from './input';

function parseInput(input: string): number[] {
    const result: number[] = [];
    for (const line of input.split('\n')) {
        let numberChars: string[] = [];
        for (const char of line.split('')) {
            if (Number.isInteger(parseInt(char, 10))) {
                numberChars.push(char);
            }
        }
        if (numberChars.length === 1) {
            result.push(Number(numberChars[0] + numberChars[0]));
        } else {
            result.push(Number(numberChars[0] + numberChars[numberChars.length - 1]));
        }
    }
    return result;
}

const candidates = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
function parseInput2(input: string): number[] {
    const result: number[] = [];
    for (const line of input.split('\n')) {
        const candidateIndicies = [];
        for (const candidate of candidates) {
            let index = line.indexOf(candidate);
            if (index !== -1) {
                candidateIndicies.push(index);
            }
            index = line.lastIndexOf(candidate);
            if (index !== -1) {
                candidateIndicies.push(index);
            }
        }
        candidateIndicies.sort((a, b) => a - b);
        result.push(Number(
            // First num
            replaceStringNumberWithNumber(line.substring(candidateIndicies[0]))[0] +
            // Last Num
            replaceStringNumberWithNumber(line.substring(candidateIndicies[candidateIndicies.length - 1]))[0])
        );
    }
    return result;
}

const replacementPairs = [['one', '1'], ['two', '2'], ['three', '3'], ['four', '4'], ['five', '5'], ['six', '6'], ['seven', '7'], ['eight', '8'], ['nine', '9']];
function replaceStringNumberWithNumber(input: string): string {
    let match = false;
    do {
        match = false;
        let matchIndex = Number.MAX_SAFE_INTEGER;
        let matchReplacement;
        // Find the next eligible replacement pair
        for (const pair of replacementPairs) {
            const potentialMatchIndex = input.indexOf(pair[0]);
            if (potentialMatchIndex < matchIndex && potentialMatchIndex !== -1) {
                matchIndex = potentialMatchIndex;;
                matchReplacement = pair;
                match = true;
            }
        }
        if (matchReplacement) {
            input = input.replace(matchReplacement[0], matchReplacement[1]);
        }
    } while (match)
    return input;
}

const values = parseInput(input);
// sum all values
let sum1 = 0;
for (const value of values) {
    sum1 += value;
}
console.log(sum1)

const values2 = parseInput2(input);
// sum all values
let sum2 = 0;
for (const value of values2) {
    sum2 += value;
}
console.log(sum2)
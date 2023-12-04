import { input } from './input';

interface Card {
    id: number
    winningNumbers: Set<number>;
    myNumbers: Set<number>;
}

function parseInput(input: string): Card[] {
    const results: Card[] = [];
    for (const line of input.split('\n')) {
        const cardId = parseInt(line.substring(5, 8))
        const remainder = line.substring(9);
        const [rawWinners, rawNumbers] = remainder.replace(/  /g, ' ').split('|');
        results.push({
            id: cardId,
            myNumbers: new Set(rawNumbers.trim().split(' ').map(x => parseInt(x, 10))),
            winningNumbers: new Set(rawWinners.trim().split(' ').map(x => parseInt(x, 10))),
        })

    }
    return results;
}

function getMatchingCount(card: Card): number {
    let matchingCount = 0;
    for (const number of card.myNumbers) {
        if (card.winningNumbers.has(number)) {
            matchingCount++;
        }
    }
    return matchingCount;
}

function getScore(card: Card): number {
    let winnerCount = getMatchingCount(card);
    if (winnerCount === 0) {
        return 0;
    }
    return Math.pow(2, winnerCount - 1);
}

console.log(parseInput(input).map(getScore).reduce((a, b) => a + b, 0));

// Part 2
const cards = parseInput(input);
const extraCards: Card[] = [];

extraCards.push(...cards)

let handledCards = 0;
while (extraCards.length > 0) {
    handledCards++;
    const card = extraCards.pop()!;
    const winnerCount = getMatchingCount(card);
    if (winnerCount === 0) {
        continue;
    }
    for (let i = card.id; i < card.id + winnerCount; i++) {
        extraCards.push(cards[i]);
    }
}

console.log(handledCards);


import { input } from './input';

interface Bet {
    hand: Hand;
    betAmount: number;
}

enum Card {
    One = '1',
    Two = '2',
    Three = '3',
    Four = '4',
    Five = '5',
    Six = '6',
    Seven = '7',
    Eight = '8',
    Nine = '9',
    Ten = 'T',
    Jack = 'J',
    Queen = 'Q',
    King = 'K',
    Ace = 'A',
}


type Hand = [Card, Card, Card, Card, Card]

enum HandType {
    HighCard,
    OnePair,
    TwoPair,
    ThreeOfAKind,
    FullHouse,
    FourOfAKind,
    FiveOfAKind,
}

function getHandType(hand: Hand): HandType {
    const cardCounts = new Map<Card, number>();
    for (const card of hand) {
        cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
    }

    const counts = [...cardCounts.values()];

    if (cardCounts.size === 1) {
        return HandType.FiveOfAKind;
    }
    if (cardCounts.size === 2) {
        if (counts.includes(4)) {
            return HandType.FourOfAKind;
        }
        return HandType.FullHouse;
    }
    if (cardCounts.size === 3) {
        if (counts.includes(3)) {
            return HandType.ThreeOfAKind;
        }
        return HandType.TwoPair;
    }
    if (cardCounts.size === 4) {
        return HandType.OnePair;
    }
    return HandType.HighCard;
}

function getHandType2(hand: Hand): HandType {
    const wildCount = hand.filter(card => card === Card.Jack).length;
    const cardCounts = new Map<Card, number>();
    for (const card of hand) {
        // Exclude wilds
        if (card === Card.Jack) {
            continue;
        }
        cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
    }

    const counts = [...cardCounts.values()];

    if (cardCounts.size === 0) {
        return HandType.FiveOfAKind;
    }
    if (cardCounts.size === 1) {
        return HandType.FiveOfAKind;
    }
    if (cardCounts.size === 2) {
        if (counts.includes(4) || counts.includes(3) && wildCount === 1 || counts.includes(2) && wildCount === 2 || counts.includes(1) && wildCount === 3) {
            return HandType.FourOfAKind;
        }
        return HandType.FullHouse;
    }
    if (cardCounts.size === 3) {
        if (counts.includes(3) || counts.includes(2) && wildCount === 1 || counts.includes(1) && wildCount === 2) {
            return HandType.ThreeOfAKind;
        }
        return HandType.TwoPair;
    }
    if (cardCounts.size === 4) {
        return HandType.OnePair;
    }
    return HandType.HighCard;
}

function isCardHigher(firstCard: Card, secondCard: Card, part2 = false): boolean {
    if (firstCard === 'J' && secondCard!== 'J' && part2) {
        return false;
    }
    if (secondCard === 'J' && firstCard!== 'J' && part2) {
        return true;
    }
    const cardValues = Object.values(Card);
    const firstCardValue = cardValues.indexOf(firstCard);
    const secondCardValue = cardValues.indexOf(secondCard);
    return firstCardValue > secondCardValue;
}

function isFirstHandLarger(firstHand: Hand, secondHand: Hand, part2 = false): boolean {
    const firstHandType = (part2 ? getHandType2 : getHandType)(firstHand);
    const secondHandType = (part2 ? getHandType2 : getHandType)(secondHand);
    if (firstHandType > secondHandType) {
        return true;
    } else if (firstHandType === secondHandType) {
        for (let i = 0; i < firstHand.length; i++) {
            const cardHigher = isCardHigher(firstHand[i], secondHand[i], part2);
            if (cardHigher) {
                return true;
            } else if (!cardHigher && firstHand[i] !== secondHand[i]) {
                return false;
            }
        }
    }
    return false;
}

function parseInput(input: string): Bet[] {
    const bets = input.split('\n');
    return bets.map(bet => {
        const [handString, betAmountString] = bet.split(' ');
        const hand = handString.split('').map(card => card) as Hand;
        const betAmount = Number(betAmountString);
        return { hand, betAmount };
    });
}
{
    const bets = parseInput(input);
    bets.sort((a, b) => isFirstHandLarger(a.hand, b.hand) ? -1 : 1);

    let score = 0;
    for (let i = bets.length - 1; i >= 0; i--) {
        score += bets[i].betAmount * (bets.length - i);
    }
    console.log(score)
}
{
    const bets = parseInput(input);
    bets.sort((a, b) => isFirstHandLarger(a.hand, b.hand, true) ? -1 : 1);

    let score = 0;
    for (let i = bets.length - 1; i >= 0; i--) {
        score += bets[i].betAmount * (bets.length - i);
    }
    console.log(score)
}

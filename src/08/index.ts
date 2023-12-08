import { input } from './input';

interface Node {
    id: string;
    neighbours: readonly [left: string, right: string];
}

enum Instruction {
    Left = 'L',
    Right = 'R'
}

function parseInput(input: string): { instructions: Instruction[], nodes: Node[] } {
    const [instructionsString, nodesString] = input.split('\n\n');
    const instructions = instructionsString.split('').map(x => x === 'L' ? Instruction.Left : Instruction.Right);
    const nodes: Node[] = nodesString.split('\n').map(x => {
        const [id, left, right] = x.replace(/= \(/g, '').replace(/,/, '').replace(/\)/, '').split(' ');
        return {
            id,
            neighbours: [left, right]
        } as const;
    });

    return {
        instructions,
        nodes
    };
}
{
    const { instructions, nodes } = parseInput(input);
    const nodeMap = new Map<string, Node>(nodes.map(x => [x.id, x]));
    let currentNode = nodeMap.get('AAA')!;
    const endNode = nodeMap.get('ZZZ')!;
    let instructionQueue = [...instructions];

    let stepCount = 0;

    while (currentNode !== endNode) {
        const [left, right] = currentNode.neighbours;
        const instruction = instructionQueue.shift()!;

        currentNode = nodeMap.get(instruction === Instruction.Left ? left : right)!;

        if (instructionQueue.length === 0) {
            instructionQueue = [...instructions];
        }
        stepCount++;
    }

    console.log(stepCount)
}

function gcd(a: number, b: number): number {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}
{
    const { instructions, nodes } = parseInput(input);
    const nodeMap = new Map<string, Node>(nodes.map(x => [x.id, x]));
    let currentNodes = nodes.filter(x => x.id.endsWith('A'));
    let loopLength: number[] = [];


    // Determine how large the loop is for every node
    for (let i = 0; i < currentNodes.length; i++) {
        let firstNodeSteps = 0;
        let instructionQueue = [...instructions];
        let node = currentNodes[i];
        // loop until last node
        while (!node.id.endsWith('Z')) {
            const [left, right] = node.neighbours;
            node = nodeMap.get(instructionQueue.shift() === Instruction.Left ? left : right)!;
            if (instructionQueue.length === 0) {
                instructionQueue = [...instructions];
            }
            firstNodeSteps++;
        }
        loopLength.push(firstNodeSteps)

    }
    // Find lowest common multiple of all loop lengths
    let lcm = loopLength[0];
    for (let i = 1; i < loopLength.length; i++) {
        const loop = loopLength[i];
        lcm = (lcm * loop) / gcd(lcm, loop);
    }
    console.log(lcm);
}
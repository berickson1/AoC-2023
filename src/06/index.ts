import { input } from './input';

interface Race {
    time: number;
    maxDistance: number;
}

function parseInput(input: string): Race[] {
    const [timeString, distanceString] = input.split('\n');
    const time = timeString.split(/\s+/).slice(1).map(Number);
    const distance = distanceString.split(/\s+/).slice(1).map(Number);
    return time.map((time, index) => ({ time, maxDistance: distance[index] }));
}

function parseInput2(input: string): Race[] {
    const [timeString, distanceString] = input.replace('Time:', '').replace('Distance:', '').replace(/ +/g, '').split('\n');
    const time = timeString.split(/\s+/).map(Number);
    const distance = distanceString.split(/\s+/).map(Number);
    return time.map((time, index) => ({ time, maxDistance: distance[index] }));
}

function calculateDistance(race: Race, heldTime: number): number {
    const speed = heldTime;
    const distance = Math.max(0, (race.time - heldTime) * speed);
    return distance;
}



const raceData = parseInput(input);

const results = [];
for (const race of raceData) {
    let waysToBeat = 0;
    const raceTime = race.time;
    const distanceToBeat = race.maxDistance;

    for(var i = 0; i < raceTime; i++) {
        if (calculateDistance(race, i) > distanceToBeat) {
            waysToBeat++;
        }
    }
    results.push(waysToBeat);
    
}
console.log(results.reduce((a, b) => a * b, 1));


const raceData2 = parseInput2(input)[0]

    let waysToBeat = 0;
    const raceTime = raceData2.time;
    const distanceToBeat = raceData2.maxDistance;

    for(var i = 0; i < raceTime; i++) {
        if (calculateDistance(raceData2, i) > distanceToBeat) {
            waysToBeat++;
        }
    }
    
console.log(waysToBeat);
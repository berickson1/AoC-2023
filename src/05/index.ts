import { input } from './input';

type Seeds = number[];
type MapNotation = [dest: number, source: number, length: number];

const Seeds = new Set<number>();
const Seeds2Raw: number[] = [];
const SeedsRange: MapNotation[] = [];
const SeedToSoilMap: MapNotation[] = [];
const SoilToFertilizerMap: MapNotation[] = [];
const FertilizerToWaterMap: MapNotation[] = [];
const WaterToLightMap: MapNotation[] = [];
const LightToTemperatureMap: MapNotation[] = [];
const TemperatureToHumidityMap: MapNotation[] = [];
const HumidityToLocationMap: MapNotation[] = [];

function populateMap(map: MapNotation[], destinationRange: number, sourceRange: number, length: number): void {
    map.push([destinationRange, sourceRange, length]);
}

function convert(conversionMap: MapNotation[], value: number): number {
    for (const candidate of conversionMap) {
        const [dest, source, length] = candidate;
        if (value >= source && value < source + length) {
            return dest + (value - source);
        }
    }

    return value;
}

function backConvert(conversionMap: MapNotation[], destValue: number): number {
    for (const candidate of conversionMap) {
        const [dest, source, length] = candidate;
        if (destValue >= dest && destValue < dest + length) {
            return source + (destValue - dest);
        }
    }

    return destValue;
}

function convertSeedToLocation(seed: number): number {
    let value = seed;
    value = convert(SeedToSoilMap, value);
    value = convert(SoilToFertilizerMap, value);
    value = convert(FertilizerToWaterMap, value);
    value = convert(WaterToLightMap, value);
    value = convert(LightToTemperatureMap, value);
    value = convert(TemperatureToHumidityMap, value);
    value = convert(HumidityToLocationMap, value);
    return value;
}

function convertLocationToSeed(location: number): number {
    let value = location;
    value = backConvert(HumidityToLocationMap, value);
    value = backConvert(TemperatureToHumidityMap, value);
    value = backConvert(LightToTemperatureMap, value);
    value = backConvert(WaterToLightMap, value);
    value = backConvert(FertilizerToWaterMap, value);
    value = backConvert(SoilToFertilizerMap, value);
    value = backConvert(SeedToSoilMap, value);
    return value;
}

function parseInput(input: string): void {
    const [seedsRaw, seedToSoilRaw, soilToFertilizerRaw, fertilizerToWaterRaw, waterToLightRaw, lightToTemperatureRaw, temperatureToHumidityRaw, humidityToLocationRaw] = input.split('\n\n');
    seedsRaw.substring(7).split(' ').map(Number).forEach((seed) => Seeds.add(seed));

    // Part 2 parsing
    Seeds2Raw.push(...seedsRaw.substring(7).split(' ').map(Number));
    for (let i = 0; i < Seeds2Raw.length; i = i + 2) {
        const start = Seeds2Raw[i];
        const length = Seeds2Raw[i + 1];
        SeedsRange.push([start, start, length]);
    }

    const seedsToSoil = seedToSoilRaw.split('\n')
    seedsToSoil.shift();
    seedsToSoil.forEach((seedToSoil) => {
        populateMap(SeedToSoilMap, Number(seedToSoil.split(' ')[0]), Number(seedToSoil.split(' ')[1]), Number(seedToSoil.split(' ')[2]));
    });

    const soilToFertilizer = soilToFertilizerRaw.split('\n')
    soilToFertilizer.shift();
    soilToFertilizer.forEach((soilToFertilizer) => {
        populateMap(SoilToFertilizerMap, Number(soilToFertilizer.split(' ')[0]), Number(soilToFertilizer.split(' ')[1]), Number(soilToFertilizer.split(' ')[2]));
    });

    const fertilizerToWater = fertilizerToWaterRaw.split('\n')
    fertilizerToWater.shift();
    fertilizerToWater.forEach((fertilizerToWater) => {
        populateMap(FertilizerToWaterMap, Number(fertilizerToWater.split(' ')[0]), Number(fertilizerToWater.split(' ')[1]), Number(fertilizerToWater.split(' ')[2]));
    });

    const waterToLight = waterToLightRaw.split('\n')
    waterToLight.shift();
    waterToLight.forEach((waterToLight) => {
        populateMap(WaterToLightMap, Number(waterToLight.split(' ')[0]), Number(waterToLight.split(' ')[1]), Number(waterToLight.split(' ')[2]));
    });

    const lightToTemperature = lightToTemperatureRaw.split('\n')
    lightToTemperature.shift();
    lightToTemperature.forEach((lightToTemperature) => {
        populateMap(LightToTemperatureMap, Number(lightToTemperature.split(' ')[0]), Number(lightToTemperature.split(' ')[1]), Number(lightToTemperature.split(' ')[2]));
    });

    const temperatureToHumidity = temperatureToHumidityRaw.split('\n')
    temperatureToHumidity.shift();
    temperatureToHumidity.forEach((temperatureToHumidity) => {
        populateMap(TemperatureToHumidityMap, Number(temperatureToHumidity.split(' ')[0]), Number(temperatureToHumidity.split(' ')[1]), Number(temperatureToHumidity.split(' ')[2]));
    });

    const humidityToLocation = humidityToLocationRaw.split('\n')
    humidityToLocation.shift();
    humidityToLocation.forEach((humidityToLocation) => {
        populateMap(HumidityToLocationMap, Number(humidityToLocation.split(' ')[0]), Number(humidityToLocation.split(' ')[1]), Number(humidityToLocation.split(' ')[2]));
    });
}

parseInput(input);

let lowLocation = Number.MAX_SAFE_INTEGER;
for (const seed of Seeds) {
    const location = convertSeedToLocation(seed);
    if (location < lowLocation) {
        lowLocation = location;
    }
}

console.log(lowLocation);

function offsetWithinRange(value: number, range: MapNotation): number {
    const [_, source, length] = range;
    if (value >= source && value < source + length) {
        return value - source;
    }
    return -1;
}

function expandRange(inputRanges: MapNotation[], mapRanges: MapNotation[]): MapNotation[] {
    const outputRanges: MapNotation[] = [];
    for (const inputRange of inputRanges) {
        const [inputDest, inputSource, inputLength] = inputRange;
        // Find first map range that overlaps with input range
        for (let offset = 0; offset < inputLength; offset++) {
            let rangeFound = false;
            for (const mapRange of mapRanges) {
                const rangeOffset = offsetWithinRange(inputDest + offset, mapRange)
                if (rangeOffset === -1) {
                    continue;
                }
                let rangeValuesAbove = mapRange[2] - rangeOffset;
                let inputDestAbove = inputLength - offset;
                let offsetDelta = Math.min(rangeValuesAbove, inputDestAbove);
                outputRanges.push([mapRange[0] + rangeOffset, inputSource + offset, offsetDelta]);
                rangeFound = true;
                offset += offsetDelta - 1;
                break;
            }
            // No range found, create a new range returning to the original source
            if (!rangeFound) {
                // find next range start
                let nextRangeStart = inputDest + inputLength;
                for (const mapRange of mapRanges) {
                    const start = mapRange[1]
                    if (start < nextRangeStart && start > inputDest + offset) {
                        nextRangeStart = start;
                    }
                }
                outputRanges.push([inputDest + offset, inputSource + offset, nextRangeStart - inputDest - offset]);
                offset += nextRangeStart - inputDest - offset;
            }
        }



    }

    return outputRanges;
}

let currentMap = SeedsRange;
currentMap = expandRange(currentMap, SeedToSoilMap);
currentMap = expandRange(currentMap, SoilToFertilizerMap);
currentMap = expandRange(currentMap, FertilizerToWaterMap);
currentMap = expandRange(currentMap, WaterToLightMap);
currentMap = expandRange(currentMap, LightToTemperatureMap);
currentMap = expandRange(currentMap, TemperatureToHumidityMap);
currentMap = expandRange(currentMap, HumidityToLocationMap);

let lowLocation2 = Number.MAX_SAFE_INTEGER;
let lowSeed = Number.MAX_SAFE_INTEGER;
for (const range of currentMap) {
    const [dest, source] = range;
    if (dest < lowLocation2) {
        lowLocation2 = dest;
        lowSeed = source;
    }
}

console.log(lowLocation2);
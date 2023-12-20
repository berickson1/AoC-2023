import { input } from "./input";

enum ModuleType {
  FlipFlop,
  Conjunction,
  Broadcast,
  Button,
}

enum FlipFlopState {
  On,
  Off,
}

interface ModuleBase {
  id: string;
  type: ModuleType;
  destinationModules: string[];
}

interface FlipFlop extends ModuleBase {
  type: ModuleType.FlipFlop;
  state: FlipFlopState;
}

interface Conjunction extends ModuleBase {
  inputs: Map<string, PulseType>;
  type: ModuleType.Conjunction;
}

interface Broadcast extends ModuleBase {
  type: ModuleType.Broadcast;
}

type Module = FlipFlop | Conjunction | Broadcast;

enum PulseType {
  High,
  Low,
}

interface Pulse {
  sourceModuleId: string;
  destinationModuleIds: string[];
  type: PulseType;
}

function parseInput(input: string): Module[] {
  return input.split("\n").map((line) => {
    //&qq -> lm, gr, cv, vq, lp, pl, bt
    const [id, destinations] = line.split(" -> ");
    const destinationModules = destinations.split(", ");
    switch (id[0]) {
      case "&":
        return {
          type: ModuleType.Conjunction,
          destinationModules,
          id: id.substring(1),
          inputs: new Map<string, PulseType>(),
        };
      case "%":
        return {
          type: ModuleType.FlipFlop,
          destinationModules,
          id: id.substring(1),
          state: FlipFlopState.Off,
        };
      default:
        return {
          type: ModuleType.Broadcast,
          destinationModules,
          id: "broadcaster",
        };
    }
  });
}

function populateConjunctionInputs(modules: Module[]): void {
  for (const module of modules) {
    if (module.type === ModuleType.Conjunction) {
      const inputModules = modules.filter((m) =>
        m.destinationModules.includes(module.id)
      );
      for (const inputModule of inputModules) {
        module.inputs.set(inputModule.id, PulseType.Low);
      }
    }
  }
}

function sendPulse(
  modules: Module[],
  pulse: Pulse,
  buttonPresses = 0,
  p2 = false
): Pulse[] {
  const outboundPulses: Pulse[] = [];
  for (const moduleId of pulse.destinationModuleIds) {
    const module = modules.find((m) => m.id === moduleId);
    if (moduleId === "rx" && pulse.type === PulseType.Low) {
      //debugger;
    }

    if (p2) {
      let jm = modules.find((m) => m.id === "jm") as Conjunction;
      const highList = Array.from(jm.inputs.entries()).filter(
        (val) => val[1] === PulseType.High
      );
      for (const item of highList) {
        // lm 3851
        // dh 3889
        // sh 4027
        // db 4079
        //LCM = 246,006,621,493,687

        console.log(item[0], buttonPresses);
      }
    }
    if (!module) {
      continue;
    }
    switch (module.type) {
      case ModuleType.Broadcast:
        outboundPulses.push({
          destinationModuleIds: module.destinationModules,
          type: pulse.type,
          sourceModuleId: moduleId,
        });
        break;
      case ModuleType.Conjunction:
        module.inputs.set(pulse.sourceModuleId, pulse.type);
        // If all inputs are high, send low pulse
        if (
          Array.from(module.inputs.values()).every(
            (pulseType) => pulseType === PulseType.High
          )
        ) {
          outboundPulses.push({
            destinationModuleIds: module.destinationModules,
            type: PulseType.Low,
            sourceModuleId: moduleId,
          });
        } else {
          outboundPulses.push({
            destinationModuleIds: module.destinationModules,
            type: PulseType.High,
            sourceModuleId: moduleId,
          });
        }
        break;
      case ModuleType.FlipFlop:
        if (pulse.type === PulseType.Low) {
          if (module.state === FlipFlopState.Off) {
            module.state = FlipFlopState.On;
            outboundPulses.push({
              destinationModuleIds: module.destinationModules,
              type: PulseType.High,
              sourceModuleId: moduleId,
            });
          } else {
            module.state = FlipFlopState.Off;
            outboundPulses.push({
              destinationModuleIds: module.destinationModules,
              type: PulseType.Low,
              sourceModuleId: moduleId,
            });
          }
        }
        break;
      default:
        throw new Error("Unknown module");
    }
  }

  return outboundPulses;
}
{
  const allModules = parseInput(input);
  populateConjunctionInputs(allModules);

  let buttonPressCount = 0;
  const pulses: Pulse[] = [];
  let lowPulseCount = 0;
  let highPulseCount = 0;
  while (buttonPressCount < 1000) {
    buttonPressCount++;
    pulses.push({
      destinationModuleIds: ["broadcaster"],
      type: PulseType.Low,
      sourceModuleId: "button",
    });
    while (pulses.length > 0) {
      const pulse = pulses.shift();
      if (!pulse) {
        throw new Error("No pulse");
      }
      if (pulse.type === PulseType.Low) {
        lowPulseCount += pulse.destinationModuleIds.length;
      } else {
        highPulseCount += pulse.destinationModuleIds.length;
      }
      pulses.push(...sendPulse(allModules, pulse));
    }
  }

  console.log(lowPulseCount * highPulseCount);
}
{
  const allModules = parseInput(input);
  populateConjunctionInputs(allModules);

  let buttonPressCount = 0;
  const pulses: Pulse[] = [];

  while (true) {
    buttonPressCount++;
    pulses.push({
      destinationModuleIds: ["broadcaster"],
      type: PulseType.Low,
      sourceModuleId: "button",
    });
    while (pulses.length > 0) {
      const pulse = pulses.shift();
      if (!pulse) {
        throw new Error("No pulse");
      }
      pulses.push(...sendPulse(allModules, pulse, buttonPressCount, true));
    }
  }

  debugger;
}

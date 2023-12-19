import { input } from "./input";

type Rating = "x" | "m" | "a" | "s";

interface Workflow {
  name: string;
  conditions: WorkflowCondition[];
  elseDestinationWorkflow: string;
}

interface WorkflowCondition {
  rating: Rating;
  lessThan: boolean;
  targetValue: number;
  destinationWorkflow: string;
}

interface Part {
  x: number;
  m: number;
  a: number;
  s: number;
}

function parseInput(input: string): [Part[], Workflow[]] {
  const [workflowsRaw, partsRaw] = input.split("\n\n");
  const workflows: Workflow[] = workflowsRaw.split("\n").map((workflowRaw) => {
    // qqz{s>2770:qs,m<1801:hdj,R}
    let [name, rest] = workflowRaw.split("{");
    // s>2770:qs,m<1801:hdj,R
    rest = rest.substring(0, rest.length - 1);
    const conditions: WorkflowCondition[] = [];
    let conditionsRaw = rest.split(",");
    for (let i = 0; i < conditionsRaw.length - 1; i++) {
      const conditionPart = conditionsRaw[i];
      conditions.push({
        rating: conditionPart[0] as Rating,
        lessThan: conditionPart.includes("<"),
        destinationWorkflow: conditionPart.split(":")[1],
        targetValue: parseInt(conditionPart.split(/[<>]/)[1].split(":")[0], 10),
      });
    }
    return {
      name,
      conditions,
      elseDestinationWorkflow: conditionsRaw[conditionsRaw.length - 1],
    };
  });
  const parts: Part[] = partsRaw.split("\n").map((partRaw) => {
    //{x=2109,m=1575,a=528,s=1120}
    partRaw = partRaw.substring(1, partsRaw.length - 1);
    return {
      x: parseInt(partRaw.split(",")[0].split("=")[1], 10),
      m: parseInt(partRaw.split(",")[1].split("=")[1], 10),
      a: parseInt(partRaw.split(",")[2].split("=")[1], 10),
      s: parseInt(partRaw.split(",")[3].split("=")[1], 10),
    };
  });
  return [parts, workflows];
}

function meetsCondition(condition: WorkflowCondition, part: Part): boolean {
  if (
    (condition.lessThan && part[condition.rating] < condition.targetValue) ||
    (!condition.lessThan && part[condition.rating] > condition.targetValue)
  ) {
    return true;
  }
  return false;
}

function runWorkflowForPart(workflows: Workflow[], part: Part): boolean {
  let currentWorkflow: Workflow | undefined = workflows.find(
    (workflow) => workflow.name === "in"
  )!;
  while (currentWorkflow) {
    let workflowUpdated = false;
    for (const condition of currentWorkflow.conditions) {
      if (meetsCondition(condition, part)) {
        if (condition.destinationWorkflow === "R") {
          return false;
        }
        if (condition.destinationWorkflow === "A") {
          return true;
        }
        currentWorkflow = workflows.find(
          (workflow) => workflow.name === condition.destinationWorkflow
        )!;
        workflowUpdated = true;
        break;
      }
    }
    if (!workflowUpdated) {
      if (currentWorkflow.elseDestinationWorkflow === "R") {
        return false;
      }
      if (currentWorkflow.elseDestinationWorkflow === "A") {
        return true;
      }
      currentWorkflow = workflows.find(
        (workflow) => workflow.name === currentWorkflow!.elseDestinationWorkflow
      );
    }
  }
  debugger;
  return false;
}

let [parts, workflows] = parseInput(input);
const successParts = parts.filter((part) =>
  runWorkflowForPart(workflows, part)
);
console.log(
  successParts.reduce((acc, part) => acc + part.x + part.m + part.a + part.s, 0)
);

function simplifyWorkflows(workflows: Workflow[], first = true): Workflow[] {
  workflows = JSON.parse(JSON.stringify(workflows));
  // Find all workflows that have only R conditions
  const workflowsWithOnlyRConditions = workflows.filter(
    (workflow) =>
      workflow.conditions.every(
        (condition) => condition.destinationWorkflow === "R"
      ) && workflow.elseDestinationWorkflow === "R"
  );
  for (const workflow of workflowsWithOnlyRConditions) {
    // Find all workflows that have a condition pointing to this workflow and substitute it with R
    for (const otherWorkflow of workflows) {
      for (const condition of otherWorkflow.conditions) {
        if (condition.destinationWorkflow === workflow.name) {
          condition.destinationWorkflow = "R";
        }
      }
      if (otherWorkflow.elseDestinationWorkflow === workflow.name) {
        otherWorkflow.elseDestinationWorkflow = "R";
      }
    }
    workflows = workflows.filter((w) => w.name !== workflow.name);
  }
  // Find all workflows that have only A conditions
  const workflowsWithOnlyAConditions = workflows.filter(
    (workflow) =>
      workflow.conditions.every(
        (condition) => condition.destinationWorkflow === "A"
      ) && workflow.elseDestinationWorkflow === "A"
  );
  for (const workflow of workflowsWithOnlyAConditions) {
    // Find all workflows that have a condition pointing to this workflow and substitute it with A
    for (const otherWorkflow of workflows) {
      for (const condition of otherWorkflow.conditions) {
        if (condition.destinationWorkflow === workflow.name) {
          condition.destinationWorkflow = "A";
        }
      }
      if (otherWorkflow.elseDestinationWorkflow === workflow.name) {
        otherWorkflow.elseDestinationWorkflow = "A";
      }
    }
    workflows = workflows.filter((w) => w.name !== workflow.name);
  }

  // Prune the last condition if it is the same as the elseDestinationWorkflow
  let changed = true;
  while (changed) {
    changed = false;
    for (const workflow of workflows) {
      if (
        workflow.conditions.length > 0 &&
        workflow.conditions[workflow.conditions.length - 1]
          .destinationWorkflow === workflow.elseDestinationWorkflow
      ) {
        workflow.conditions.pop();
        changed = true;
      }
    }
  }

  // Find all workflows that only have static output conditions
  const workflowsWithOnlyStaticConditions = workflows.filter(
    (workflow) =>
      workflow.conditions.every(
        (condition) =>
          condition.destinationWorkflow === "A" ||
          condition.destinationWorkflow === "R"
      ) &&
      (workflow.elseDestinationWorkflow === "R" ||
        workflow.elseDestinationWorkflow === "A")
  );
  for (const workflow of workflowsWithOnlyStaticConditions) {
    // Find all workflows that have a condition pointing to this workflow and substitute
    for (const workflowToUpdate of workflows) {
      if (workflowToUpdate.elseDestinationWorkflow === workflow.name) {
        workflowToUpdate.elseDestinationWorkflow =
          workflow.elseDestinationWorkflow;
        workflowToUpdate.conditions.push(...workflow.conditions);
      }
    }
  }

  // Find all workflows with no conditions and hoist them
  const workflowsWithNoConditions = workflows.filter(
    (workflow) => workflow.conditions.length === 0
  );
  for (const workflow of workflowsWithNoConditions) {
    // Find all workflows that have a condition pointing to this workflow and substitute
    for (const workflowToUpdate of workflows) {
      if (workflowToUpdate.elseDestinationWorkflow === workflow.name) {
        workflowToUpdate.elseDestinationWorkflow =
          workflow.elseDestinationWorkflow;
      }
      for (const condition of workflowToUpdate.conditions) {
        if (condition.destinationWorkflow === workflow.name) {
          condition.destinationWorkflow = workflow.elseDestinationWorkflow;
        }
      }
    }
  }

  // Find all workflows where the last condition shares the same destination as the target elseDestinationWorkflow
  workflows.forEach((workflow) => {
    if (workflow.conditions.length === 0) {
      return;
    }
    const targetDest =
      workflow.conditions[workflow.conditions.length - 1].destinationWorkflow;
    if (targetDest === "A" || targetDest === "R") {
      return;
    }
    const targetWorkflow = workflows.find((w) => w.name === targetDest)!;
    if (!targetWorkflow) {
      return;
    }
    if (
      targetWorkflow.elseDestinationWorkflow ===
      workflow.elseDestinationWorkflow
    ) {
      workflow.conditions.pop();
      workflow.conditions.push(...targetWorkflow.conditions);
    }
  });

  // Find all workflows that are only used once
  const workflowsUsedOnce = workflows
    .map((workflow) => {
      const workflowsUsingThisWorkflow = workflows.filter(
        (w) =>
          w.conditions.some(
            (condition) => condition.destinationWorkflow === workflow.name
          ) || w.elseDestinationWorkflow === workflow.name
      );
      if (workflowsUsingThisWorkflow.length === 1) {
        return [workflow, workflowsUsingThisWorkflow[0]];
      }
      return undefined;
    })
    .filter((w) => w !== undefined) as [Workflow, Workflow][];
  // Update second workflow to add conditions for this workflow
  for (const [workflow, otherWorkflow] of workflowsUsedOnce) {
    if (otherWorkflow.elseDestinationWorkflow === workflow.name) {
      otherWorkflow.elseDestinationWorkflow = workflow.elseDestinationWorkflow;
      otherWorkflow.conditions.push(...workflow.conditions);
    }
  }

  // Remove all workflows that are not used
  workflows = workflows.filter(
    (workflow) =>
      workflow.name === "in" ||
      workflows.some(
        (w) =>
          w.conditions.some(
            (condition) => condition.destinationWorkflow === workflow.name
          ) || w.elseDestinationWorkflow === workflow.name
      )
  );

  if (first) {
    let workflowLength = workflows.length;
    do {
      workflowLength = workflows.length;
      workflows = simplifyWorkflows(workflows, false);
    } while (workflowLength !== workflows.length);
  }
  return workflows;
}

function narrowRange(
  range: Range,
  condition: WorkflowCondition
): [Range | undefined, Range] | [undefined, undefined] {
  if (condition.lessThan) {
    if (range[condition.rating][0] >= condition.targetValue) {
      return [undefined, range];
    }
    return [
      {
        ...range,
        [condition.rating]: [
          range[condition.rating][0],
          condition.targetValue - 1,
        ],
      },
      {
        ...range,
        [condition.rating]: [condition.targetValue, range[condition.rating][1]],
      },
    ];
  } else {
    if (range[condition.rating][1] <= condition.targetValue) {
      return [undefined, range];
    }
    return [
      {
        ...range,
        [condition.rating]: [
          condition.targetValue + 1,
          range[condition.rating][1],
        ],
      },
      {
        ...range,
        [condition.rating]: [range[condition.rating][0], condition.targetValue],
      },
    ];
  }
}

function acceptedRangesForWorkflow(
  workflows: Workflow[],
  startWorkflow: string,
  inputRange: Range
): Range[] {
  if (startWorkflow === "A") {
    return [inputRange];
  }
  if (startWorkflow === "R") {
    return [];
  }
  const workflow = workflows.find((w) => w.name === startWorkflow)!;
  const ranges: Range[] = [];
  let currentRange: Range | undefined = inputRange;
  for (const condition of workflow.conditions) {
    if (!currentRange) {
      break;
    }
    const [conditionRange, remainingRange] = narrowRange(
      currentRange,
      condition
    );
    if (conditionRange) {
      ranges.push(
        ...acceptedRangesForWorkflow(
          workflows,
          condition.destinationWorkflow,
          conditionRange
        )
      );
    }
    currentRange = remainingRange;
  }
  if (currentRange) {
    ranges.push(
      ...acceptedRangesForWorkflow(
        workflows,
        workflow.elseDestinationWorkflow,
        currentRange
      )
    );
  }
  return ranges;
}

type Range = {
  x: [number, number];
  m: [number, number];
  a: [number, number];
  s: [number, number];
};
let successCount = 0;
const successRanges = acceptedRangesForWorkflow(workflows, "in", {
  x: [1, 4000],
  m: [1, 4000],
  a: [1, 4000],
  s: [1, 4000],
});
for (const range of successRanges) {
  const xDelta = range.x[1] - range.x[0] + 1;
  const mDelta = range.m[1] - range.m[0] + 1;
  const aDelta = range.a[1] - range.a[0] + 1;
  const sDelta = range.s[1] - range.s[0] + 1;
  successCount += xDelta * mDelta * aDelta * sDelta;
}
console.log(successCount);

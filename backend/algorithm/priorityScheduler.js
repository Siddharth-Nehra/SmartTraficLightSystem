/**
 * Priority Scheduling Algorithm for Smart Traffic Light Control
 * Includes simulation modes, aging, and OS concept metadata.
 */

const WEIGHTS = {
  vehicles: 2,
  waitingTime: 1.5,
};

const EMERGENCY_BOOST = {
  ambulance: 1000,
  fire: 1100,
  police: 1050,
};

const MIN_GREEN = 10;
const MAX_GREEN = 20;
const YELLOW = 3;
const AGING_FACTOR = 0.05;
const STARVATION_WAIT_THRESHOLD = 45;

const SIMULATION_MODES = {
  normal: {
    label: "Normal Traffic",
    multiplier: 1,
    emergencyChance: 0.05,
    description: "Standard city traffic flow",
  },
  peak: {
    label: "Peak Hour",
    multiplier: 1.8,
    emergencyChance: 0.08,
    description: "Rush hour — heavy congestion on main roads",
  },
  emergency: {
    label: "Emergency Mode",
    multiplier: 1.2,
    emergencyChance: 0.55,
    forceEmergency: true,
    description: "Multiple emergency vehicles active",
  },
  rainy: {
    label: "Rainy Day",
    multiplier: 0.75,
    emergencyChance: 0.12,
    waitingMultiplier: 1.6,
    description: "Reduced speed, longer waiting times",
  },
  accident: {
    label: "Accident Mode",
    multiplier: 0.5,
    emergencyChance: 0.2,
    blockLane: true,
    description: "Lane blocked due to accident — rerouted traffic",
  },
};

const EMERGENCY_TYPES = ["ambulance", "fire", "police"];

function getEmergencyBoost(lane) {
  if (!lane.emergency && !lane.emergencyType) return 0;
  const type = lane.emergencyType || "ambulance";
  return EMERGENCY_BOOST[type] ?? EMERGENCY_BOOST.ambulance;
}

function applyAging(waitingTime, agingCycles = 0) {
  return waitingTime + agingCycles * AGING_FACTOR * waitingTime;
}

function calculatePriority(lane, agingCycles = 0) {
  const vehicles = Math.max(0, Number(lane.vehicles) || 0);
  const agedWait = applyAging(Math.max(0, Number(lane.waitingTime) || 0), agingCycles);
  const emergency = getEmergencyBoost(lane);

  return vehicles * WEIGHTS.vehicles + agedWait * WEIGHTS.waitingTime + emergency;
}

function calculateGreenDuration(priority, vehicles) {
  const base = MIN_GREEN + Math.floor(priority / 10);
  const vehicleBonus = Math.min(vehicles * 2, 20);
  return Math.min(MAX_GREEN, Math.max(MIN_GREEN, base + vehicleBonus));
}

function pickRandomEmergencyType() {
  return EMERGENCY_TYPES[Math.floor(Math.random() * EMERGENCY_TYPES.length)];
}

function generateRandomTraffic(modeName = "normal") {
  const mode = SIMULATION_MODES[modeName] || SIMULATION_MODES.normal;
  const multiplier = mode.multiplier ?? 1;
  const waitMult = mode.waitingMultiplier ?? 1;

  function laneTraffic(min, max) {
    const count = Math.floor((Math.random() * (max - min + 1) + min) * multiplier);
    return Math.min(50, Math.max(0, count));
  }

  const lanes = {
    north: { vehicles: laneTraffic(5, 22), waitingTime: 0, emergency: false, emergencyType: null },
    south: { vehicles: laneTraffic(12, 35), waitingTime: 0, emergency: false, emergencyType: null },
    east: { vehicles: laneTraffic(2, 14), waitingTime: 0, emergency: false, emergencyType: null },
    west: { vehicles: laneTraffic(8, 32), waitingTime: 0, emergency: false, emergencyType: null },
  };

  for (const name of Object.keys(lanes)) {
    lanes[name].waitingTime = Math.floor(
      lanes[name].vehicles * (1.5 + Math.random() * 2.5) * waitMult
    );
  }

  if (mode.blockLane) {
    const blocked = Object.keys(lanes)[Math.floor(Math.random() * 4)];
    lanes[blocked].vehicles = Math.min(lanes[blocked].vehicles, 2);
    lanes[blocked].waitingTime = Math.floor(lanes[blocked].waitingTime * 0.3);
    for (const name of Object.keys(lanes)) {
      if (name !== blocked) {
        lanes[name].vehicles = Math.min(50, lanes[name].vehicles + Math.floor(Math.random() * 8 + 4));
        lanes[name].waitingTime = Math.floor(lanes[name].waitingTime * 1.4);
      }
    }
  }

  const laneNames = Object.keys(lanes);
  if (mode.forceEmergency) {
    const count = Math.random() > 0.5 ? 2 : 1;
    const shuffled = [...laneNames].sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      lanes[shuffled[i]].emergency = true;
      lanes[shuffled[i]].emergencyType = pickRandomEmergencyType();
    }
  } else if (Math.random() < (mode.emergencyChance ?? 0.05)) {
    const lane = laneNames[Math.floor(Math.random() * laneNames.length)];
    lanes[lane].emergency = true;
    lanes[lane].emergencyType = pickRandomEmergencyType();
  }

  return lanes;
}

function buildOsConcepts(scored, winner, agingCycles) {
  const waitingQueue = scored
    .filter((l) => l.name !== winner.name)
    .map((l) => l.name.charAt(0).toUpperCase() + l.name.slice(1));

  const starvedLane = scored.find(
    (l) =>
      l.name !== winner.name &&
      l.waitingTime >= STARVATION_WAIT_THRESHOLD &&
      l.vehicles > 0 &&
      !l.emergency
  );

  return {
    algorithm: "Priority Scheduling",
    currentProcess: winner.name.charAt(0).toUpperCase() + winner.name.slice(1) + " Lane",
    processRank: 1,
    waitingQueue: waitingQueue.length ? waitingQueue : ["—"],
    starvation: starvedLane
      ? `Yes (${starvedLane.name.charAt(0).toUpperCase() + starvedLane.name.slice(1)})`
      : "No",
    aging: "Enabled",
    agingFactor: AGING_FACTOR,
    agingCycles,
    readyQueueSize: scored.filter((l) => l.vehicles > 0).length,
  };
}

function schedule(lanes, options = {}) {
  const laneNames = ["north", "south", "east", "west"];
  const agingCycles = options.agingCycles ?? 0;
  const mode = options.mode ?? "normal";

  const input = laneNames.map((name) => ({
    name,
    vehicles: lanes[name]?.vehicles ?? 0,
    waitingTime: lanes[name]?.waitingTime ?? 0,
    emergency: Boolean(lanes[name]?.emergency || lanes[name]?.emergencyType),
    emergencyType: lanes[name]?.emergencyType || null,
  }));

  const scored = input.map((lane) => ({
    ...lane,
    priority: calculatePriority(lane, agingCycles),
    rawPriority: calculatePriority(lane, 0),
  }));

  scored.sort((a, b) => b.priority - a.priority);
  const winner = scored[0];
  const greenDuration = calculateGreenDuration(winner.priority, winner.vehicles);

  const signals = {};
  for (const lane of laneNames) {
    signals[lane] = lane === winner.name ? "green" : "red";
  }

  const totalVehicles = input.reduce((sum, l) => sum + l.vehicles, 0);
  const avgWaiting =
    input.length > 0 ? input.reduce((sum, l) => sum + l.waitingTime, 0) / input.length : 0;

  const emergencyLanes = scored.filter((l) => l.emergency);
  const emergencyResponseTime =
    emergencyLanes.length > 0
      ? Math.max(0, Math.round((60 - winner.waitingTime) * 0.1 + YELLOW))
      : null;

  return {
    greenLane: winner.name,
    greenDuration,
    yellowDuration: YELLOW,
    signals,
    simulationMode: SIMULATION_MODES[mode]?.label ?? "Normal Traffic",
    priorities: scored.map(
      ({ name, priority, rawPriority, vehicles, waitingTime, emergency, emergencyType }, index) => ({
        lane: name,
        priority: Math.round(priority * 100) / 100,
        rawPriority: Math.round(rawPriority * 100) / 100,
        rank: index + 1,
        vehicles,
        waitingTime,
        emergency,
        emergencyType,
      })
    ),
    osConcepts: buildOsConcepts(scored, winner, agingCycles),
    statistics: {
      totalVehicles,
      averageWaitingTime: Math.round(avgWaiting * 10) / 10,
      emergencyLanes: emergencyLanes.length,
      emergencyResponseTime,
      cpuUtilizationEquivalent: Math.min(
        99,
        Math.round((winner.priority / (winner.priority + 100)) * 100)
      ),
      performanceScore: Math.min(
        100,
        Math.round(100 - avgWaiting * 0.8 + (emergencyLanes.length > 0 ? 10 : 0))
      ),
    },
    algorithm: "Priority Scheduling",
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  schedule,
  calculatePriority,
  calculateGreenDuration,
  generateRandomTraffic,
  SIMULATION_MODES,
  EMERGENCY_BOOST,
};

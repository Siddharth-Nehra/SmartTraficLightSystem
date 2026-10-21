const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "traffic_history.json");
const MAX_RECORDS = 200;

function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch {
    /* start fresh on corrupt file */
  }
  return { simulations: [], nextId: 1 };
}

function saveData(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function saveSimulation(result, lanes, mode = "normal") {
  const data = loadData();
  const priorityMap = Object.fromEntries(
    result.priorities.map((p) => [p.lane, p.priority])
  );

  data.simulations.unshift({
    id: data.nextId++,
    green_lane: result.greenLane,
    green_duration: result.greenDuration,
    mode,
    simulation_mode: result.simulationMode ?? mode,
    total_vehicles: result.statistics?.totalVehicles ?? 0,
    avg_waiting: result.statistics?.averageWaitingTime ?? 0,
    emergency_response: result.statistics?.emergencyResponseTime,
    performance: result.statistics?.performanceScore ?? 0,
    north_vehicles: lanes.north?.vehicles ?? 0,
    south_vehicles: lanes.south?.vehicles ?? 0,
    east_vehicles: lanes.east?.vehicles ?? 0,
    west_vehicles: lanes.west?.vehicles ?? 0,
    north_priority: priorityMap.north ?? 0,
    south_priority: priorityMap.south ?? 0,
    east_priority: priorityMap.east ?? 0,
    west_priority: priorityMap.west ?? 0,
    created_at: new Date().toISOString(),
  });

  if (data.simulations.length > MAX_RECORDS) {
    data.simulations = data.simulations.slice(0, MAX_RECORDS);
  }

  saveData(data);
  return { lastInsertRowid: data.simulations[0].id };
}

function fetchHistory(limit = 20) {
  const data = loadData();
  return data.simulations.slice(0, limit);
}

function clearHistory() {
  saveData({ simulations: [], nextId: 1 });
}

module.exports = { saveSimulation, fetchHistory, clearHistory };

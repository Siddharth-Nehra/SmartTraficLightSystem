// LANES and EMERGENCY_ICONS are already declared in map.js
const EMERGENCY_LABELS = {
  ambulance: "Ambulance",
  fire: "Fire Truck",
  police: "Police",
};

const MODE_DESCRIPTIONS = {
  normal: "Standard city traffic flow",
  peak: "Rush hour — heavy congestion on main roads",
  emergency: "Multiple emergency vehicles active",
  rainy: "Reduced speed, longer waiting times",
  accident: "Lane blocked due to accident — rerouted traffic",
};

let cityMap = null;
let selectedLane = "north";
let currentMode = "normal";
let agingCycles = 0;
let autoInterval = null;
let countdownInterval = null;
let clockInterval = null;
let healthInterval = null;
let lastResult = null;

const sessionStats = {
  totalVehiclesProcessed: 0,
  waitingTimeSum: 0,
  waitingTimeCount: 0,
  emergencyVehiclesServed: 0,
  signalChanges: 0,
  sessionStart: Date.now(),
  busyTime: 0,
  cpuReadings: [],
  lastEmergencyResponse: null,
  lastPerformance: 0,
  lastStarvation: "No",
  lastAging: "Enabled",
};

const runBtn = document.getElementById("runBtn");
const autoBtn = document.getElementById("autoBtn");
const stopBtn = document.getElementById("stopBtn");
const generateTrafficBtn = document.getElementById("generateTrafficBtn");
const connectionStatus = document.getElementById("connectionStatus");
const eventLog = document.getElementById("eventLog");
const emergencyPopup = document.getElementById("emergencyPopup");

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function addLog(message, type = "info") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">${nowTime()}</span><span class="log-msg">${message}</span>`;
  eventLog.prepend(entry);
  while (eventLog.children.length > 50) {
    eventLog.removeChild(eventLog.lastChild);
  }
}

function showEmergencyPopup(lane, type, greenLane) {
  document.getElementById("popupIcon").textContent = EMERGENCY_ICONS[type] || "🚑";
  document.getElementById("popupMessage").textContent = `${EMERGENCY_LABELS[type] || "Emergency"} detected on ${lane} lane — Priority Updated`;
  document.getElementById("popupGreen").textContent = `${greenLane.charAt(0).toUpperCase() + greenLane.slice(1)} gets Green Signal`;
  emergencyPopup.classList.remove("hidden");
}

document.getElementById("popupClose").addEventListener("click", () => {
  emergencyPopup.classList.add("hidden");
});

function getLaneData() {
  const lanes = {};
  for (const lane of LANES) {
    const emergencyType = document.querySelector(`[name="${lane}-emergency"]`).value || null;
    lanes[lane] = {
      vehicles: parseInt(document.querySelector(`[name="${lane}-vehicles"]`).value, 10) || 0,
      waitingTime: parseInt(document.querySelector(`[name="${lane}-waiting"]`).value, 10) || 0,
      emergency: Boolean(emergencyType),
      emergencyType,
    };
  }
  return lanes;
}

function setLaneData(lanes) {
  for (const lane of LANES) {
    document.querySelector(`[name="${lane}-vehicles"]`).value = lanes[lane].vehicles;
    document.querySelector(`[name="${lane}-waiting"]`).value = lanes[lane].waitingTime;
    document.querySelector(`[name="${lane}-emergency"]`).value = lanes[lane].emergencyType || "";
    document.getElementById(`input-${lane}`).textContent = lanes[lane].vehicles;
  }
  updateLiveQueues(lanes);
  cityMap?.updateVehicles(lanes);
}

function buildQueueEmojis(lane) {
  const vehicles = parseInt(document.querySelector(`[name="${lane}-vehicles"]`).value, 10) || 0;
  const emergencyType = document.querySelector(`[name="${lane}-emergency"]`).value;
  let emojis = "";
  if (emergencyType) {
    emojis += EMERGENCY_ICONS[emergencyType] || "🚑";
  }
  const carCount = emergencyType ? Math.max(0, vehicles - 1) : vehicles;
  emojis += "🚗".repeat(Math.min(carCount, 30));
  if (carCount > 30) emojis += ` +${carCount - 30}`;
  return emojis || '<span class="empty-queue">—</span>';
}

function updateLiveQueues(lanes) {
  for (const lane of LANES) {
    document.getElementById(`queue-${lane}`).innerHTML = buildQueueEmojis(lane);
    document.querySelector(`.queue-row[data-lane="${lane}"]`).classList.toggle(
      "has-emergency",
      Boolean(lanes?.[lane]?.emergencyType || document.querySelector(`[name="${lane}-emergency"]`).value)
    );
  }
}

function updateOsPanel(os, result) {
  if (!os) return;
  document.getElementById("osAlgorithm").textContent = os.algorithm || "Priority Scheduling";
  document.getElementById("osProcess").textContent = os.currentProcess || "—";
  document.getElementById("osPriority").textContent = os.processRank ?? "—";
  document.getElementById("osWaitingQueue").textContent = Array.isArray(os.waitingQueue)
    ? os.waitingQueue.join(", ")
    : os.waitingQueue || "—";
  document.getElementById("osStarvation").textContent = os.starvation || "No";
  document.getElementById("osStarvation").classList.toggle("os-warning", String(os.starvation).startsWith("Yes"));
  document.getElementById("osAging").textContent = os.aging || "Enabled";

  if (result?.greenLane) {
    document.getElementById("activeLane").textContent = result.greenLane;
  }
  if (result?.simulationMode) {
    document.getElementById("activeMode").textContent = result.simulationMode;
  }
}

function setTrafficLight(lane, color) {
  const container = document.getElementById(`light-${lane}`);
  container.querySelectorAll(".light").forEach((light) => {
    light.classList.remove("active");
    if (light.classList.contains(color)) light.classList.add("active");
  });
  cityMap?.setSignal(lane, color);
}

function setAllSignals(signals) {
  for (const lane of LANES) setTrafficLight(lane, signals[lane]);
}

function updateStats(result, lanes) {
  const greenLaneData = lanes[result.greenLane];
  sessionStats.totalVehiclesProcessed += greenLaneData?.vehicles ?? 0;
  sessionStats.waitingTimeSum += LANES.reduce((s, l) => s + (lanes[l].waitingTime || 0), 0);
  sessionStats.waitingTimeCount += LANES.length;
  sessionStats.signalChanges += 1;

  if (greenLaneData?.emergencyType) {
    sessionStats.emergencyVehiclesServed += 1;
  }

  sessionStats.busyTime += result.greenDuration + result.yellowDuration;
  sessionStats.cpuReadings.push(result.statistics?.cpuUtilizationEquivalent ?? 0);
  sessionStats.lastEmergencyResponse = result.statistics?.emergencyResponseTime;
  sessionStats.lastPerformance = result.statistics?.performanceScore ?? 0;
  sessionStats.lastStarvation = result.osConcepts?.starvation || "No";
  sessionStats.lastAging = result.osConcepts?.aging || "Enabled";

  const elapsedMin = (Date.now() - sessionStats.sessionStart) / 60000 || 1;
  const avgWait =
    sessionStats.waitingTimeCount > 0
      ? sessionStats.waitingTimeSum / sessionStats.waitingTimeCount
      : 0;
  const throughput = Math.round(sessionStats.totalVehiclesProcessed / elapsedMin);
  const cpuAvg =
    sessionStats.cpuReadings.length > 0
      ? Math.round(
          sessionStats.cpuReadings.reduce((a, b) => a + b, 0) / sessionStats.cpuReadings.length
        )
      : 0;

  document.getElementById("statVehicles").textContent = sessionStats.totalVehiclesProcessed;
  document.getElementById("statWait").textContent = `${avgWait.toFixed(1)}s`;
  document.getElementById("statEmergency").textContent = sessionStats.emergencyVehiclesServed;
  document.getElementById("statSignals").textContent = sessionStats.signalChanges;
  document.getElementById("statThroughput").textContent = throughput;
  document.getElementById("statCpu").textContent = `${cpuAvg}%`;

  updateCpuChart(sessionStats.cpuReadings);
}

function renderResult(result, lanes) {
  lastResult = result;
  const tbody = document.getElementById("priorityTableBody");
  tbody.innerHTML = result.priorities
    .map((p) => {
      const emergencyDisplay = p.emergencyType
        ? `${EMERGENCY_ICONS[p.emergencyType]} ${EMERGENCY_LABELS[p.emergencyType]}`
        : "—";
      const queueEmojis = (() => {
        let e = p.emergencyType ? EMERGENCY_ICONS[p.emergencyType] : "";
        e += "🚗".repeat(Math.min(p.emergencyType ? p.vehicles - 1 : p.vehicles, 8));
        if (p.vehicles > 8) e += "…";
        return e;
      })();
      return `<tr class="${p.lane === result.greenLane ? "winner-row" : ""}">
        <td><strong>#${p.rank}</strong></td>
        <td style="text-transform:capitalize">${p.lane}</td>
        <td class="queue-cell">${queueEmojis}</td>
        <td>${p.waitingTime}</td>
        <td>${emergencyDisplay}</td>
        <td><strong>${p.priority}</strong></td>
        <td><span class="signal-badge ${result.signals[p.lane]}">${result.signals[p.lane]}</span></td>
      </tr>`;
    })
    .join("");

  document.querySelectorAll(".lane-card").forEach((card) => {
    card.classList.toggle("winner", card.dataset.lane === result.greenLane);
  });

  updateOsPanel(result.osConcepts, result);
  updatePriorityChart(result.priorities);
  updateVehicleChart(result.priorities);
  updateStats(result, lanes);
}

function runSignalCycle(greenLane, greenDuration, yellowDuration, lanes) {
  clearInterval(countdownInterval);

  addLog(`Signal change initiated — evaluating ${greenLane} lane`, "signal");
  setAllSignals(Object.fromEntries(LANES.map((l) => [l, l === greenLane ? "yellow" : "red"])));

  let yellowLeft = yellowDuration;
  document.getElementById("timerValue").textContent = `${yellowLeft}s`;
  cityMap?.startMovement(greenLane, "yellow");

  countdownInterval = setInterval(() => {
    yellowLeft -= 1;
    document.getElementById("timerValue").textContent = `${Math.max(0, yellowLeft)}s`;
    if (yellowLeft <= 0) {
      clearInterval(countdownInterval);
      setAllSignals(Object.fromEntries(LANES.map((l) => [l, l === greenLane ? "green" : "red"])));
      addLog(`${greenLane} lane — GREEN signal active`, "green");
      cityMap?.startMovement(greenLane, "green");

      if (lanes[greenLane]?.emergencyType) {
        cityMap?.animateEmergency(greenLane, lanes[greenLane].emergencyType);
      }

      let greenLeft = greenDuration;
      document.getElementById("timerValue").textContent = `${greenLeft}s`;

      countdownInterval = setInterval(() => {
        greenLeft -= 1;
        document.getElementById("timerValue").textContent = `${Math.max(0, greenLeft)}s`;
        if (greenLeft <= 0) {
          clearInterval(countdownInterval);
          for (const lane of LANES) setTrafficLight(lane, "red");
          cityMap?.stopMovement();
          document.getElementById("activeLane").textContent = "—";
          document.getElementById("timerValue").textContent = "—";
          addLog(`Green phase complete — ${greenLane} lane vehicles processed`, "info");
        }
      }, 1000);
    }
  }, 1000);
}

const LOCAL_WEIGHTS = { vehicles: 2, waitingTime: 1.5 };
const LOCAL_EMERGENCY_BOOST = { ambulance: 1000, fire: 1100, police: 1050 };
const localHistory = [];

function clientCalculatePriority(laneData, aging) {
  const vehicles = Math.max(0, Number(laneData.vehicles) || 0);
  const wait = Math.max(0, Number(laneData.waitingTime) || 0);
  const agedWait = wait + aging * 0.05 * wait;
  const emergencyType = laneData.emergencyType;
  const boost = emergencyType ? (LOCAL_EMERGENCY_BOOST[emergencyType] || 1000) : 0;
  return vehicles * LOCAL_WEIGHTS.vehicles + agedWait * LOCAL_WEIGHTS.waitingTime + boost;
}

function clientSimulate(lanes, mode, aging) {
  const laneNames = ["north", "south", "east", "west"];
  const scored = laneNames.map((name) => {
    const l = lanes[name] || {};
    const priority = clientCalculatePriority(l, aging);
    return {
      lane: name,
      vehicles: Number(l.vehicles) || 0,
      waitingTime: Number(l.waitingTime) || 0,
      emergency: Boolean(l.emergencyType),
      emergencyType: l.emergencyType || null,
      priority: Math.round(priority * 100) / 100,
    };
  });

  scored.sort((a, b) => b.priority - a.priority);
  scored.forEach((item, idx) => { item.rank = idx + 1; });

  const winner = scored[0];
  const greenDuration = Math.min(20, Math.max(10, 10 + Math.floor(winner.priority / 10) + Math.min(winner.vehicles * 2, 20)));

  const signals = {};
  for (const name of laneNames) {
    signals[name] = name === winner.lane ? "green" : "red";
  }

  const waitingQueue = scored.filter(l => l.lane !== winner.lane).map(l => l.lane.charAt(0).toUpperCase() + l.lane.slice(1));
  const starved = scored.find(l => l.lane !== winner.lane && l.waitingTime >= 45 && l.vehicles > 0 && !l.emergency);

  const totalVehicles = scored.reduce((a, b) => a + b.vehicles, 0);
  const avgWaiting = Math.round((scored.reduce((a, b) => a + b.waitingTime, 0) / 4) * 10) / 10;

  const resultObj = {
    greenLane: winner.lane,
    greenDuration,
    yellowDuration: 3,
    signals,
    simulationMode: MODE_DESCRIPTIONS[mode] ? mode.charAt(0).toUpperCase() + mode.slice(1) + " Traffic" : "Normal Traffic",
    priorities: scored,
    osConcepts: {
      algorithm: "Priority Scheduling",
      currentProcess: winner.lane.charAt(0).toUpperCase() + winner.lane.slice(1) + " Lane",
      processRank: 1,
      waitingQueue: waitingQueue.length ? waitingQueue : ["—"],
      starvation: starved ? `Yes (${starved.lane.charAt(0).toUpperCase() + starved.lane.slice(1)})` : "No",
      aging: "Enabled",
    },
    statistics: {
      totalVehicles,
      averageWaitingTime: avgWaiting,
      emergencyLanes: scored.filter(l => l.emergency).length,
      emergencyResponseTime: winner.emergency ? 3 : null,
      cpuUtilizationEquivalent: Math.min(99, Math.round((winner.priority / (winner.priority + 100)) * 100)),
      performanceScore: Math.min(100, Math.max(0, Math.round(100 - avgWaiting * 0.8))),
    }
  };

  const historyPoint = {
    north_priority: scored.find(p => p.lane === "north")?.priority || 0,
    south_priority: scored.find(p => p.lane === "south")?.priority || 0,
    east_priority: scored.find(p => p.lane === "east")?.priority || 0,
    west_priority: scored.find(p => p.lane === "west")?.priority || 0,
  };
  localHistory.unshift(historyPoint);
  if (localHistory.length > 15) localHistory.pop();

  return resultObj;
}

function clientGenerateTraffic(mode) {
  const mult = mode === "peak" ? 1.5 : mode === "rainy" ? 0.8 : 1;
  const lanes = {
    north: { vehicles: Math.floor((Math.random() * 15 + 5) * mult), waitingTime: Math.floor(Math.random() * 30 + 10), emergencyType: null },
    south: { vehicles: Math.floor((Math.random() * 20 + 8) * mult), waitingTime: Math.floor(Math.random() * 40 + 15), emergencyType: null },
    east: { vehicles: Math.floor((Math.random() * 12 + 3) * mult), waitingTime: Math.floor(Math.random() * 25 + 5), emergencyType: null },
    west: { vehicles: Math.floor((Math.random() * 25 + 10) * mult), waitingTime: Math.floor(Math.random() * 50 + 20), emergencyType: null },
  };
  if (mode === "emergency") {
    lanes.south.emergencyType = "ambulance";
  } else if (Math.random() < 0.2) {
    const keys = ["north", "south", "east", "west"];
    lanes[keys[Math.floor(Math.random() * 4)]].emergencyType = "ambulance";
  }
  return lanes;
}

async function runSimulation(showPopup = true) {
  runBtn.disabled = true;
  const lanes = getLaneData();
  updateLiveQueues(lanes);

  const emergencyLane = LANES.find((l) => lanes[l].emergencyType);
  if (emergencyLane) {
    addLog(`${EMERGENCY_LABELS[lanes[emergencyLane].emergencyType]} detected on ${emergencyLane} lane`, "emergency");
  }

  addLog(`Priority scheduling running (${currentMode} mode)...`, "info");

  let result;
  try {
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lanes, mode: currentMode, agingCycles }),
    });
    if (!res.ok) throw new Error("Simulation failed");
    const data = await res.json();
    result = data.result;
    setConnectionStatus(true);
  } catch (err) {
    result = clientSimulate(lanes, currentMode, agingCycles);
    setConnectionStatus(true, true);
  }

  agingCycles += 1;

  for (const p of result.priorities) {
    addLog(`${p.lane} lane priority updated → ${p.priority} (rank #${p.rank})`, "priority");
  }

  if (emergencyLane && showPopup) {
    showEmergencyPopup(emergencyLane, lanes[emergencyLane].emergencyType, result.greenLane);
  }

  addLog(`Signal changed — ${result.greenLane} gets GREEN (${result.greenDuration}s)`, "signal");
  renderResult(result, lanes);
  runSignalCycle(result.greenLane, result.greenDuration, result.yellowDuration, lanes);
  await loadHistory();
  runBtn.disabled = false;
}

async function generateRandomTraffic() {
  generateTrafficBtn.disabled = true;
  addLog(`Generating traffic for ${currentMode} mode...`, "info");

  try {
    const res = await fetch(`${API_BASE}/api/generate-traffic?mode=${currentMode}`);
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    setLaneData(data.lanes);
  } catch {
    const lanes = clientGenerateTraffic(currentMode);
    setLaneData(lanes);
  } finally {
    const lanes = getLaneData();
    const preview = LANES.map(
      (l) => `<span><b>${l.charAt(0).toUpperCase() + l.slice(1)}</b>: ${lanes[l].vehicles}</span>`
    ).join("");
    document.getElementById("generatedPreview").innerHTML = preview;

    for (const lane of LANES) {
      addLog(`${lane} lane traffic generated — ${lanes[lane].vehicles} vehicles`, "info");
    }
    generateTrafficBtn.disabled = false;
  }
}

async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/api/history?limit=15`);
    if (res.ok) {
      const data = await res.json();
      if (data.history?.length) {
        updateHistoryChart(data.history);
        return;
      }
    }
  } catch (err) {
    // Fallback to local history
  }
  if (localHistory.length) {
    updateHistoryChart(localHistory);
  }
}

function setConnectionStatus(connected, local = false) {
  connectionStatus.classList.remove("connected", "error", "connecting");
  connectionStatus.classList.add("connected");
  if (local) {
    connectionStatus.innerHTML = '<span class="status-dot"></span> Engine Active';
  } else {
    connectionStatus.innerHTML = '<span class="status-dot"></span> Server Connected';
  }
}

async function checkHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      setConnectionStatus(true, false);
      return true;
    }
    throw new Error("Offline");
  } catch {
    setConnectionStatus(true, true);
    return false;
  }
}

function startHealthMonitor() {
  if (healthInterval) return;
  checkHealth();
  healthInterval = setInterval(checkHealth, 15000);
}

function toggleAutoSimulate() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    autoBtn.textContent = "Auto Simulate";
    addLog("Auto simulation stopped", "info");
  } else {
    autoBtn.textContent = "Stop Auto";
    addLog(`Auto simulation started (${currentMode} mode)`, "info");
    autoInterval = setInterval(async () => {
      await generateRandomTraffic();
      await runSimulation(false);
    }, 12000);
    generateRandomTraffic().then(() => runSimulation(false));
  }
}

function stopSimulation() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    autoBtn.textContent = "Auto Simulate";
    addLog("Auto simulation stopped", "info");
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  // Clear any map movements or timers
  for (const lane of LANES) {
    setTrafficLight(lane, "red");
  }
  cityMap?.stopMovement();
  document.getElementById("activeLane").textContent = "—";
  document.getElementById("timerValue").textContent = "—";
  runBtn.disabled = false;
  addLog("Simulation terminated and signals reset", "info");
}

function selectMode(mode) {
  currentMode = mode;
  agingCycles = 0;
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  document.getElementById("modeDescription").textContent =
    MODE_DESCRIPTIONS[mode] || "Standard city traffic flow";
  document.getElementById("activeMode").textContent =
    document.querySelector(`.mode-btn[data-mode="${mode}"]`)?.textContent || "Normal Traffic";
  addLog(`Simulation mode changed to: ${mode}`, "info");
}

function getReportData() {
  const auth = getAuth?.() || null;
  const avgWait =
    sessionStats.waitingTimeCount > 0
      ? (sessionStats.waitingTimeSum / sessionStats.waitingTimeCount).toFixed(1)
      : 0;

  return {
    operator: auth?.name || "Guest",
    role: auth?.role || "—",
    mode: document.getElementById("activeMode")?.textContent || "Normal Traffic",
    algorithm: "Priority Scheduling",
    vehiclesPassed: sessionStats.totalVehiclesProcessed,
    avgWaiting: avgWait,
    emergencyResponse: sessionStats.lastEmergencyResponse,
    performance: sessionStats.lastPerformance,
    signalChanges: sessionStats.signalChanges,
    starvation: sessionStats.lastStarvation,
    aging: sessionStats.lastAging,
    lastGreenLane: lastResult?.greenLane
      ? lastResult.greenLane.charAt(0).toUpperCase() + lastResult.greenLane.slice(1)
      : null,
    lastDuration: lastResult?.greenDuration,
    priorities: lastResult?.priorities || [],
  };
}

document.querySelectorAll(".lane-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lane-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedLane = btn.dataset.lane;
  });
});

document.querySelectorAll(".emergency-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    if (type === "clear") {
      document.querySelector(`[name="${selectedLane}-emergency"]`).value = "";
      addLog(`Emergency cleared on ${selectedLane} lane`, "info");
    } else {
      document.querySelector(`[name="${selectedLane}-emergency"]`).value = type;
      addLog(`${EMERGENCY_LABELS[type]} assigned to ${selectedLane} lane`, "emergency");
    }
    updateLiveQueues(getLaneData());
    cityMap?.updateVehicles(getLaneData());
  });
});

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => selectMode(btn.dataset.mode));
});

runBtn.addEventListener("click", () => runSimulation());
generateTrafficBtn.addEventListener("click", generateRandomTraffic);
autoBtn.addEventListener("click", toggleAutoSimulate);
stopBtn.addEventListener("click", stopSimulation);
bindReportButton(getReportData);

function startClock() {
  const clockEl = document.getElementById("liveClock");
  clockInterval = setInterval(() => {
    clockEl.textContent = nowTime();
  }, 1000);
  clockEl.textContent = nowTime();
}

function onLoginSuccess(user) {
  addLog(`Welcome, ${user.name} (${user.role})`, "info");
  startHealthMonitor();
  loadHistory();
}

window.onLoginSuccess = onLoginSuccess;

function initApp() {
  cityMap = new CityMap("cityMap");
  if (typeof initCharts === "function") {
    initCharts();
  }
  setLaneData(getLaneData());
  startClock();
  updateOsPanel({
    algorithm: "Priority Scheduling",
    currentProcess: "—",
    processRank: "—",
    waitingQueue: ["North", "East", "West"],
    starvation: "No",
    aging: "Enabled",
  });
  setConnectionStatus(true, true);
  addLog("Smart Traffic Control system ready", "info");
}

window.initApp = initApp;

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  if (isAuthenticated()) {
    onLoginSuccess(getAuth());
  }
});

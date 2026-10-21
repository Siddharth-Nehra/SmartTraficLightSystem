let priorityChart = null;
let vehicleChart = null;
let historyChart = null;
let cpuChart = null;

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#8899aa" } } },
  scales: {
    x: {
      ticks: { color: "#8899aa" },
      grid: { color: "rgba(45, 63, 92, 0.5)" },
    },
    y: {
      ticks: { color: "#8899aa" },
      grid: { color: "rgba(45, 63, 92, 0.5)" },
      beginAtZero: true,
    },
  },
};

function initCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not loaded yet");
    return;
  }

  const pEl = document.getElementById("priorityChart");
  const vEl = document.getElementById("vehicleChart");
  const cEl = document.getElementById("cpuChart");
  const hEl = document.getElementById("historyChart");

  if (!pEl || !vEl || !cEl || !hEl) return;

  if (priorityChart) priorityChart.destroy();
  if (vehicleChart) vehicleChart.destroy();
  if (cpuChart) cpuChart.destroy();
  if (historyChart) historyChart.destroy();

  priorityChart = new Chart(pEl.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["North", "South", "East", "West"],
      datasets: [{
        label: "Priority Score",
        data: [0, 0, 0, 0],
        backgroundColor: ["rgba(59,130,246,0.75)", "rgba(34,197,94,0.75)", "rgba(234,179,8,0.75)", "rgba(239,68,68,0.75)"],
        borderRadius: 6,
      }],
    },
    options: chartDefaults,
  });

  vehicleChart = new Chart(vEl.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["North", "South", "East", "West"],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#ef4444"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { color: "#8899aa" } } },
    },
  });

  cpuChart = new Chart(cEl.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "CPU Utilization %",
        data: [],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, max: 100 },
      },
    },
  });

  historyChart = new Chart(hEl.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "North", data: [], borderColor: "#3b82f6", tension: 0.3, fill: false },
        { label: "South", data: [], borderColor: "#22c55e", tension: 0.3, fill: false },
        { label: "East", data: [], borderColor: "#eab308", tension: 0.3, fill: false },
        { label: "West", data: [], borderColor: "#ef4444", tension: 0.3, fill: false },
      ],
    },
    options: chartDefaults,
  });
}

function updatePriorityChart(priorities) {
  if (!priorityChart) return;
  const order = ["north", "south", "east", "west"];
  priorityChart.data.datasets[0].data = order.map(
    (lane) => priorities.find((p) => p.lane === lane)?.priority ?? 0
  );
  priorityChart.update();
}

function updateVehicleChart(priorities) {
  if (!vehicleChart) return;
  const order = ["north", "south", "east", "west"];
  vehicleChart.data.datasets[0].data = order.map(
    (lane) => priorities.find((p) => p.lane === lane)?.vehicles ?? 0
  );
  vehicleChart.update();
}

function updateCpuChart(readings) {
  if (!cpuChart) return;
  cpuChart.data.labels = readings.map((_, i) => `#${i + 1}`);
  cpuChart.data.datasets[0].data = readings;
  cpuChart.update();
}

function updateHistoryChart(history) {
  if (!historyChart) return;
  const reversed = [...history].reverse();
  historyChart.data.labels = reversed.map((_, i) => `#${i + 1}`);
  historyChart.data.datasets[0].data = reversed.map((h) => h.north_priority ?? h.north ?? 0);
  historyChart.data.datasets[1].data = reversed.map((h) => h.south_priority ?? h.south ?? 0);
  historyChart.data.datasets[2].data = reversed.map((h) => h.east_priority ?? h.east ?? 0);
  historyChart.data.datasets[3].data = reversed.map((h) => h.west_priority ?? h.west ?? 0);
  historyChart.update();
}

window.initCharts = initCharts;
window.updatePriorityChart = updatePriorityChart;
window.updateVehicleChart = updateVehicleChart;
window.updateCpuChart = updateCpuChart;
window.updateHistoryChart = updateHistoryChart;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCharts);
} else {
  initCharts();
}

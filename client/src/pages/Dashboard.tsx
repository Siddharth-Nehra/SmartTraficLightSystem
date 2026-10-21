import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    loadStylesheet("/legacy/css/style.css");

    const boot = async () => {
      await loadScript("/legacy/js/config.js");
      await loadScript("/legacy/js/charts.js");
      await loadScript("/legacy/js/map.js");
      await loadScript("/legacy/js/report.js");
      await loadScript("/legacy/js/app.js");

      const w = window as Window & {
        initApp?: () => void;
        onLoginSuccess?: (user: { name: string; role: string }) => void;
        getAuth?: () => { name: string; role: string } | null;
      };

      if (typeof w.initApp === "function") {
        w.initApp();
      }
      if (user && typeof w.onLoginSuccess === "function") {
        w.onLoginSuccess(user);
      }
    };

    boot().catch(console.error);
  }, [user]);

  useEffect(() => {
    const badge = document.getElementById("userBadge");
    if (badge && user) {
      badge.innerHTML = `<span class="user-role">${user.role}</span><span class="user-name">${user.name}</span>`;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    const handler = () => {
      logout();
      navigate("/login", { replace: true });
    };
    logoutBtn?.addEventListener("click", handler);
    return () => logoutBtn?.removeEventListener("click", handler);
  }, [user, logout, navigate]);

  return (
    <div
      id="appShell"
      dangerouslySetInnerHTML={{
        __html: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🚦</span>
          <div>
            <h1>Smart Traffic Light Control</h1>
            <p>Priority Scheduling &mdash; Live City Simulation</p>
          </div>
        </div>
        <div class="header-right">
          <div class="user-badge" id="userBadge"></div>
          <div class="clock" id="liveClock">--:--:--</div>
          <div class="status-badge" id="connectionStatus">
            <span class="status-dot"></span>
            Connecting...
          </div>
          <button type="button" class="btn-logout" id="logoutBtn" title="Logout">Logout</button>
        </div>
      </div>
    </header>
    <main class="container">
      <div class="main-grid">
        <div class="main-content">
          <section class="panel map-panel">
            <div class="panel-header">
              <h2>Live City Map</h2>
              <div class="map-status">
                <span id="activeLane">—</span>
                <span class="mode-badge" id="activeMode">Normal Traffic</span>
                <span class="timer-badge" id="timerValue">—</span>
              </div>
            </div>
            <div class="city-map" id="cityMap">
              <div class="city-block block-nw"><span class="building">🏢</span><small>Office</small></div>
              <div class="city-block block-ne"><span class="building">🏥</span><small>Hospital</small></div>
              <div class="city-block block-sw"><span class="building">🏫</span><small>School</small></div>
              <div class="city-block block-se"><span class="building">🏬</span><small>Mall</small></div>
              <div class="road-segment road-north" id="road-north">
                <span class="road-label">North</span>
                <div class="traffic-light tl-north" id="light-north">
                  <div class="light red active"></div><div class="light yellow"></div><div class="light green"></div>
                </div>
                <div class="road-vehicles" id="map-vehicles-north"></div>
              </div>
              <div class="road-segment road-south" id="road-south">
                <span class="road-label">South</span>
                <div class="traffic-light tl-south" id="light-south">
                  <div class="light red active"></div><div class="light yellow"></div><div class="light green"></div>
                </div>
                <div class="road-vehicles" id="map-vehicles-south"></div>
              </div>
              <div class="road-segment road-east" id="road-east">
                <span class="road-label">East</span>
                <div class="traffic-light tl-east horizontal" id="light-east">
                  <div class="light red active"></div><div class="light yellow"></div><div class="light green"></div>
                </div>
                <div class="road-vehicles" id="map-vehicles-east"></div>
              </div>
              <div class="road-segment road-west" id="road-west">
                <span class="road-label">West</span>
                <div class="traffic-light tl-west horizontal" id="light-west">
                  <div class="light red active"></div><div class="light yellow"></div><div class="light green"></div>
                </div>
                <div class="road-vehicles" id="map-vehicles-west"></div>
              </div>
              <div class="intersection-hub"><span class="hub-icon">🚦</span><small>Intersection</small></div>
            </div>
          </section>
          <section class="panel stats-panel" id="statsPanel">
            <h2>Statistics Dashboard</h2>
            <div class="stats-grid">
              <div class="stat-card"><span class="stat-icon">🚗</span><span class="stat-value" id="statVehicles">0</span><span class="stat-label">Total Vehicles Processed</span></div>
              <div class="stat-card"><span class="stat-icon">⏱️</span><span class="stat-value" id="statWait">0s</span><span class="stat-label">Average Waiting Time</span></div>
              <div class="stat-card"><span class="stat-icon">🚑</span><span class="stat-value" id="statEmergency">0</span><span class="stat-label">Emergency Vehicles Served</span></div>
              <div class="stat-card"><span class="stat-icon">🔄</span><span class="stat-value" id="statSignals">0</span><span class="stat-label">Signal Changes</span></div>
              <div class="stat-card"><span class="stat-icon">📈</span><span class="stat-value" id="statThroughput">0</span><span class="stat-label">Traffic Throughput / min</span></div>
              <div class="stat-card"><span class="stat-icon">💻</span><span class="stat-value" id="statCpu">0%</span><span class="stat-label">CPU Utilization Equivalent</span></div>
            </div>
          </section>
          <section class="panel result-panel">
            <h2>Scheduling Result</h2>
            <div class="priority-table-wrap">
              <table class="priority-table">
                <thead><tr><th>Rank</th><th>Lane</th><th>Queue</th><th>Wait (s)</th><th>Emergency</th><th>Priority</th><th>Signal</th></tr></thead>
                <tbody id="priorityTableBody"></tbody>
              </table>
            </div>
          </section>
          <div class="charts-section">
            <div class="panel chart-panel"><h2>Priority Scores</h2><canvas id="priorityChart"></canvas></div>
            <div class="panel chart-panel"><h2>Vehicle Distribution</h2><canvas id="vehicleChart"></canvas></div>
            <div class="panel chart-panel"><h2>CPU Utilization</h2><canvas id="cpuChart"></canvas></div>
            <div class="panel chart-panel chart-wide"><h2>Simulation History</h2><canvas id="historyChart"></canvas></div>
          </div>
        </div>
        <div class="sidebar">
          <section class="panel os-panel">
            <h2>Operating System Concepts</h2>
            <div class="os-grid">
              <div class="os-item"><span class="os-label">Current Algorithm</span><span class="os-value" id="osAlgorithm">Priority Scheduling</span></div>
              <div class="os-item highlight"><span class="os-label">Current Process</span><span class="os-value" id="osProcess">—</span></div>
              <div class="os-item"><span class="os-label">Priority</span><span class="os-value" id="osPriority">—</span></div>
              <div class="os-item"><span class="os-label">Waiting Queue</span><span class="os-value os-queue" id="osWaitingQueue">North, East, West</span></div>
              <div class="os-item"><span class="os-label">Starvation</span><span class="os-value" id="osStarvation">No</span></div>
              <div class="os-item"><span class="os-label">Aging</span><span class="os-value os-enabled" id="osAging">Enabled</span></div>
            </div>
          </section>
          <section class="panel modes-panel">
            <h2>Simulation Modes</h2>
            <div class="mode-buttons" id="modeButtons">
              <button type="button" class="mode-btn active" data-mode="normal">Normal Traffic</button>
              <button type="button" class="mode-btn" data-mode="peak">Peak Hour</button>
              <button type="button" class="mode-btn" data-mode="emergency">Emergency Mode</button>
              <button type="button" class="mode-btn" data-mode="rainy">Rainy Day</button>
              <button type="button" class="mode-btn" data-mode="accident">Accident Mode</button>
            </div>
            <p class="mode-desc" id="modeDescription">Standard city traffic flow</p>
          </section>
          <section class="panel control-panel">
            <h2>Traffic Control</h2>
            <button type="button" class="btn btn-ai" id="generateTrafficBtn">✨ Generate Random Traffic</button>
            <div class="generated-preview" id="generatedPreview"></div>
            <div class="lane-inputs">
              <div class="lane-card" data-lane="north"><h3>North ↑ <span class="lane-count" id="input-north">5</span></h3><input type="hidden" name="north-vehicles" value="5"><input type="hidden" name="north-waiting" value="10"><input type="hidden" name="north-emergency" value=""></div>
              <div class="lane-card" data-lane="south"><h3>South ↓ <span class="lane-count" id="input-south">8</span></h3><input type="hidden" name="south-vehicles" value="8"><input type="hidden" name="south-waiting" value="25"><input type="hidden" name="south-emergency" value=""></div>
              <div class="lane-card" data-lane="east"><h3>East → <span class="lane-count" id="input-east">3</span></h3><input type="hidden" name="east-vehicles" value="3"><input type="hidden" name="east-waiting" value="5"><input type="hidden" name="east-emergency" value=""></div>
              <div class="lane-card" data-lane="west"><h3>West ← <span class="lane-count" id="input-west">12</span></h3><input type="hidden" name="west-vehicles" value="12"><input type="hidden" name="west-waiting" value="40"><input type="hidden" name="west-emergency" value=""></div>
            </div>
            <div class="emergency-section">
              <h3>Emergency Detection</h3>
              <p class="hint">Select lane, then emergency vehicle type</p>
              <div class="lane-select" id="laneSelect">
                <button type="button" class="lane-btn active" data-lane="north">North</button>
                <button type="button" class="lane-btn" data-lane="south">South</button>
                <button type="button" class="lane-btn" data-lane="east">East</button>
                <button type="button" class="lane-btn" data-lane="west">West</button>
              </div>
              <div class="emergency-icons">
                <button type="button" class="emergency-btn" data-type="ambulance" title="Ambulance">🚑</button>
                <button type="button" class="emergency-btn" data-type="fire" title="Fire Truck">🚒</button>
                <button type="button" class="emergency-btn" data-type="police" title="Police">🚓</button>
                <button type="button" class="emergency-btn clear" data-type="clear" title="Clear">✕</button>
              </div>
            </div>
            <div class="actions">
              <button type="button" class="btn btn-primary" id="runBtn">Run Priority Scheduling</button>
              <button type="button" class="btn btn-secondary" id="autoBtn">Auto Simulate</button>
              <button type="button" class="btn btn-danger" id="stopBtn">🛑 Stop Simulation</button>
              <button type="button" class="btn btn-report" id="generateReportBtn">📄 Generate PDF Report</button>
            </div>
          </section>
          <section class="panel queue-panel">
            <h2>Live Queue</h2>
            <div class="queue-list">
              <div class="queue-row" data-lane="north"><span class="queue-label">North</span><div class="queue-vehicles" id="queue-north">🚗🚗🚗🚗🚗</div></div>
              <div class="queue-row" data-lane="south"><span class="queue-label">South</span><div class="queue-vehicles" id="queue-south">🚗🚗🚗🚗🚗🚗🚗🚗</div></div>
              <div class="queue-row" data-lane="east"><span class="queue-label">East</span><div class="queue-vehicles" id="queue-east">🚗🚗🚗</div></div>
              <div class="queue-row" data-lane="west"><span class="queue-label">West</span><div class="queue-vehicles" id="queue-west">🚗🚗🚗🚗🚗🚗🚗🚗🚗🚗🚗🚗</div></div>
            </div>
          </section>
          <section class="panel log-panel">
            <h2>Event Log</h2>
            <div class="event-log" id="eventLog">
              <div class="log-entry info"><span class="log-time">--:--:--</span><span class="log-msg">System initialized. Waiting for traffic data...</span></div>
            </div>
          </section>
        </div>
      </div>
    </main>
    <div class="popup-overlay hidden" id="emergencyPopup">
      <div class="popup-card">
        <div class="popup-icon" id="popupIcon">🚑</div>
        <h3>Emergency Vehicle Detected</h3>
        <p id="popupMessage">Priority Updated</p>
        <p class="popup-green" id="popupGreen">South gets Green Signal</p>
        <button type="button" class="btn btn-primary" id="popupClose">Acknowledge</button>
      </div>
    </div>
    <footer class="footer"><p>Smart Traffic Light Control &mdash; Node.js + Express + Priority Scheduling + OS Concepts</p></footer>
        `,
      }}
    />
  );
}

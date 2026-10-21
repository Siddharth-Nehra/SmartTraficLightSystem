const LANES = ["north", "south", "east", "west"];
const EMERGENCY_ICONS = { ambulance: "🚑", fire: "🚒", police: "🚓" };

class CityMap {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeLane = null;
    this.movementInterval = null;
    this.signals = { north: "red", south: "red", east: "red", west: "red" };
  }

  setSignal(lane, color) {
    this.signals[lane] = color;
    const road = document.getElementById(`road-${lane}`);
    if (road) {
      road.classList.remove("signal-red", "signal-yellow", "signal-green");
      road.classList.add(`signal-${color}`);
    }
  }

  updateVehicles(lanes) {
    for (const lane of LANES) {
      const container = document.getElementById(`map-vehicles-${lane}`);
      if (!container) continue;
      container.innerHTML = "";

      const count = lanes[lane]?.vehicles ?? 0;
      const emergencyType = lanes[lane]?.emergencyType;
      const maxShow = Math.min(count, 6);

      for (let i = 0; i < maxShow; i++) {
        const v = document.createElement("span");
        v.className = "map-vehicle";
        v.textContent = i === 0 && emergencyType ? EMERGENCY_ICONS[emergencyType] : "🚗";
        v.style.animationDelay = `${i * 0.4}s`;
        container.appendChild(v);
      }
    }
  }

  startMovement(lane, phase) {
    this.activeLane = lane;
    this.stopMovement();

    const container = document.getElementById(`map-vehicles-${lane}`);
    if (!container) return;

    container.classList.add("moving");
    container.dataset.phase = phase;

    const vehicles = container.querySelectorAll(".map-vehicle");
    vehicles.forEach((v, i) => {
      v.classList.add("drive");
      v.style.animationDuration = phase === "green" ? "1.2s" : "2s";
      v.style.animationDelay = `${i * 0.3}s`;
    });
  }

  stopMovement() {
    this.activeLane = null;
    for (const lane of LANES) {
      const container = document.getElementById(`map-vehicles-${lane}`);
      if (container) {
        container.classList.remove("moving");
        container.querySelectorAll(".map-vehicle").forEach((v) => {
          v.classList.remove("drive", "emergency-drive");
        });
      }
    }
  }

  animateEmergency(lane, type) {
    const container = document.getElementById(`map-vehicles-${lane}`);
    if (!container) return;

    const emergency = container.querySelector(".map-vehicle");
    if (emergency) {
      emergency.textContent = EMERGENCY_ICONS[type] || "🚑";
      emergency.classList.add("emergency-drive");
      emergency.style.animationDuration = "0.8s";
    }
  }
}

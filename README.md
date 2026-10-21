# Smart Traffic Light Control

A full-stack web application that controls a 4-way traffic intersection using a **Priority Scheduling** algorithm. The lane with the highest priority score receives the green signal.

## Architecture

```
User
  │
  ▼
Smart Traffic Website (HTML, CSS, JavaScript)
  │
  Sends traffic data (API)
  │
  ▼
Node.js + Express Server
  │
  Priority Scheduling Algorithm
  │
  Determines Green Signal
  │
  ▼
Sends Result to Frontend
  │
  ▼
Updates Traffic Lights & Charts
```

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML, CSS, JavaScript               |
| Charts   | Chart.js                            |
| Backend  | Node.js, Express.js                 |
| Database | JSON file (simulation history)        |

## Priority Scheduling Algorithm

Each lane gets a priority score:

```
Priority = (vehicles × 2) + (waitingTime × 1.5) + emergencyBonus
```

- **Emergency bonus**: +1000 (immediate highest priority)
- **Green duration**: 10–60 seconds based on demand
- **Yellow phase**: 3 seconds before green

## Project Structure

```
Smart Traffic Light Control/
├── backend/
│   ├── server.js                 # Express server
│   ├── package.json
│   ├── algorithm/
│   │   └── priorityScheduler.js  # Priority scheduling logic
│   ├── database/
│   │   └── db.js                 # SQLite persistence
│   └── routes/
│       └── api.js                # REST API endpoints
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js                # Main UI logic
│       └── charts.js             # Chart.js graphs
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### Installation

```bash
cd backend
npm install
```

### Run the Server

```bash
npm start
```

Open **http://localhost:3002** in your browser.

## API Endpoints

| Method | Endpoint         | Description                    |
|--------|------------------|--------------------------------|
| POST   | `/api/simulate`  | Run priority scheduling        |
| GET    | `/api/history`   | Fetch simulation history       |
| DELETE | `/api/history`   | Clear simulation history       |
| GET    | `/api/generate-traffic` | AI random traffic generation     |

### Example: POST /api/simulate

**Request:**
```json
{
  "lanes": {
    "north": { "vehicles": 5, "waitingTime": 10, "emergency": false },
    "south": { "vehicles": 8, "waitingTime": 25, "emergency": false },
    "east":  { "vehicles": 3, "waitingTime": 5,  "emergency": false },
    "west":  { "vehicles": 12, "waitingTime": 40, "emergency": true }
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "greenLane": "west",
    "greenDuration": 45,
    "yellowDuration": 3,
    "signals": { "north": "red", "south": "red", "east": "red", "west": "green" },
    "priorities": [ ... ],
    "algorithm": "Priority Scheduling"
  }
}
```

| GET    | `/api/health`    | Server health check            |

## Features

- **Live City Map** — 4-way intersection with buildings (Office, Hospital, School, Mall), animated vehicles, traffic lights
- **AI Traffic Generation** — One-click realistic random traffic per lane
- **Emergency Detection** — Ambulance, Fire Truck, Police with popup alerts
- **Live Queue** — Vehicle emojis instead of plain numbers
- **Event Log** — Timestamped log for viva/demo (priority updates, signal changes, emergencies)
- **Statistics Dashboard** — Vehicles processed, avg wait, emergencies served, signal changes, throughput, CPU utilization
- **Chart.js** — Priority scores, vehicle distribution, CPU utilization, simulation history

## License

MIT

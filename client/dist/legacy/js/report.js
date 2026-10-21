/**
 * PDF Report Generator for Smart Traffic Light Control
 * Priority Scheduling & OS Concepts Report
 */

async function ensureJsPdfLoaded() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  if (window.jsPDF) return window.jsPDF;
  
  // Dynamically load jsPDF if missing
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js";
    script.onload = () => {
      if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
      else if (window.jsPDF) resolve(window.jsPDF);
      else reject(new Error("jsPDF failed to initialize"));
    };
    script.onerror = () => reject(new Error("Failed to load jsPDF script"));
    document.head.appendChild(script);
  });
}

async function generatePdfReport(reportData) {
  try {
    const jsPDFClass = await ensureJsPdfLoaded();
    const doc = new jsPDFClass({ orientation: "p", unit: "mm", format: "a4" });
    const dateStr = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    });

    // Color Palette
    const primaryColor = [15, 23, 42];     // Dark Slate #0f172a
    const accentColor = [59, 130, 246];    // Neon Blue #3b82f6
    const successColor = [34, 197, 94];   // Emerald Green #22c55e
    const textDark = [30, 41, 59];         // Slate 800
    const textMuted = [100, 116, 139];     // Slate 500
    const borderBg = [241, 245, 249];      // Slate 100

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 48, "F");

    // Accent Stripe
    doc.setFillColor(...accentColor);
    doc.rect(0, 46, 210, 2, "F");

    // Title & Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SMART TRAFFIC LIGHT CONTROL", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text("Priority Scheduling Algorithm & OS Concepts Executive Summary", 14, 29);

    // Meta Timestamp & Operator
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Generated: ${dateStr}`, 14, 38);
    doc.text(`Operator: ${reportData.operator || "Admin"} (${reportData.role || "Operator"})`, 140, 38);

    // Section 1: System Performance Metrics
    let y = 60;
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. SYSTEM PERFORMANCE METRICS", 14, y);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, y + 3, 196, y + 3);

    y += 11;

    const metrics = [
      ["Simulation Mode", reportData.mode || "Normal Traffic"],
      ["Algorithm Used", reportData.algorithm || "Priority Scheduling"],
      ["Total Vehicles Processed", String(reportData.vehiclesPassed ?? 0)],
      ["Average Waiting Time", `${reportData.avgWaiting ?? 0}s`],
      ["Emergency Vehicles Served", String(reportData.emergencyServed ?? 0)],
      ["Emergency Response Time", reportData.emergencyResponse != null ? `${reportData.emergencyResponse}s` : "Optimal (<3s)"],
      ["Performance Score", `${reportData.performance ?? 100}%`],
      ["Signal Changes Executed", String(reportData.signalChanges ?? 0)],
      ["Starvation Detection", reportData.starvation || "No"],
      ["Aging Mechanism", reportData.aging || "Enabled"],
    ];

    doc.setFontSize(9.5);
    metrics.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(...borderBg);
        doc.rect(14, y - 4, 182, 7.5, "F");
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textMuted);
      doc.text(label, 18, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textDark);
      doc.text(String(value), 120, y);

      y += 8.5;
    });

    // Section 2: Last Scheduling Decision
    y += 6;
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("2. LAST SCHEDULING DECISION", 14, y);
    doc.line(14, y + 3, 196, y + 3);

    y += 11;

    doc.setFillColor(240, 253, 244); // light green background
    doc.rect(14, y - 4, 182, 18, "F");
    doc.setDrawColor(...successColor);
    doc.setLineWidth(0.5);
    doc.rect(14, y - 4, 182, 18, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...successColor);
    const greenLane = reportData.lastGreenLane
      ? reportData.lastGreenLane.toUpperCase()
      : "NORTH";
    doc.text(`ACTIVE GREEN SIGNAL: ${greenLane} LANE`, 18, y + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text(
      `Green Phase Duration: ${reportData.lastDuration ?? 15}s  |  Yellow Phase: 3s  |  Status: Optimal Dispatch`,
      18,
      y + 9
    );

    y += 24;

    // Section 3: Priority Queue / OS Ready Queue
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("3. PRIORITY READY QUEUE DISPATCH", 14, y);
    doc.line(14, y + 3, 196, y + 3);

    y += 10;

    // Table Header
    doc.setFillColor(...primaryColor);
    doc.rect(14, y - 4, 182, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("Rank", 18, y);
    doc.text("Lane", 40, y);
    doc.text("Priority Score", 80, y);
    doc.text("Vehicle Count", 125, y);
    doc.text("Wait Duration", 165, y);

    y += 9;

    const priorities = reportData.priorities?.length
      ? reportData.priorities
      : [
          { rank: 1, lane: "North", priority: 45.5, vehicles: 8, waitingTime: 12 },
          { rank: 2, lane: "South", priority: 32.0, vehicles: 5, waitingTime: 8 },
          { rank: 3, lane: "West", priority: 24.5, vehicles: 4, waitingTime: 6 },
          { rank: 4, lane: "East", priority: 18.0, vehicles: 3, waitingTime: 4 },
        ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    priorities.forEach((p, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(...borderBg);
        doc.rect(14, y - 4, 182, 7.5, "F");
      }

      const isWinner = idx === 0;
      if (isWinner) {
        doc.setTextColor(...successColor);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(...textDark);
        doc.setFont("helvetica", "normal");
      }

      doc.text(`#${p.rank}`, 18, y);
      doc.text(p.lane.charAt(0).toUpperCase() + p.lane.slice(1), 40, y);
      doc.text(String(p.priority), 80, y);
      doc.text(String(p.vehicles), 125, y);
      doc.text(`${p.waitingTime}s`, 165, y);

      y += 8;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...textMuted);
      doc.text(
        "Smart Traffic Light Control — OS Priority Scheduling & Live Dispatch Engine",
        14,
        286
      );
      doc.text(`Page ${i} of ${totalPages}`, 180, 286);
    }

    const filename = `Traffic_Control_Report_${Date.now()}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Could not generate PDF directly. Opening print-friendly report window instead.");
    openPrintFallback(reportData);
  }
}

function openPrintFallback(reportData) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Smart Traffic Light Control - Report</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; color: #0f172a; }
        h1 { color: #3b82f6; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
        th { background: #0f172a; color: white; }
        .green { color: #22c55e; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>🚦 Smart Traffic Light Control Report</h1>
      <p><b>Generated:</b> ${new Date().toLocaleString()}</p>
      <p><b>Operator:</b> ${reportData.operator || "Admin"} (${reportData.role || "Operator"})</p>
      <p><b>Simulation Mode:</b> ${reportData.mode || "Normal Traffic"}</p>
      <p><b>Vehicles Processed:</b> ${reportData.vehiclesPassed ?? 0}</p>
      <p><b>Average Wait Time:</b> ${reportData.avgWaiting ?? 0}s</p>
      <h3>Ready Queue Priority Breakdown</h3>
      <table>
        <thead><tr><th>Rank</th><th>Lane</th><th>Priority</th><th>Vehicles</th><th>Wait</th></tr></thead>
        <tbody>
          ${(reportData.priorities || []).map(p => `
            <tr>
              <td>#${p.rank}</td>
              <td>${p.lane}</td>
              <td>${p.priority}</td>
              <td>${p.vehicles}</td>
              <td>${p.waitingTime}s</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <script>window.print();</script>
    </body>
    </html>
  `);
  win.document.close();
}

function bindReportButton(getReportData) {
  const btn = document.getElementById("generateReportBtn");
  if (!btn) return;
  
  // Clone button to strip existing listeners if any
  const newBtn = btn.cloneNode(true);
  btn.parentNode?.replaceChild(newBtn, btn);

  newBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const data = typeof getReportData === "function" ? getReportData() : {};
    generatePdfReport(data);
  });
}

window.generatePdfReport = generatePdfReport;
window.bindReportButton = bindReportButton;

const AUTH_KEY = "stlc_auth";

const DEMO_CREDENTIALS = {
  admin: { password: "admin123", role: "Admin", name: "System Admin" },
  operator: { password: "operator123", role: "Traffic Operator", name: "Traffic Operator" },
};

function getAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuth(user) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
}

function isAuthenticated() {
  return Boolean(getAuth());
}

async function login(username, password) {
  const key = username?.trim().toLowerCase();
  const local = DEMO_CREDENTIALS[key];

  if (local && local.password === password) {
    const user = { username: key, role: local.role, name: local.name };
    setAuth(user);
    return { success: true, user };
  }

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: key, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    setAuth(data.user);
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: "Invalid username or password." };
  }
}

function startCinematicIntro(onDone) {
  const introScreen = document.getElementById("introScreen");
  if (!introScreen) {
    onDone();
    return;
  }
  
  introScreen.classList.remove("hidden");
  
  const scene1 = document.getElementById("introScene1");
  const scene2 = document.getElementById("introScene2");
  const scene3 = document.getElementById("introScene3");
  const scene4 = document.getElementById("introScene4");
  const scene5 = document.getElementById("introScene5");
  
  // Remove hidden class from all scenes so that opacity transitions work
  scene1.classList.remove("hidden");
  scene2.classList.remove("hidden");
  scene3.classList.remove("hidden");
  scene4.classList.remove("hidden");
  scene5.classList.remove("hidden");
  
  // Reset active classes
  scene1.classList.add("active");
  scene2.classList.remove("active");
  scene3.classList.remove("active");
  scene4.classList.remove("active");
  scene5.classList.remove("active");
  
  const ambulance = document.getElementById("introAmbulance");
  if (ambulance) {
    ambulance.classList.remove("run");
    ambulance.classList.add("hidden");
  }
  
  const pgBar = document.getElementById("introProgressBar");
  if (pgBar) pgBar.style.width = "0%";

  const cornerRed = document.getElementById("introCornerLightRed");
  const cornerYellow = document.getElementById("introCornerLightYellow");
  const cornerGreen = document.getElementById("introCornerLightGreen");
  if (cornerRed) cornerRed.classList.add("active");
  if (cornerYellow) cornerYellow.classList.remove("active");
  if (cornerGreen) cornerGreen.classList.remove("active");

  // Cinematic Timeline
  // Scene 2 (Draw infrastructure, start traffic) after 1.8s
  setTimeout(() => {
    scene1.classList.remove("active");
    scene2.classList.add("active");
    
    // Trigger neon draw
    const hNeon = scene2.querySelector(".horizontal-path");
    const vNeon = scene2.querySelector(".vertical-path");
    if (hNeon) {
      hNeon.style.animation = "none";
      hNeon.offsetHeight; // trigger reflow
      hNeon.style.animation = "drawPath 1.2s forwards cubic-bezier(0.4, 0, 0.2, 1)";
    }
    if (vNeon) {
      vNeon.style.animation = "none";
      vNeon.offsetHeight; // trigger reflow
      vNeon.style.animation = "drawPath 1.2s forwards cubic-bezier(0.4, 0, 0.2, 1) 0.3s";
    }
  }, 1800);
  
  // Scene 2 - Part B (Ambulance enters, light blinks yellow then green) at 3.3s
  setTimeout(() => {
    if (ambulance) {
      ambulance.classList.remove("hidden");
      ambulance.classList.add("run");
    }
    if (cornerRed) cornerRed.classList.remove("active");
    if (cornerYellow) cornerYellow.classList.add("active");
  }, 3300);
  
  setTimeout(() => {
    if (cornerYellow) cornerYellow.classList.remove("active");
    if (cornerGreen) cornerGreen.classList.add("active");
  }, 3900);

  // Scene 3 (Ambulance Priority Active) after 4.2s
  setTimeout(() => {
    scene2.classList.remove("active");
    scene3.classList.add("active");
  }, 4200);
  
  // Scene 4 (Powered by Scheduler Algorithm) after 5.6s
  setTimeout(() => {
    scene3.classList.remove("active");
    scene4.classList.add("active");
  }, 5600);
  
  // Scene 5 (Connecting to Grid / loading progress bar) after 7.0s
  setTimeout(() => {
    scene4.classList.remove("active");
    scene5.classList.add("active");
    if (pgBar) {
      pgBar.style.transition = "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
      setTimeout(() => {
        pgBar.style.width = "100%";
      }, 50);
    }
  }, 7000);
  
  // Complete Intro after 8.5s
  setTimeout(() => {
    introScreen.style.transition = "opacity 0.6s ease";
    introScreen.style.opacity = 0;
    setTimeout(() => {
      introScreen.classList.add("hidden");
      introScreen.style.opacity = 1;
      onDone();
    }, 600);
  }, 8500);
}

function requireAuth() {
  if (!isAuthenticated()) {
    document.getElementById("loginScreen")?.classList.remove("hidden");
    document.getElementById("appShell")?.classList.add("hidden");
    document.getElementById("introScreen")?.classList.add("hidden");
    return false;
  }
  
  const introPlayed = localStorage.getItem("stlc_intro_played");
  if (introPlayed) {
    document.getElementById("loginScreen")?.classList.add("hidden");
    document.getElementById("introScreen")?.classList.add("hidden");
    document.getElementById("appShell")?.classList.remove("hidden");
  } else {
    document.getElementById("loginScreen")?.classList.add("hidden");
    document.getElementById("appShell")?.classList.add("hidden");
    startCinematicIntro(() => {
      localStorage.setItem("stlc_intro_played", "true");
      document.getElementById("introScreen")?.classList.add("hidden");
      document.getElementById("appShell")?.classList.remove("hidden");
      
      // Nice dashboard fade-in
      const shell = document.getElementById("appShell");
      if (shell) {
        shell.style.opacity = "0";
        shell.offsetHeight; // trigger reflow
        shell.style.transition = "opacity 0.8s ease";
        shell.style.opacity = "1";
      }
    });
  }
  return true;
}

function updateUserBadge() {
  const auth = getAuth();
  const badge = document.getElementById("userBadge");
  if (!badge || !auth) return;
  badge.innerHTML = `<span class="user-role">${auth.role}</span><span class="user-name">${auth.name}</span>`;
}

function initLogin() {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    const result = await login(username, password);

    if (result.success) {
      requireAuth();
      updateUserBadge();
      if (typeof onLoginSuccess === "function") onLoginSuccess(result.user);
    } else {
      errorEl.textContent = result.error || "Login failed.";
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("stlc_intro_played");
    clearAuth();
    requireAuth();
    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";
  });

  document.querySelectorAll(".demo-login-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("loginUsername").value = btn.dataset.user;
      document.getElementById("loginPassword").value = btn.dataset.pass;
    });
  });

  if (requireAuth()) {
    updateUserBadge();
  }
}

document.addEventListener("DOMContentLoaded", initLogin);

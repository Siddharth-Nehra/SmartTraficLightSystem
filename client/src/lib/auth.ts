export interface AuthUser {
  username: string;
  role: string;
  name: string;
}

export const AUTH_KEY = "stlc_auth";
export const INTRO_PLAYED_KEY = "introPlayed";

export function getAuth(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AuthUser) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function hasIntroPlayed(): boolean {
  return localStorage.getItem(INTRO_PLAYED_KEY) === "true";
}

export function markIntroPlayed() {
  localStorage.setItem(INTRO_PLAYED_KEY, "true");
}

export function clearIntroPlayed() {
  localStorage.removeItem(INTRO_PLAYED_KEY);
}

const DEMO_CREDENTIALS: Record<
  string,
  { password: string; role: string; name: string }
> = {
  admin: { password: "admin123", role: "Admin", name: "System Admin" },
  operator: {
    password: "operator123",
    role: "Traffic Operator",
    name: "Traffic Operator",
  },
};

export async function login(
  username: string,
  password: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  const key = username.trim().toLowerCase();
  const local = DEMO_CREDENTIALS[key];

  if (local && local.password === password) {
    const user: AuthUser = { username: key, role: local.role, name: local.name };
    setAuth(user);
    return { success: true, user };
  }

  try {
    const res = await fetch("/api/login", {
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

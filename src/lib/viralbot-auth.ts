const TRIAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface UserData {
  name: string;
  password: string;
  trialStart: number;
}

function getUsers(): Record<string, UserData> {
  try { return JSON.parse(localStorage.getItem('vb_users') || '{}'); }
  catch { return {}; }
}

export function signUp(name: string, email: string, password: string) {
  const users = getUsers();
  if (users[email]) throw new Error('Email already registered');
  users[email] = { name, password, trialStart: Date.now() };
  localStorage.setItem('vb_users', JSON.stringify(users));
  localStorage.setItem('vb_session', email);
}

export function login(email: string, password: string) {
  const users = getUsers();
  const user = users[email];
  if (!user || user.password !== password) throw new Error('Invalid email or password');
  localStorage.setItem('vb_session', email);
}

export function logout() {
  localStorage.removeItem('vb_session');
}

export function getCurrentUser(): (UserData & { email: string }) | null {
  const email = localStorage.getItem('vb_session');
  if (!email) return null;
  const users = getUsers();
  if (!users[email]) return null;
  return { ...users[email], email };
}

export function getTrialStatus(): { expired: boolean; daysLeft: number; hoursLeft: number } | null {
  const user = getCurrentUser();
  if (!user) return null;
  const remaining = TRIAL_MS - (Date.now() - user.trialStart);
  const daysLeft = Math.max(0, Math.floor(remaining / (24 * 60 * 60 * 1000)));
  const hoursLeft = Math.max(0, Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));
  return { expired: remaining <= 0, daysLeft, hoursLeft };
}

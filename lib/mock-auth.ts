export const AUTH_COOKIE_NAME = "projectflow_session";

const AUTH_USERS_KEY = "projectflow.auth.users";
const AUTH_SESSION_KEY = "projectflow.auth.session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarFallback: string;
}

interface AuthPayload {
  name: string;
  email: string;
  password: string;
}

interface UpdateProfilePayload {
  name: string;
  avatarUrl?: string;
}

const defaultUsers: StoredUser[] = [
  {
    id: "demo-user",
    name: "Alex Morgan",
    email: "alex@projectflow.app",
    password: "demo1234",
  },
];

const canUseBrowserStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const createId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const normalizeAvatarUrl = (avatarUrl?: string) => {
  const normalized = avatarUrl?.trim();
  return normalized ? normalized : undefined;
};

const toSessionUser = (user: StoredUser): SessionUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  avatarFallback: getInitials(user.name),
});

const setSessionCookie = (email: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(email)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
};

const clearSessionCookie = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
};

const readUsers = (): StoredUser[] => {
  if (!canUseBrowserStorage()) {
    return defaultUsers;
  }

  const rawUsers = localStorage.getItem(AUTH_USERS_KEY);

  if (!rawUsers) {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    const parsedUsers = JSON.parse(rawUsers) as StoredUser[];

    if (!Array.isArray(parsedUsers) || parsedUsers.length === 0) {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }

    return parsedUsers;
  } catch {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
};

const writeUsers = (users: StoredUser[]) => {
  if (!canUseBrowserStorage()) {
    return;
  }

  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
};

const writeSession = (user: SessionUser | null) => {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (!user) {
    localStorage.removeItem(AUTH_SESSION_KEY);
    clearSessionCookie();
    return;
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  setSessionCookie(user.email);
};

const readSession = (): SessionUser | null => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const rawSession = localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as SessionUser;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
};

const readSessionEmailFromCookie = () => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] ?? "");
};

export const getDemoCredentials = () => ({
  email: defaultUsers[0].email,
  password: defaultUsers[0].password,
});

export const registerMockUser = ({ name, email, password }: AuthPayload) => {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const nextUser: StoredUser = {
    id: createId("user"),
    name: name.trim(),
    email: normalizedEmail,
    password,
  };

  const nextUsers = [...users, nextUser];
  writeUsers(nextUsers);

  const sessionUser = toSessionUser(nextUser);
  writeSession(sessionUser);

  return sessionUser;
};

export const loginMockUser = ({ email, password }: Omit<AuthPayload, "name">) => {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const matchedUser = users.find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail && user.password === password
  );

  if (!matchedUser) {
    throw new Error("Invalid email or password.");
  }

  const sessionUser = toSessionUser(matchedUser);
  writeSession(sessionUser);

  return sessionUser;
};

export const logoutMockUser = () => {
  writeSession(null);
};

export const restoreSessionUser = () => {
  const session = readSession();

  if (session) {
    return session;
  }

  const sessionEmail = readSessionEmailFromCookie();

  if (!sessionEmail) {
    return null;
  }

  const users = readUsers();
  const matchedUser = users.find(
    (user) => user.email.toLowerCase() === sessionEmail.toLowerCase()
  );

  if (!matchedUser) {
    return null;
  }

  const restoredUser = toSessionUser(matchedUser);
  writeSession(restoredUser);
  return restoredUser;
};

export const updateMockUserProfile = (
  userId: string,
  { name, avatarUrl }: UpdateProfilePayload
) => {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error("Unable to update this profile.");
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Name is required.");
  }

  const nextUser: StoredUser = {
    ...users[index],
    name: trimmedName,
    avatarUrl: normalizeAvatarUrl(avatarUrl),
  };

  const nextUsers = [...users];
  nextUsers[index] = nextUser;
  writeUsers(nextUsers);

  const sessionUser = toSessionUser(nextUser);
  writeSession(sessionUser);

  return sessionUser;
};

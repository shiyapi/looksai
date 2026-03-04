// ===== STORAGE & AUTH =====

const GROQ_DEFAULT = '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';

export const Auth = {
  // Returns current user object or null
  getUser() {
    try { return JSON.parse(localStorage.getItem('la_user') || 'null'); } catch { return null; }
  },

  // Returns array of all registered users
  getUsers() {
    try { return JSON.parse(localStorage.getItem('la_users') || '[]'); } catch { return []; }
  },

  // Register a new user - returns {ok, error}
  register(username, pin) {
    username = username.trim().toLowerCase();
    if (!username || username.length < 2) return { ok: false, error: 'Username too short' };
    if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'PIN must be 4 digits' };
    const users = this.getUsers();
    if (users.find(u => u.username === username)) return { ok: false, error: 'Username taken' };
    const user = { username, pin, createdAt: new Date().toISOString() };
    users.push(user);
    localStorage.setItem('la_users', JSON.stringify(users));
    localStorage.setItem('la_user', JSON.stringify(user));
    return { ok: true, user };
  },

  // Login - returns {ok, error}
  login(username, pin) {
    username = username.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return { ok: false, error: 'User not found' };
    if (user.pin !== pin) return { ok: false, error: 'Wrong PIN' };
    localStorage.setItem('la_user', JSON.stringify(user));
    return { ok: true, user };
  },

  logout() {
    localStorage.removeItem('la_user');
  },

  isLoggedIn() {
    return !!this.getUser();
  }
};

// User-scoped data store
export const Store = {
  _key(name) {
    const user = Auth.getUser();
    const prefix = user ? user.username : '_guest';
    return `la_${prefix}_${name}`;
  },

  get apiKey() {
    return localStorage.getItem('la_apikey') || GROQ_DEFAULT;
  },

  setApiKey(key) {
    localStorage.setItem('la_apikey', key);
  },

  get runs() {
    try { return JSON.parse(localStorage.getItem(this._key('runs')) || '[]'); } catch { return []; }
  },

  get foods() {
    try { return JSON.parse(localStorage.getItem(this._key('foods')) || '[]'); } catch { return []; }
  },

  get faces() {
    try { return JSON.parse(localStorage.getItem(this._key('faces')) || '[]'); } catch { return []; }
  },

  saveRun(r) {
    const a = this.runs; a.unshift(r);
    localStorage.setItem(this._key('runs'), JSON.stringify(a));
  },

  saveFood(f) {
    const a = this.foods; a.unshift(f);
    localStorage.setItem(this._key('foods'), JSON.stringify(a.slice(0, 60)));
  },

  saveFace(f) {
    const a = this.faces; a.unshift(f);
    localStorage.setItem(this._key('faces'), JSON.stringify(a.slice(0, 60)));
  },

  clearAll() {
    ['runs', 'foods', 'faces'].forEach(k => {
      localStorage.setItem(this._key(k), '[]');
    });
  }
};

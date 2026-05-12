const STORAGE_KEY = 'maperta_users';
const CURRENT_USER_KEY = 'maperta_current_user';
const CONTRIBUTIONS_KEY = 'maperta_contributions';

// 用户相关
export function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function registerUser(username, password) {
  const users = getUsers();
  if (users.find((u) => u.username === username)) {
    return { success: false, error: '用户名已存在' };
  }
  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    createdAt: new Date().toISOString(),
    contributions: 0,
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return { success: true, user: newUser };
}

export function loginUser(username, password) {
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return { success: false, error: '用户名或密码错误' };
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// 贡献相关
export function getContributions() {
  return JSON.parse(localStorage.getItem(CONTRIBUTIONS_KEY) || '[]');
}

export function submitContribution(contribution) {
  const contributions = getContributions();
  const newContribution = {
    id: Date.now().toString(),
    ...contribution,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  contributions.unshift(newContribution);
  localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(contributions));

  // 更新当前用户贡献数
  const user = getCurrentUser();
  if (user) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx].contributions = (users[idx].contributions || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[idx]));
    }
  }

  return newContribution;
}

export function approveContribution(id) {
  const contributions = getContributions();
  const idx = contributions.findIndex((c) => c.id === id);
  if (idx >= 0) {
    contributions[idx].status = 'approved';
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(contributions));
  }
}

export function rejectContribution(id) {
  const contributions = getContributions();
  const idx = contributions.findIndex((c) => c.id === id);
  if (idx >= 0) {
    contributions[idx].status = 'rejected';
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(contributions));
  }
}

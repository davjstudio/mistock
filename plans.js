export function parsePlan(fields = {}) {
  const expiry = fields.proExpiresAt?.timestampValue;
  return {
    plan: String(fields.plan?.stringValue ?? 'BASIC').toUpperCase() === 'PRO' ? 'PRO' : 'BASIC',
    role: String(fields.role?.stringValue ?? 'OWNER').toUpperCase() === 'MANAGER' ? 'MANAGER' : 'OWNER',
    status: String(fields.planStatus?.stringValue ?? 'active').toLowerCase(),
    expiresAt: expiry && Number.isFinite(Date.parse(expiry)) ? new Date(expiry).toISOString() : null
  };
}

export function isProActive(plan, now = Date.now()) {
  return !!plan && plan.plan === 'PRO' && plan.status === 'active' &&
    Number.isFinite(Date.parse(plan.expiresAt)) && Date.parse(plan.expiresAt) > now;
}

export function weeklyStatistics(movements, today = new Date()) {
  return Array.from({length: 7}, (_, index) => {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    const items = movements.filter(m => m.date && new Date(m.date) >= start && new Date(m.date) < end);
    return {
      date: start,
      entries: items.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0),
      exits: items.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0)
    };
  });
}


// Signals invalidate reads; socket payloads never replace authenticated data.
const subscriptions = new Set();
export function domainsForChange(name = '') {
  const value = String(name).toLowerCase();
  if (/auth\//.test(value)) return [];
  const domains = new Set();
  const add = (...items) => items.forEach(item => domains.add(item));
  if (/leaderboard|score|highscore|game.*(submit|finalize|ended)|reset/.test(value)) add('leaderboard','profile','rewards','game');
  if (/order|checkout|payment|ipos|delivery|shipper/.test(value)) add('orders','wallet','membership','leaderboard','missions','rewards','admin');
  if (/membership|loyalty|points|user\.updated/.test(value)) add('membership','profile','leaderboard','rewards');
  if (/wallet|coin|revive|revival|economy/.test(value)) add('wallet','game','membership','missions','admin');
  if (/game|chess|challenge|mission/.test(value)) add('game','missions','leaderboard','rewards','profile');
  if (/gift|charm|badge|profile|player|customer/.test(value)) add('profile','leaderboard','wallet','rewards','membership');
  if (/menu|product|category|inventory|stock/.test(value)) add('menu');
  if (/voucher|coupon|campaign/.test(value)) add('voucher','campaign','membership');
  if (/notification|reward/.test(value)) add('notifications','rewards','membership');
  if (/plaza/.test(value)) add('plaza','wallet','profile');
  if (/config|cms|banner|popup|system|admin/.test(value)) add('config','menu','campaign','admin');
  return [...domains];
}
export function subscribeLiveData(domains, callback) {
  const entry = {domains: new Set(domains), callback};
  subscriptions.add(entry);
  return () => subscriptions.delete(entry);
}
export function invalidateLiveData(domains = ['*']) {
  if (!domains.length) return;
  for (const entry of subscriptions) {
    if (domains.includes('*') || entry.domains.has('*') || domains.some(domain => entry.domains.has(domain))) entry.callback();
  }
}

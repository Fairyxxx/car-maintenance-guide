// utils/format.js —— 格式化工具

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

// Date -> 'YYYY-MM-DD'
function formatDate(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 里程 -> '38,000 km'
// 手动千分位，避免部分基础库下 toLocaleString('en-US') 行为不一致或抛错
function formatKm(km) {
  if (km === null || km === undefined || isNaN(km)) return '—';
  const n = Number(km);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n).toString();
  const parts = abs.split('.');
  const grouped = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = parts[1] ? '.' + parts[1] : '';
  return sign + grouped + frac + ' km';
}

// 时间戳 -> '3天前' / '刚刚'
function fromNow(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const day = 86400000;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
  if (diff < day) return Math.floor(diff / 3600000) + ' 小时前';
  if (diff < day * 30) return Math.floor(diff / day) + ' 天前';
  return Math.floor(diff / (day * 30)) + ' 个月前';
}

// 进度百分比 -> 文案
function progressText(progress) {
  if (progress >= 1) return '已超期';
  const pct = Math.round(progress * 100);
  return `已用 ${pct}%`;
}

// 金额 -> '¥1,280'
// 手动千分位（与 formatKm 同源思路，避免个别基础库 toLocaleString 行为不一致）
function formatYuan(n) {
  if (n === null || n === undefined || isNaN(n)) return '¥0';
  const num = Number(n);
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(Math.round(num)).toString();
  const grouped = abs.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + '¥' + grouped;
}

module.exports = { formatDate, formatKm, fromNow, progressText, formatYuan };

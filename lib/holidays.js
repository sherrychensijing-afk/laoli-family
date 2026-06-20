/**
 * lib/holidays.js — 2026年中国节假日数据 & 判断工具
 */

// 2026年中国法定节假日（含调休信息）
const HOLIDAYS_2026 = [
  // 元旦
  { name: '元旦', start: '2026-01-01', end: '2026-01-01', days: 1 },
  // 春节（除夕1/16开始放假，至1/23）
  { name: '春节', start: '2026-02-16', end: '2026-02-23', days: 8 },
  // 清明节
  { name: '清明节', start: '2026-04-05', end: '2026-04-05', days: 1 },
  // 劳动节
  { name: '劳动节', start: '2026-05-01', end: '2026-05-05', days: 5 },
  // 端午节
  { name: '端午节', start: '2026-06-19', end: '2026-06-19', days: 1 },
  // 中秋节
  { name: '中秋节', start: '2026-09-25', end: '2026-09-25', days: 1 },
  // 国庆节
  { name: '国庆节', start: '2026-10-01', end: '2026-10-07', days: 7 },
];

// 调休上班日（周末需要上班的日期）
const WORK_WEEKENDS_2026 = new Set([
  // 春节调休（预估：节前周末上班，节后周末上班）
  '2026-02-14', '2026-02-15', // 除夕前周末调休
  '2026-02-28',                // 春节后周末调休
  // 五一调休
  '2026-05-09',                // 五一后周末调休
  // 国庆调休
  '2026-10-10',                // 国庆后周末调休
]);

/**
 * 判断指定日期是否为节假日
 */
function isHoliday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  for (const h of HOLIDAYS_2026) {
    const start = new Date(h.start + 'T00:00:00+08:00');
    const end = new Date(h.end + 'T00:00:00+08:00');
    if (d >= start && d <= end) return { isHoliday: true, holiday: h, name: h.name };
  }
  return { isHoliday: false };
}

/**
 * 判断是否为工作日（含调休）
 * 周一-周五为工作日，但需排除节假日，并加入调休上班的周末
 */
function isWorkday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  const dayOfWeek = d.getDay(); // 0=周日, 6=周六

  // 调休上班日：即使是周末也算工作日
  if (WORK_WEEKENDS_2026.has(dateStr)) return true;

  // 节假日：不算工作日
  if (isHoliday(dateStr).isHoliday) return false;

  // 正常工作日：周一到周五
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * 获取指定日期之前最近的工作日
 */
function getLastWorkdayBefore(dateStr) {
  let d = new Date(dateStr + 'T00:00:00+08:00');
  d.setDate(d.getDate() - 1);
  let maxIterations = 30;
  while (maxIterations-- > 0) {
    const check = formatDate(d);
    if (isWorkday(check)) return check;
    d.setDate(d.getDate() - 1);
  }
  return dateStr;
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 获取日期加N天
 */
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

/**
 * 获取指定范围的节假日列表
 */
function getHolidaysInRange(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00+08:00');
  const end = new Date(endDate + 'T00:00:00+08:00');
  return HOLIDAYS_2026.filter(h => {
    const hs = new Date(h.start + 'T00:00:00+08:00');
    const he = new Date(h.end + 'T00:00:00+08:00');
    return (hs <= end && he >= start);
  });
}

/**
 * 检查某日期是否在某个节假日范围内
 */
function getHolidayForDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  for (const h of HOLIDAYS_2026) {
    const start = new Date(h.start + 'T00:00:00+08:00');
    const end = new Date(h.end + 'T00:00:00+08:00');
    if (d >= start && d <= end) return h;
  }
  return null;
}

/**
 * 获取指定日期所在周的周五和周日
 */
function getFridayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  const day = d.getDay();
  // 周五的 day=5, 计算出偏移量
  const offset = 5 - day;
  d.setDate(d.getDate() + offset);
  return formatDate(d);
}

function getSundayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00+08:00');
  const day = d.getDay();
  const offset = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + offset);
  return formatDate(d);
}

/**
 * 获取节假日前需要返回北京的日期（节前最后一个工作日）
 */
function getHolidayReturnDate(holiday) {
  const dayBefore = addDays(holiday.start, -1);
  return getLastWorkdayBefore(addDays(holiday.start, 0)) === dayBefore ? dayBefore : getLastWorkdayBefore(holiday.start);
}

/**
 * 获取节假日结束后返回无锡的日期（节假日最后一天）
 */
function getHolidayDepartDate(holiday) {
  return holiday.end;
}

module.exports = {
  HOLIDAYS_2026,
  isHoliday,
  isWorkday,
  getLastWorkdayBefore,
  formatDate,
  addDays,
  getHolidaysInRange,
  getHolidayForDate,
  getFridayOfWeek,
  getSundayOfWeek,
  getHolidayReturnDate,
  getHolidayDepartDate,
};

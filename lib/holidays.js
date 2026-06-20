/**
 * lib/holidays.js — 2026年中国节假日数据
 */
const HOLIDAYS_2026 = {
  // 元旦
  '2026-01-01': { name: '元旦', type: 'holiday' },
  '2026-01-02': { name: '元旦(调休)', type: 'work' },
  // 春节
  '2026-02-16': { name: '春节', type: 'holiday' },
  '2026-02-17': { name: '春节', type: 'holiday' },
  '2026-02-18': { name: '春节', type: 'holiday' },
  '2026-02-19': { name: '春节', type: 'holiday' },
  '2026-02-20': { name: '春节', type: 'holiday' },
  '2026-02-21': { name: '春节', type: 'holiday' },
  '2026-02-22': { name: '春节', type: 'holiday' },
  // 清明节
  '2026-04-05': { name: '清明节', type: 'holiday' },
  // 劳动节
  '2026-05-01': { name: '劳动节', type: 'holiday' },
  '2026-05-04': { name: '劳动节(调休)', type: 'work' },
  // 端午节
  '2026-06-19': { name: '端午节', type: 'holiday' },
  // 中秋节
  '2026-09-25': { name: '中秋节', type: 'holiday' },
  // 国庆节
  '2026-10-01': { name: '国庆节', type: 'holiday' },
  '2026-10-02': { name: '国庆节', type: 'holiday' },
  '2026-10-03': { name: '国庆节', type: 'holiday' },
  '2026-10-04': { name: '国庆节', type: 'holiday' },
  '2026-10-05': { name: '国庆节', type: 'holiday' },
  '2026-10-06': { name: '国庆节', type: 'holiday' },
  '2026-10-07': { name: '国庆节', type: 'holiday' },
  '2026-10-10': { name: '国庆(调休)', type: 'work' },
};

function isHoliday(dateStr) {
  return HOLIDAYS_2026[dateStr]?.type === 'holiday';
}

function isWorkDay(dateStr) {
  return HOLIDAYS_2026[dateStr]?.type === 'work';
}

// 获取节假日范围内需要调整的航班日期
function getAdjustedFlightDates() {
  const adjustments = [];
  const holidayRanges = [
    { start: '2026-02-15', end: '2026-02-23', name: '春节' },   // 春节前后
    { start: '2026-04-03', end: '2026-04-07', name: '清明' },
    { start: '2026-04-30', end: '2026-05-05', name: '劳动节' },
    { start: '2026-06-18', end: '2026-06-21', name: '端午' },
    { start: '2026-09-24', end: '2026-09-27', name: '中秋' },
    { start: '2026-09-30', end: '2026-10-11', name: '国庆' },
  ];
  
  holidayRanges.forEach(range => {
    adjustments.push({
      range: range.name,
      goBackEarly: range.start,       // 节前最后工作日晚回北京
      returnLate: range.end,         // 节后第一个工作日回无锡
    });
  });

  return adjustments;
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

module.exports = {
  HOLIDAYS_2026,
  isHoliday,
  isWorkDay,
  getAdjustedFlightDates,
  formatDate,
};

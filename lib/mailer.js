/**
 * lib/mailer.js — 每日邮件提醒模块
 * 使用 QQ 邮箱 SMTP 发送每日日程汇总
 *
 * 配置方式:
 *   在 data/email-config.json 中填写 QQ邮箱授权码
 *   获取授权码: QQ邮箱 → 设置 → 账户 → POP3/IMAP/SMTP服务 → 生成授权码
 */
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { formatDate } = require('./holidays');
const { generateAllSchedules } = require('./scheduler');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'email-config.json');
const SCHEDULES_PATH = path.join(DATA_DIR, 'schedules.json');

let transporter = null;
let emailConfig = null;

/**
 * 加载邮件配置
 */
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    emailConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } else {
    emailConfig = {
      enabled: false,
      smtp: {
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: { user: '875402983@qq.com', pass: '' },  // user: 发件QQ邮箱, pass: 授权码
      },
      recipient: '837806718@qq.com',
      schedule: '0 0 * * *',  // 每天 0:00
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(emailConfig, null, 2), 'utf-8');
  }
  return emailConfig;
}

/**
 * 初始化邮件发送器
 */
function initTransporter() {
  const cfg = loadConfig();
  if (!cfg.enabled) {
    console.log('📧 邮件提醒未启用，请在 data/email-config.json 中配置并设置 enabled: true');
    return null;
  }

  if (!cfg.smtp.auth.user || !cfg.smtp.auth.pass) {
    console.log('📧 邮件提醒配置不完整，请填写 QQ邮箱 和 授权码');
    return null;
  }

  transporter = nodemailer.createTransport(cfg.smtp);
  return transporter;
}

/**
 * 生成今日日程的 HTML 邮件内容
 */
function buildEmailHTML(todaySchedules, catStatus) {
  const today = formatDate(new Date());
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date();
  const weekDay = weekDays[d.getDay()];
  const dateStr = `${today} 星期${weekDay}`;

  const timeLabel = { morning: '🌅 上午', afternoon: '☀️ 下午', evening: '🌙 晚上', bedtime: '🌜 睡前' };
  const catLabel = { travel: '✈️', pet: '🐱', intimacy: '❤️', family: '🏡' };

  const scheduleItems = todaySchedules.length > 0
    ? todaySchedules.map(s => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8db;">
          <span style="font-size:16px;">${catLabel[s.category] || '📌'}</span>
          <strong style="color:#3D2C1E;">${s.title}</strong>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8db;color:#7A6652;">${timeLabel[s.time] || ''}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8db;color:#B0A090;font-size:13px;">${s.person || ''}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="3" style="padding:20px;text-align:center;color:#B0A090;">今天没有待办日程 ✨</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:-apple-system,PingFang SC,Microsoft YaHei,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FDE8D0,#FFF3E6,#FDE4E8);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px;">
      <div style="font-size:36px;">🏠</div>
      <h1 style="color:#3D2C1E;font-size:24px;margin:8px 0;">老郦家 · 今日提醒</h1>
      <p style="color:#7A6652;font-size:14px;margin:0;">${dateStr}</p>
    </div>

    <!-- Cat Status -->
    <div style="background:#fff;border-radius:12px;padding:16px 20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(61,44,30,0.06);">
      <h3 style="color:#3D2C1E;font-size:15px;margin:0 0 10px;">🐱 猫咪状态</h3>
      <p style="color:#7A6652;font-size:13px;margin:4px 0;">冻干喂食: 距上次 <strong style="color:#E8913A;">${catStatus.daysSinceFed}</strong> 天${catStatus.nextFed === '今天' ? ' ⚠️ 今天该喂了！' : ''}</p>
      <p style="color:#7A6652;font-size:13px;margin:4px 0;">水粮检查: 距上次加满 <strong style="color:#E8913A;">${catStatus.daysSinceWater}</strong> 天${catStatus.nextWaterCheck === '今天' ? ' ⚠️ 今天该检查了！' : ''}</p>
    </div>

    <!-- Today's Schedule -->
    <div style="background:#fff;border-radius:12px;padding:16px 20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(61,44,30,0.06);">
      <h3 style="color:#3D2C1E;font-size:15px;margin:0 0 10px;">📋 今日待办</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${scheduleItems}
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px;">
      <p style="color:#B0A090;font-size:12px;margin:0;">
        🐷 老郦家家庭管理系统自动发送<br>
        <a href="http://localhost:3456" style="color:#E8913A;">打开管理系统</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 发送每日提醒邮件
 */
async function sendDailyReminder() {
  try {
    const t = initTransporter();
    if (!t) return;

    const stored = fs.existsSync(SCHEDULES_PATH)
      ? JSON.parse(fs.readFileSync(SCHEDULES_PATH, 'utf-8'))
      : { completed: [], custom: [] };

    const allSchedules = generateAllSchedules(stored);
    const today = formatDate(new Date());
    const todaySchedules = allSchedules.filter(s => s.date === today && !s.completed);

    // 猫咪状态
    const lastFed = '2026-06-20';
    const lastWater = '2026-06-19';
    const daysSinceFed = Math.floor((new Date(today) - new Date(lastFed)) / (1000 * 60 * 60 * 24));
    const daysSinceWater = Math.floor((new Date(today) - new Date(lastWater)) / (1000 * 60 * 60 * 24));

    const html = buildEmailHTML(todaySchedules, {
      daysSinceFed, daysSinceWater,
      nextFed: daysSinceFed >= 2 ? '今天' : `${2 - daysSinceFed}天后`,
      nextWaterCheck: daysSinceWater >= 3 ? '今天' : `${3 - daysSinceWater}天后`,
    });

    const info = await t.sendMail({
      from: `"老郦家管家 🐷" <${emailConfig.smtp.auth.user}>`,
      to: emailConfig.recipient,
      subject: `🏠 老郦家今日提醒 · ${today}${todaySchedules.length > 0 ? ` (${todaySchedules.length}项待办)` : ''}`,
      html,
    });

    console.log(`📧 每日提醒邮件已发送 → ${emailConfig.recipient} (${info.messageId})`);
  } catch (err) {
    console.error('📧 邮件发送失败:', err.message);
  }
}

/**
 * 启动定时任务
 */
function startScheduler() {
  const cfg = loadConfig();

  if (!cfg.enabled) {
    console.log('📧 邮件提醒未启用 (enabled: false)');
    return;
  }

  if (!cfg.smtp.auth.user || !cfg.smtp.auth.pass) {
    console.log('📧 邮件提醒配置不完整，跳过定时任务');
    return;
  }

  // 初始化 transporter
  initTransporter();
  if (!transporter) return;

  const cronExpr = cfg.schedule || '0 0 * * *';
  cron.schedule(cronExpr, () => {
    console.log('⏰ 定时任务触发 - 发送每日提醒邮件');
    sendDailyReminder();
  }, {
    timezone: 'Asia/Shanghai',
  });

  console.log(`📧 每日邮件提醒已启动 (${cronExpr}, 北京时间)`);
}

/**
 * 手动触发发送（测试用）
 */
async function testSend() {
  return sendDailyReminder();
}

module.exports = {
  startScheduler,
  sendDailyReminder,
  testSend,
  loadConfig,
};

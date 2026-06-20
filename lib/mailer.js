/**
 * lib/mailer.js — 每日邮件提醒
 */
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const DATA_DIR = path.join(__dirname, '..', 'data');

let transporter = null;
let emailConfig = null;

function loadConfig() {
  try {
    const cfgPath = path.join(DATA_DIR, 'email-config.json');
    if (fs.existsSync(cfgPath)) {
      emailConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      return emailConfig;
    }
  } catch (e) { /* ignore */ }
  return {
    enabled: false,
    recipient: '837806718@qq.com',
    schedule: '0 0 * * *',
    smtp: { service: 'QQ', auth: { user: '875402983@qq.com', pass: '' } },
  };
}

function initTransporter() {
  const cfg = loadConfig();
  if (!cfg.smtp?.auth?.pass) return null;
  
  try {
    transporter = nodemailer.createTransport({
      service: cfg.smtp.service || 'QQ',
      auth: { user: cfg.smtp.auth.user, pass: cfg.smtp.auth.pass },
    });
    return transporter;
  } catch (e) {
    console.error('[Mailer] 初始化失败:', e.message);
    return null;
  }
}

async function buildEmailContent() {
  const familyPath = path.join(DATA_DIR, 'family.json');
  const schedulesPath = path.join(DATA_DIR, 'schedules.json');
  const feedLogPath = path.join(DATA_DIR, 'feed-log.json');
  
  let family = {}, schedules = { completed: [], custom: [] }, feedLog = {};
  try { family = JSON.parse(fs.readFileSync(familyPath, 'utf-8')); } catch (_) {}
  try { schedules = JSON.parse(fs.readFileSync(schedulesPath, 'utf-8')); } catch (_) {}
  try { feedLog = JSON.parse(fs.readFileSync(feedLogPath, 'utf-8')); } catch (_) {}

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  // 用 scheduler 计算今日日程
  const { generateAllSchedules } = require('./scheduler');
  const allScheds = generateAllSchedules(schedules);
  const todayItems = allScheds.filter(s => s.date === todayStr && !s.completed);

  const timeLabel = { morning: '上午', afternoon: '下午', evening: '晚上', bedtime: '睡前' };
  
  let body = `<h2>老郦家 · ${todayStr} 星期${weekDays[now.getDay()]}</h2>`;
  
  if (todayItems.length === 0) {
    body += '<p>今天没有待办事项，享受轻松的一天吧！</p>';
  } else {
    body += '<ul style="padding-left:20px;">';
    todayItems.forEach(s => {
      body += `<li><b>${timeLabel[s.time] || ''}</b> ${s.title}${s.person ? ' · ' + s.person : ''}</li>`;
    });
    body += '</ul>';
  }

  // 猫咪状态
  if (feedLog.lastFedFreezeDry) {
    const daysFed = Math.floor((now - new Date(feedLog.lastFedFreezeDry)) / 86400000);
    body += `<p>冻干上次喂食：${feedLog.lastFedFreezeDry}（${daysFed}天前）</p>`;
  }

  return {
    subject: `老郦家日程提醒 · ${todayStr}`,
    html: `${body}<hr/><small style="color:#999;">此邮件由老郦家家庭管理系统自动发送</small>`,
  };
}

async function sendDailyEmail() {
  if (!transporter) initTransporter();
  if (!transporter) return;

  const cfg = loadConfig();
  if (!cfg.enabled || !cfg.recipient) return;

  try {
    const { subject, html } = await buildEmailContent();
    await transporter.sendMail({
      from: `"老郦家" <${cfg.smtp.auth.user}>`,
      to: cfg.recipient,
      subject,
      html,
    });
    console.log(`[Mailer] 邮件已发送至 ${cfg.recipient}`);
  } catch (e) {
    console.error(`[Mailer] 发送失败:`, e.message);
  }
}

async function testSend() {
  initTransporter();
  if (!transporter) throw new Error('请先配置邮箱授权码');
  
  const cfg = loadConfig();
  const { subject, html } = await buildEmailContent();
  await transporter.sendMail({
    from: `"老郦家 [测试]" <${cfg.smtp.auth.user}>`,
    to: cfg.recipient,
    subject: '[测试] ' + subject,
    html: '<p>这是一封测试邮件，如果您收到说明配置正确！</p>' + html,
  });
  console.log('[Mailer] 测试邮件发送成功');
}

function startScheduler() {
  const cfg = loadConfig();
  if (!cfg.enabled) {
    console.log('[Mailer] 邮件提醒未启用（可在网页中开启）');
    return;
  }

  initTransporter();
  
  // 解析 cron 表达式
  const scheduleExpr = cfg.schedule || '0 0 * * *';
  
  try {
    cron.schedule(scheduleExpr, () => {
      sendDailyEmail();
    }, { scheduled: true });
    console.log(`[Mailer] 定时任务已启动: ${scheduleExpr}`);
  } catch (e) {
    console.error('[Mailer] cron 调度失败:', e.message);
  }
}

module.exports = {
  loadConfig,
  initTransporter,
  sendDailyEmail,
  testSend,
  startScheduler,
};

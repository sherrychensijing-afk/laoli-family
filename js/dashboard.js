/**
 * js/dashboard.js — 首页概览
 */
const Dashboard = {
  async render() {
    const [family, dash] = await Promise.all([
      API.get('/api/family'),
      API.get('/api/dashboard'),
    ]);

    this.renderGreeting();
    this.renderMembers(family);
    this.renderTodayTodos(dash);
    this.renderCatStatus(dash);
    this.loadEmailConfig();
  },

  renderGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = '早上好';
    if (hour >= 12 && hour < 18) greeting = '下午好';
    else if (hour >= 18 || hour < 5) greeting = '晚上好';

    document.getElementById('greetingText').textContent = `${greeting}，老郦家`;

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const w = weekDays[now.getDay()];
    document.getElementById('todayDate').textContent = `${y}年${m}月${d}日 星期${w}`;
  },

  renderMembers(family) {
    const container = document.getElementById('memberCards');
    const emoji = { human: '👤', cat: '🐱' };
    const emojiMap = { '郦赟': '👨', '陈思婧': '👩', 'LUMI': '🐱', '弟弟': '🐱' };
    const roleClass = { '正家主': 'role-家主', '副家主': 'role-副家主', '成员': 'role-成员' };

    container.innerHTML = family.members.map(m => {
      const roleCls = m.type === 'cat' ? 'role-猫咪' : (roleClass[m.role] || 'role-成员');
      return `
        <div class="member-card">
          <div class="member-avatar" style="background: ${m.color}">${emojiMap[m.name] || '👤'}</div>
          <div class="member-info">
            <h4>${m.name}</h4>
            <div class="meta">${m.gender} · ${m.age}岁${m.breed ? ' · ' + m.breed : ''}</div>
            <span class="member-role ${roleCls}">${m.role}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderTodayTodos(dash) {
    const container = document.getElementById('todayTodos');
    if (!dash.todaySchedules || dash.todaySchedules.length === 0) {
      container.innerHTML = '<div class="empty-state">今天没有待办事项 🎉</div>';
      return;
    }

    const catEmoji = { travel: '✈️', pet: '🐱', intimacy: '❤️', family: '🏡', custom: '📝' };
    const timeLabel = { morning: '上午', afternoon: '下午', evening: '晚上', bedtime: '睡前' };

    container.innerHTML = dash.todaySchedules.map(s => `
      <div class="todo-item" data-sid="${s.id}">
        <div class="todo-check" onclick="Dashboard.toggleTodo('${s.id}', this)" title="标记完成"></div>
        <div class="todo-category">${catEmoji[s.category] || '📌'}</div>
        <div class="todo-info">
          <div class="title">${s.title}</div>
          <div class="desc">${s.description || ''}</div>
        </div>
        <div class="todo-time">${timeLabel[s.time] || s.time || ''}</div>
      </div>
    `).join('');
  },

  async toggleTodo(id, el) {
    try {
      await API.post(`/api/schedules/${id}/complete`);
      el.classList.add('checked');
      el.textContent = '✓';
      setTimeout(() => this.render(), 500);
      App.showToast('已标记完成 ✓');
    } catch (e) {
      console.error('Toggle todo failed:', e);
    }
  },

  renderCatStatus(dash) {
    const container = document.getElementById('catStatus');
    const cs = dash.catStatus;

    const fedUrgent = cs.daysSinceFed >= 2;
    const waterUrgent = cs.daysSinceWater >= 3;

    container.innerHTML = `
      <div class="cat-stat-item">
        <div class="cat-stat-icon ${fedUrgent ? 'urgent' : 'normal'}">🍖</div>
        <div class="cat-stat-info">
          <h4>冻干喂食</h4>
          <p>上次：${cs.lastFedFreezeDry}（${cs.daysSinceFed}天前）· ${fedUrgent ? '⚠️ 今天该喂了！' : `下次：${cs.nextFed}`}</p>
        </div>
      </div>
      <div class="cat-stat-item">
        <div class="cat-stat-icon ${waterUrgent ? 'urgent' : 'normal'}">💧</div>
        <div class="cat-stat-info">
          <h4>水 & 猫粮检查</h4>
          <p>上次加满：${cs.lastRefillWater}（${cs.daysSinceWater}天前）· ${waterUrgent ? '⚠️ 今天该检查了！' : `下次：${cs.nextWaterCheck}`}</p>
        </div>
      </div>
    `;
  },

  // ========== 邮件配置 ==========
  async loadEmailConfig() {
    try {
      const cfg = await API.get('/api/email-config');
      document.getElementById('emailEnabled').value = String(cfg.enabled);
      document.getElementById('emailUser').value = cfg.smtpUser || '';
      document.getElementById('emailPass').value = '';
      document.getElementById('emailRecipient').value = cfg.recipient || '837806718@qq.com';
      this.updateEmailFields(cfg.enabled);
    } catch (e) {
      console.error('Load email config failed:', e);
    }
  },

  updateEmailFields(enabled) {
    const fields = document.getElementById('emailAuthFields');
    if (enabled) {
      fields.style.display = 'block';
    } else {
      fields.style.display = 'none';
    }
  },

  toggleEmailConfig() {
    const enabled = document.getElementById('emailEnabled').value === 'true';
    this.updateEmailFields(enabled);
  },

  async saveEmailConfig() {
    const enabled = document.getElementById('emailEnabled').value === 'true';
    const smtpUser = document.getElementById('emailUser').value.trim();
    const smtpPass = document.getElementById('emailPass').value.trim();
    const recipient = document.getElementById('emailRecipient').value.trim();

    if (enabled && (!smtpUser || !smtpPass)) {
      App.showToast('请填写QQ邮箱和授权码');
      return;
    }

    try {
      const resp = await API.put('/api/email-config', {
        enabled,
        smtpUser,
        smtpPass: smtpPass || undefined,
        recipient,
      });
      document.getElementById('emailPass').value = '';
      document.getElementById('emailStatus').innerHTML =
        `<span style="color:var(--color-green);">✅ ${resp.message}</span>`;
      App.showToast('邮件配置已保存');
    } catch (e) {
      document.getElementById('emailStatus').innerHTML =
        `<span style="color:var(--color-red);">❌ 保存失败</span>`;
    }
  },

  async testEmail() {
    const status = document.getElementById('emailStatus');
    status.innerHTML = '<span style="color:var(--color-warm);">📨 正在发送测试邮件...</span>';
    try {
      const resp = await API.post('/api/email-config/test');
      if (resp.success) {
        status.innerHTML = '<span style="color:var(--color-green);">✅ 测试邮件发送成功！请检查收件箱</span>';
      } else {
        status.innerHTML = `<span style="color:var(--color-red);">❌ ${resp.message}</span>`;
      }
    } catch (e) {
      status.innerHTML = '<span style="color:var(--color-red);">❌ 发送失败，请检查邮箱配置</span>';
    }
  },
};

/**
 * js/dashboard.js — 首页渲染
 */
const Dashboard = {
  async render() {
    try {
      const [family, dash] = await Promise.all([API.get('/api/family'), API.get('/api/dashboard')]);
      this.renderGreeting(dash);
      this.renderMembers(family);
      this.renderTodayTodos(dash);
      this.renderAnniversaries(dash);
      this.renderCatStatus(dash);
      this.loadEmailConfig();
    } catch (e) { console.error('Dashboard load failed:', e); }
  },

  renderGreeting(dash) {
    const now = new Date(), h = now.getHours();
    let g = '早上好';
    if (h >= 12 && h < 18) g = '下午好'; else if (h >= 18 || h < 5) g = '晚上好';
    document.getElementById('greetingText').textContent = g + ', 老郦家';
    const wds = ['日','一','二','三','四','五','六'];
    const ds = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日 星期' + wds[now.getDay()];
    document.getElementById('todayDate').textContent = ds;
  },

  renderMembers(fam) {
    const el = document.getElementById('memberCards');
    const emojiMap = { '郦赟':'\u{1F464}','陈思婧':'\u{1F469}','LUMI':'\u{1F431}','弟弟':'\u{1F431}' };
    const roleCls = { '正家主':'role-家主', '副家主':'role-副家主', '成员':'role-成员' };
    el.innerHTML = fam.members.map(m =>
      '<div class="member-card">' +
        '<div class="member-avatar" style="background:' + m.color + '">' + (emojiMap[m.name]||'?') + '</div>' +
        '<div class="member-info"><h4>' + m.name + '</h4>' +
        '<div class="meta">' + m.gender + ' · ' + m.age + '岁</div>' +
        '<span class="member-role ' + (roleCls[m.role]||'') + '">' + m.role + '</span></div></div>'
    ).join('');
  },

  renderTodayTodos(dash) {
    const el = document.getElementById('todayTodos');
    if (!dash.todaySchedules || !dash.todaySchedules.length) {
      el.innerHTML = '<div class="empty-state">今天没有待办</div>'; return;
    }

    API.get('/api/schedules').then(all => {
      const todayStr = Object.keys({})[0] || '';
      // Get actual today string from server
      fetch('/api/dashboard').then(r => r.json()).then(d => {
        const ts = d.today;
        const tItems = all.filter(s => s.date === ts);
        if (!tItems.length) { el.innerHTML = '<div class="empty-state">今天没有待办</div>'; return; }

        const catEmoji = { travel:'\u2708', pet:'\u{1F431}', intimacy:'\u2665', family:'\u25C6', custom:'\u25CB' };
        const timeLabel = { morning:'上午', afternoon:'下午', evening:'晚上', bedtime:'睡前' };

        el.innerHTML = tItems.map(s => {
          const done = s.completed ? ' done' : '';
          const chk = s.completed ? ' checked' : '';
          return '<div class="todo-item' + done + '" data-sid="' + s.id + '">' +
            '<div class="todo-check' + chk + '" onclick="Dashboard.toggleTodo(\'' + s.id + '\',this)" title="' + (s.completed?'取消完成':'标记完成') + '">' + (s.completed?'&#10003;':'') + '</div>' +
            '<div class="todo-category">' + (catEmoji[s.category]||'\u{1F4CC}') + '</div>' +
            '<div class="todo-info"><div class="title">' + s.title + '</div><div class="desc">' + (s.description||'') + '</div></div>' +
            '<div class="todo-time">' + (timeLabel[s.time]||s.time||'') + '</div></div>';
        }).join('');
      });
    });
  },

  async toggleTodo(id, el) {
    const done = el.classList.contains('checked');
    try {
      if (done) { await API.post('/api/schedules/' + id + '/uncomplete'); App.showToast('已恢复未完成'); }
      else { await API.post('/api/schedules/' + id + '/complete'); App.showToast('已完成'); }
      setTimeout(() => this.render(), 300);
    } catch(e) { console.error(e); }
  },

  renderAnniversaries(dash) {
    const el = document.getElementById('anniversaryList');
    if (!dash.anniversaries || !dash.anniversaries.length) {
      el.innerHTML = '<div class="empty-state">暂无纪念日数据</div>'; return;
    }

    el.innerHTML = dash.anniversaries.map(a => {
      let cc = '', cs = '', ct = '';
      if (a.daysUntil === 0) { cc = 'today'; cs = 'countdown-today'; ct = '\u{1F389} 今天!'; }
      else if (a.daysUntil <= 7) { cc = 'soon'; cs = 'countdown-week'; ct = a.daysUntil + '天后'; }
      else if (a.daysUntil <= 30) { cs = 'countdown-week'; ct = a.daysUntil + '天后'; }
      else { cs = 'countdown-month'; ct = a.daysUntil + '天后'; }

      const dp = a.date.split('-');
      return '<div class="anniversary-card ' + cc + '">' +
        '<div class="anniversary-avatar" style="background:' + a.color + '">' + (a.emoji||'\u{1F382}') + '</div>' +
        '<div class="anniversary-info"><h4>' + a.name + ' · ' + a.nextAge + '岁生日</h4>' +
        '<div class="date-label">' + parseInt(dp[1]) + '月' + parseInt(dp[2]) + '日</div></div>' +
        '<span class="anniversary-countdown ' + cs + '">' + ct + '</span></div>';
    }).join('');
  },

  renderCatStatus(dash) {
    var c = dash.catStatus;
    var fUrgent = c.daysSinceFed >= 2;
    var wUrgent = c.daysSinceWater >= 3;
    var container = document.getElementById("catStatus");
    var fedWarn = fUrgent ? "\u26A0\uFE0F \u4ECA\u5929\u8BE5\u5582\u4E86\uFF01" : "\u4E0B\u6B21\uFF1A" + c.nextFed;
    var waterWarn = wUrgent ? "\u26A0\uFE0F \u4ECA\u5929\u68C0\u67E5\u4E86\uFF01" : "\u4E0B\u6B21\uFF1A" + c.nextWaterCheck;
    container.innerHTML =
      "<div class=\"cat-stat-item\">" +
        "<div class=\"cat-stat-icon " + (fUrgent ? "urgent" : "normal") + "\">" + "\uD83C\uDF5D" + "</div>" +
        "<div class=\"cat-stat-info\"><h4>\u51BB\u5E72\u5582\u98DF</h4><p>\u4E0A\u6B21\uFF1A" + c.lastFedFreezeDry + "\uFF08" + c.daysSinceFed + "\u5929\u524D\uFF09 \u00B7 " + fedWarn + "</p></div></div>" +
      "<div class=\"cat-stat-item\">" +
        "<div class=\"cat-stat-icon " + (wUrgent ? "urgent" : "normal") + "\">" + "\uD83D\uDCA7" + "</div>" +
        "<div class=\"cat-stat-info\"><h4>\u6C34 & \u732B\u7CAE\u68C0\u67E5</h4><p>\u4E0A\u6B21\u52A0\u6EE1\uFF1A" + c.lastRefillWater + "\uFF08" + c.daysSinceWater + "\u5929\u524D\uFF09 \u00B7 " + waterWarn + "</p></div></div>";
  },

  /* ====== 邮件设置 ====== */
  async loadEmailConfig() {
    try {
      const cfg = await API.get('/api/email-config');
      document.getElementById('emailEnabled').value = String(cfg.enabled);
      document.getElementById('emailUser').value = cfg.smtpUser || '';
      document.getElementById('emailPass').value = '';
      document.getElementById('emailRecipient').value = cfg.recipient || '837806718@qq.com';
      this.updateEmailFields(cfg.enabled);
    } catch(_) {}
  },

  updateEmailFields(en) {
    document.getElementById('emailAuthFields').style.display = en ? 'block' : 'none';
  },

  toggleEmailConfig() { this.updateEmailFields(document.getElementById('emailEnabled').value === 'true'); },

  async saveEmailConfig() {
    const en = document.getElementById('emailEnabled').value === 'true';
    const u = document.getElementById('emailUser').value.trim();
    const p = document.getElementById('emailPass').value.trim();
    const r = document.getElementById('emailRecipient').value.trim();

    if (en && (!u || !p)) { App.showToast('请填写邮箱和授权码'); return; }

    try {
      await API.put('/api/email-config', { enabled: en, smtpUser: u, smtpPass: p || undefined, recipient: r });
      document.getElementById('emailPass').value = '';
      document.getElementById('emailStatus').innerHTML = '<span style="color:#7CB97C;">&#x2705; 已保存</span>';
      App.showToast('邮件配置已保存');
    } catch(_) { document.getElementById('emailStatus').innerHTML = '<span style="color:#D94545;">&#x274C; 失败</span>'; }
  },

  async testEmail() {
    const st = document.getElementById('emailStatus');
    st.innerHTML = '<span style="color:#E8913A;">发送中...</span>';
    try {
      const resp = await API.post('/api/email-config/test');
      st.innerHTML = resp.success ? '<span style="color:#7CB97C;">&#x2705; 测试发送成功！请检查收件箱</span>' : '<span style="color:#D94545;">&#x274C; ' + resp.message + '</span>';
    } catch(_) { st.innerHTML = '<span style="color:#D94545;">&#x274C; 发送失败，检查配置</span>'; }
  },
};

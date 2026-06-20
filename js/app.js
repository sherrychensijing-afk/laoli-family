/**
 * js/app.js — 主控制器（Tab切换 + Toast）
 */
const App = {
  init() {
    // Tab 切换
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
    // 加载默认首页
    this.switchTab('dashboard');
  },

  async switchTab(tab) {
    // 更新导航状态
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    // 切换内容
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById('tab-' + tab);
    if (target) target.classList.add('active');

    // 加载数据
    try {
      if (tab === 'dashboard') await Dashboard.render();
      else if (tab === 'schedule') await Schedule.render();
      else if (tab === 'rules') await Rules.render();
      else if (tab === 'messages') await Messages.render();
      else if (tab === 'photos') await Photos.render();
    } catch(e) { console.error('Tab render error:', e); }
  },

  showToast(msg, duration) {
    duration = duration || 2200;
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
  },
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());

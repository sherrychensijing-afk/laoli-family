/**
 * js/app.js — 主入口，Tab切换 + 全局事件绑定
 */
const App = {
  currentTab: 'dashboard',

  async init() {
    this.bindNavTabs();
    this.bindModals();
    this.bindScheduleEvents();
    this.bindRulesEvents();

    // 初始加载首页
    await Dashboard.render();
  },

  bindNavTabs() {
    document.getElementById('navTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-tab');
      if (!tab) return;
      this.switchTab(tab.dataset.tab);
    });
  },

  async switchTab(tab) {
    if (this.currentTab === tab) return;

    // 更新 Tab 样式
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-tab[data-tab="${tab}"]`).classList.add('active');

    // 切换内容
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    this.currentTab = tab;

    // 加载对应数据
    if (tab === 'dashboard') await Dashboard.render();
    else if (tab === 'schedule') await Schedule.render();
    else if (tab === 'rules') await Rules.render();
    else if (tab === 'messages') await Messages.render();
  },

  bindModals() {
    // Schedule modal
    document.getElementById('btnAddSchedule')?.addEventListener('click', () => Schedule.showAddModal());
    document.getElementById('btnCloseModal')?.addEventListener('click', () => Schedule.hideAddModal());
    document.getElementById('btnSaveSchedule')?.addEventListener('click', () => Schedule.saveNewSchedule());
    document.getElementById('addScheduleModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Schedule.hideAddModal();
    });

    // Rules modal
    document.getElementById('btnAddRule')?.addEventListener('click', () => Rules.showAddModal());
    document.getElementById('btnEditRules')?.addEventListener('click', () => Rules.toggleEditMode());
    document.getElementById('btnCloseRuleModal')?.addEventListener('click', () => Rules.hideModal());
    document.getElementById('btnSaveRule')?.addEventListener('click', () => Rules.saveRule());
    document.getElementById('ruleModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Rules.hideModal();
    });

    // ESC 关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Schedule.hideAddModal();
        Rules.hideModal();
      }
    });
  },

  bindScheduleEvents() {
    // 分类筛选
    document.getElementById('filterChips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      Schedule.setFilter(chip.dataset.filter);
    });
  },

  bindRulesEvents() {
    // (additional bindings handled inline via onclick)
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  },
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => App.init());

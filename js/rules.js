/**
 * js/rules.js — 郦家家规
 */
const Rules = {
  editMode: false,
  rules: [],

  async render() {
    try {
      this.rules = await API.get('/api/rules');
      this.renderList();
    } catch (e) {
      document.getElementById('rulesList').innerHTML =
        '<div class="empty-state">加载家规失败，请检查服务是否启动</div>';
    }
  },

  renderList() {
    const container = document.getElementById('rulesList');
    if (!this.rules || this.rules.length === 0) {
      container.innerHTML = '<div class="empty-state">还没有家规，点击上方按钮添加</div>';
      return;
    }

    container.innerHTML = this.rules.map(r => `
      <div class="rule-card" data-rid="${r.id}">
        <div class="rule-card-header">
          <div class="rule-number">${r.order}</div>
          <h4>${r.title}</h4>
          ${this.editMode ? `
          <div class="rule-actions-inline">
            <button class="btn btn-outline" onclick="Rules.editRule('${r.id}')">编辑</button>
            <button class="btn btn-danger" onclick="Rules.deleteRule('${r.id}')">删除</button>
          </div>` : ''}
        </div>
        <div class="rule-content">${r.content}</div>
      </div>
    `).join('');
  },

  toggleEditMode() {
    this.editMode = !this.editMode;
    const btn = document.getElementById('btnEditRules');
    if (this.editMode) {
      btn.innerHTML = '👁️ 查看模式';
      btn.dataset.mode = 'edit';
    } else {
      btn.innerHTML = '✏️ 编辑模式';
      btn.dataset.mode = 'view';
    }
    this.renderList();
  },

  showAddModal() {
    document.getElementById('ruleModalTitle').textContent = '添加规则';
    document.getElementById('ruleTitle').value = '';
    document.getElementById('ruleContent').value = '';
    document.getElementById('ruleEditId').value = '';
    document.getElementById('ruleModal').classList.add('show');
    document.getElementById('ruleTitle').focus();
  },

  hideModal() {
    document.getElementById('ruleModal').classList.remove('show');
  },

  editRule(id) {
    const rule = this.rules.find(r => r.id === id);
    if (!rule) return;
    document.getElementById('ruleModalTitle').textContent = '编辑规则';
    document.getElementById('ruleTitle').value = rule.title;
    document.getElementById('ruleContent').value = rule.content;
    document.getElementById('ruleEditId').value = id;
    document.getElementById('ruleModal').classList.add('show');
  },

  async saveRule() {
    const title = document.getElementById('ruleTitle').value.trim();
    const content = document.getElementById('ruleContent').value.trim();
    const editId = document.getElementById('ruleEditId').value;

    if (!title || !content) {
      App.showToast('请填写标题和内容');
      return;
    }

    try {
      if (editId) {
        await API.put(`/api/rules/${editId}`, { title, content });
      } else {
        await API.post('/api/rules', { title, content });
      }
      this.hideModal();
      await this.render();
      App.showToast(editId ? '规则已更新 ✓' : '规则已添加 ✓');
    } catch (e) {
      console.error('Save rule failed:', e);
      App.showToast('保存失败，请重试');
    }
  },

  async deleteRule(id) {
    if (!confirm('确定要删除这条家规吗？')) return;
    try {
      await API.del(`/api/rules/${id}`);
      await this.render();
      App.showToast('规则已删除');
    } catch (e) {
      console.error('Delete rule failed:', e);
    }
  },
};

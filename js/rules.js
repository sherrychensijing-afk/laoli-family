/**
 * js/rules.js — 郦家家规管理
 */
const Rules = {
  async render() {
    try { const list = await API.get('/api/rules'); this.drawList(list); }
    catch(e) { console.error(e); document.getElementById('rulesList').innerHTML = '<div class="empty-state">加载失败</div>'; }
  },

  drawList(rules) {
    const el = document.getElementById('rulesList');
    if (!rules.length) { el.innerHTML = '<div class="empty-state">暂无家规</div>'; return; }

    el.innerHTML = rules.map((r, i) =>
      '<div class="rule-card">' +
        '<div class="rule-card-header"><span class="rule-number">' + (i+1) + '</span>' +
        '<h4>' + r.title + '</h4></div>' +
        '<div class="rule-content">' + r.content + '</div>' +
        '<div class="rule-actions"><button class="btn btn-outline btn-sm" onclick="Rules.editRule(\'' + r.id + '\',\'' + (r.title||'').replace(/'/g,"\\'") + '\',\'' + (r.content||'').replace(/'/g,"\\'") + '\')">编辑</button>' +
        '<button class="btn btn-danger btn-sm" onclick="Rules.deleteRule(\'' + r.id + '\')">删除</button></div></div>'
    ).join('');
  },

  showAddForm() {
    document.getElementById('ruleTitle').value = '';
    document.getElementById('ruleContent').value = '';
    document.getElementById('ruleForm').style.display = 'block';
  },

  hideForm() { document.getElementById('ruleForm').style.display = 'none'; },

  async saveRule() {
    const title = document.getElementById('ruleTitle').value.trim();
    const content = document.getElementById('ruleContent').value.trim();
    if (!title || !content) { App.showToast('请填写完整'); return; }

    try {
      await API.post('/api/rules', { title, content });
      this.hideForm(); await this.render(); App.showToast('已保存');
    } catch(e) { console.error(e); }
  },

  editRule(id, oldTitle, oldContent) {
    document.getElementById('ruleTitle').value = oldTitle;
    document.getElementById('ruleContent').value = oldContent;
    document.getElementById('ruleForm').style.display = 'block';

    // 替换 save 为 update
    const btn = document.querySelector('#ruleForm .btn-primary');
    btn.textContent = '更新';
    btn.setAttribute('onclick', "Rules.updateRule('" + id + "')");
  },

  async updateRule(id) {
    const title = document.getElementById('ruleTitle').value.trim();
    const content = document.getElementById('ruleContent').value.trim();
    if (!title || !content) return;

    try {
      await API.put('/api/rules/' + id, { title, content });
      this.hideForm();
      // 恢复按钮
      const btn = document.querySelector('#ruleForm .btn-primary');
      btn.textContent = '保存';
      btn.setAttribute('onclick', 'Rules.saveRule()');
      await this.render(); App.showToast('已更新');
    } catch(e) { console.error(e); }
  },

  async deleteRule(id) {
    if (!confirm('确定删除这条家规？')) return;
    try { await API.del('/api/rules/' + id); await this.render(); App.showToast('已删除'); }
    catch(e) { console.error(e); }
  },
};

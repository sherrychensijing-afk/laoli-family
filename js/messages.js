/**
 * js/messages.js — 家庭留言板
 * 匿名发帖 & 回复
 */
const Messages = {
  async render() {
    try {
      const messages = await API.get('/api/messages');
      this.renderList(messages);
    } catch (e) {
      document.getElementById('messagesList').innerHTML =
        '<div class="empty-state">加载失败，请检查服务</div>';
    }
  },

  renderList(messages) {
    const container = document.getElementById('messagesList');

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:60px 20px;">
          <div style="font-size:48px;margin-bottom:12px;">💭</div>
          <p>还没有留言，来做第一个发言的人吧！</p>
          <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">匿名模式，放心说～</p>
        </div>`;
      return;
    }

    container.innerHTML = messages.map(msg => {
      const t = new Date(msg.createdAt);
      const timeStr = `${t.getMonth()+1}月${t.getDate()}日 ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;

      const repliesHTML = msg.replies && msg.replies.length > 0
        ? `<div class="message-replies">
            ${msg.replies.map(r => {
              const rt = new Date(r.createdAt);
              const rTime = `${rt.getMonth()+1}月${rt.getDate()}日 ${String(rt.getHours()).padStart(2,'0')}:${String(rt.getMinutes()).padStart(2,'0')}`;
              return `
                <div class="reply-item">
                  <div class="reply-meta">
                    <span>👤 匿名</span> · <span>${rTime}</span>
                  </div>
                  <div class="reply-content">${this.escapeHTML(r.content)}</div>
                </div>`;
            }).join('')}
          </div>`
        : '';

      return `
        <div class="message-card" id="msg-${msg.id}">
          <div class="message-card-header">
            <div class="message-avatar">👤</div>
            <div class="message-meta">
              匿名 · ${timeStr}
            </div>
            <div style="flex:1"></div>
            <button class="btn btn-danger" style="font-size:11px;padding:2px 8px;"
                    onclick="Messages.deleteMessage('${msg.id}')">删除</button>
          </div>
          <div class="message-content">${this.escapeHTML(msg.content)}</div>
          ${repliesHTML}
          <div class="reply-input-row">
            <input type="text" id="replyInput-${msg.id}" placeholder="匿名回复..."
                   onkeydown="if(event.key==='Enter')Messages.replyMessage('${msg.id}')">
            <button class="btn btn-outline" onclick="Messages.replyMessage('${msg.id}')">回复</button>
          </div>
        </div>`;
    }).join('');
  },

  escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  async postMessage() {
    const content = document.getElementById('msgContent').value.trim();
    if (!content) {
      App.showToast('请输入留言内容');
      return;
    }

    try {
      await API.post('/api/messages', { content });
      document.getElementById('msgContent').value = '';
      await this.render();
      App.showToast('留言已发送 📨');
    } catch (e) {
      App.showToast('发送失败，请重试');
    }
  },

  async replyMessage(msgId) {
    const input = document.getElementById(`replyInput-${msgId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
      await API.post(`/api/messages/${msgId}/reply`, { content });
      input.value = '';
      await this.render();
      App.showToast('回复已发送 📨');
    } catch (e) {
      App.showToast('回复失败，请重试');
    }
  },

  async deleteMessage(msgId) {
    if (!confirm('确定要删除这条留言及其回复吗？')) return;
    try {
      await API.del(`/api/messages/${msgId}`);
      await this.render();
      App.showToast('留言已删除');
    } catch (e) {
      App.showToast('删除失败');
    }
  },
};

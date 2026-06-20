/**
 * js/messages.js — 家庭留言板
 */
const Messages = {
  async render() {
    try { const list = await API.get('/api/messages'); this.drawList(list); }
    catch(e) { console.error(e); }
  },

  drawList(msgs) {
    const el = document.getElementById('messagesList');
    if (!msgs.length) { el.innerHTML = '<div class="empty-state">还没有留言，来说点什么吧</div>'; return; }

    el.innerHTML = msgs.map(m => {
      const t = new Date(m.createdAt);
      const timeStr = (t.getMonth()+1) + '/' + t.getDate() + ' ' + String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0');
      return '<div class="message-card">' +
        '<div class="message-card-header"><div class="message-avatar">\u{1F4AC}</div><span class="message-meta">' + timeStr + '</span></div>' +
        '<div class="message-content">' + m.content + '</div>' +
        this.renderReplies(m.replies || [], m.id) +
        '</div>';
    }).join('');
  },

  renderReplies(replies, msgId) {
    if (!replies.length) return '';
    let html = '<div class="message-replies">';
    replies.forEach(r => {
      const t = new Date(r.createdAt);
      html += '<div class="reply-item"><div class="reply-meta">\u{1F4AC} 回复 · ' +
        (t.getMonth()+1)+'/'+t.getDate()+' '+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0')+'</div>' +
        '<div class="reply-content">' + r.content + '</div></div>';
    });
    // 回复输入框
    html += '<div class="reply-input-row"><input id="reply-' + msgId + '" placeholder="回复这条留言...">' +
      '<button class="btn btn-primary" onclick="Messages.replyTo(\'' + msgId + '\')">回复</button></div>' +
      '</div>';
    return html;
  },

  async postMessage() {
    const content = document.getElementById('msgContent').value.trim();
    if (!content) { App.showToast('请输入内容'); return; }

    try {
      await API.post('/api/messages', { content });
      document.getElementById('msgContent').value = '';
      App.showToast('已发送'); await this.render();
    } catch(e) { console.error(e); App.showToast('发送失败'); }
  },

  async replyTo(msgId) {
    const input = document.getElementById('reply-' + msgId);
    const content = input.value.trim();
    if (!content) return;

    try {
      await API.post('/api/messages/' + msgId + '/reply', { content });
      App.showToast('已回复'); await this.render();
    } catch(e) { console.error(e); }
  },
};

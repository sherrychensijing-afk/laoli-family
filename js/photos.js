/**
 * js/photos.js — 家庭相册
 */
const Photos = {
  pendingFiles: [],

  async render() {
    try { const list = await API.get('/api/photos'); this.drawGrid(list); }
    catch(e) { console.error(e); document.getElementById('photosGrid').innerHTML = '<div class="empty-state">加载失败</div>'; }
  },

  drawGrid(photos) {
    const el = document.getElementById('photosGrid');
    if (!photos.length) {
      el.innerHTML = '<div class="empty-state" style="padding:60px 20px;"><p>还没有照片，上传第一张吧！</p></div>';
      return;
    }

    const tagLabels = { family:'家庭', cat:'猫咪', member:'成员' };
    el.innerHTML = photos.map(p => {
      const t = new Date(p.createdAt);
      const timeStr = (t.getMonth()+1)+'月'+t.getDate()+'日';
      const src = '/photos/' + p.filename;
      const cap = (p.caption||'').replace(/'/g, "\\'");
      return '<div class="photo-card">' +
        '<img src="' + src + '" onclick="Photos.openLightbox(\''+src+'\',\''+cap+'\',\''+timeStr+'\')" loading="lazy">' +
        '<div class="photo-card-footer"><div class="photo-card-info">' +
        '<span class="photo-tag">' + (tagLabels[p.tag]||'') + '</span>' +
        '<span class="photo-date">' + timeStr + '</span></div>' +
        (p.caption ? '<div class="photo-caption">'+p.caption+'</div>' : '') +
        '</div><button class="photo-delete" onclick="event.stopPropagation();Photos.deletePhoto(\''+p.id+'\')">&times;</button></div>';
    }).join('');
  },

  previewUpload(event) {
    this.pendingFiles = Array.from(event.target.files);
    const el = document.getElementById('photoPreview');
    if (!this.pendingFiles.length) { el.style.display='none'; return; }

    let html = '';
    this.pendingFiles.forEach((f, i) => {
      html += '<span class="preview-tag">' + f.name + '<button class="preview-remove" onclick="event.stopPropagation();Photos.removeFile('+i+')">&times;</button></span>';
    });
    el.style.display = 'flex'; el.innerHTML = html;
  },

  removeFile(i) {
    this.pendingFiles.splice(i, 1);
    if (this.pendingFiles.length === 0) {
      document.getElementById('photoPreview').style.display = 'none';
    } else { this.previewUpload({ target: { files: this.pendingFiles } }); }
  },

  async uploadPhotos() {
    const files = this.pendingFiles;
    if (files.length === 0) { App.showToast('请先选择照片'); return; }

    const tag = document.getElementById('photoTag').value;
    const caption = document.getElementById('photoCaption').value.trim();
    const btn = document.getElementById('btnUploadPhoto');
    if (!btn) return;

    const orig = btn.textContent;
    btn.disabled = true;
    let ok = 0, fail = 0, lastError = '';

    for (let i = 0; i < files.length; i++) {
      btn.textContent = '上传 ' + (i+1) + '/' + files.length + '...';

      await new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/photos');

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) ok++;
          else {
            let msg = 'HTTP ' + xhr.status;
            try { const e = JSON.parse(xhr.responseText); msg = e.error || msg; } catch (_) {}
            lastError = msg; fail++;
          }
          resolve();
        };
        xhr.onerror = () => { lastError = '网络错误'; fail++; resolve(); };
        xhr.ontimeout = () => { lastError = '超时'; fail++; resolve(); };
        xhr.timeout = 60000;

        const fd = new FormData();
        fd.append('photo', files[i]);
        fd.append('tag', tag);
        fd.append('caption', caption);
        xhr.send(fd);
      });
    }

    btn.textContent = orig;
    btn.disabled = false;
    this.pendingFiles = [];
    document.getElementById('photoInput').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoCaption').value = '';

    await this.render();
    if (ok > 0) App.showToast('已上传 ' + ok + '张' + (fail>0 ? '，'+fail+'张失败' : ''));
    else App.showToast(lastError ? '失败：'+lastError : '上传失败');
  },

  openLightbox(src, caption, timeStr) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxInfo').innerHTML =
      (caption ? caption + ' · ' : '') + (timeStr||'') +
      '<br><small style="color:rgba(255,255,255,.4)">点击任意处关闭</small>';
    document.getElementById('lightbox').classList.add('show');
  },

  closeLightbox() { document.getElementById('lightbox').classList.remove('show'); },

  async deletePhoto(id) {
    if (!confirm('确定删除此照片？')) return;
    try { await API.del('/api/photos/' + id); App.showToast('已删除'); await this.render(); }
    catch(e) { console.error(e); }
  },
};

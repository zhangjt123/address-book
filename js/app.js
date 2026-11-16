/**
 * app.js — 主控制器
 * -------------------------------------------------------
 * 负责页面渲染与事件绑定，串联 storage / contact / bookmark / excel 各模块：
 *   - 联系人列表渲染（卡片式）
 *   - 搜索、全部/收藏筛选
 *   - 新增 / 编辑 / 删除 / 收藏
 *   - 多联系方式表单的动态增删
 *   - Excel 导入导出
 *   - Toast 交互反馈
 */
(function () {
  'use strict';

  // ---------- DOM 引用 ----------
  function $(sel) { return document.querySelector(sel); }

  var contactListEl = $('#contactList');
  var searchInput = $('#searchInput');
  var filterAll = $('#filterAll');
  var filterBookmark = $('#filterBookmark');
  var countEl = $('#countText');
  var addBtn = $('#addBtn');
  var exportBtn = $('#exportBtn');
  var importBtn = $('#importBtn');
  var importFile = $('#importFile');
  var clearBtn = $('#clearBtn');

  var modalBackdrop = $('#modalBackdrop');
  var modalTitle = $('#modalTitle');
  var contactForm = $('#contactForm');
  var nameInput = $('#nameInput');
  var methodsBox = $('#methodsBox');
  var addMethodBtn = $('#addMethodBtn');
  var cancelBtn = $('#cancelBtn');
  var modalCloseBtn = $('#modalCloseBtn');

  var toastEl = $('#toast');

  // ---------- 状态 ----------
  var filter = 'all';      // 'all' | 'bookmark'
  var editingId = null;    // 当前正在编辑的联系人 id

  // ---------- 工具函数 ----------
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function avatarText(name) {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  }

  function typeIcon(type) {
    var map = {
      '电话': '📞', '手机': '📱', '邮箱': '✉️', '微信': '💬', 'QQ': '🐧',
      '社交账号': '🌐', '地址': '📍', '公司': '🏢', '备注': '📝', '传真': '📠'
    };
    return map[type] || '🔗';
  }

  // ---------- 数据筛选 ----------
  function getFilteredList() {
    var all = Storage.getAll();
    var kw = searchInput.value.trim().toLowerCase();
    var list = filter === 'bookmark' ? Bookmark.filterBookmarked(all) : all.slice();
    if (kw) {
      list = list.filter(function (c) {
        var inName = c.name.toLowerCase().indexOf(kw) !== -1;
        var inMethod = c.methods.some(function (m) {
          return m.value.toLowerCase().indexOf(kw) !== -1 ||
                 m.type.toLowerCase().indexOf(kw) !== -1;
        });
        return inName || inMethod;
      });
    }
    return list;
  }

  // ---------- 渲染 ----------
  function render() {
    var list = getFilteredList();
    renderCount(list);
    renderFilterActive();
    renderList(list);
  }

  function renderCount(list) {
    var all = Storage.getAll();
    var bookmarked = Bookmark.filterBookmarked(all).length;
    var text = '共 ' + all.length + ' 位联系人 · 收藏 ' + bookmarked + ' 位';
    if (filter === 'bookmark') text += ' · 已筛选出 ' + list.length + ' 位';
    countEl.textContent = text;
  }

  function renderFilterActive() {
    filterAll.classList.toggle('active', filter === 'all');
    filterBookmark.classList.toggle('active', filter === 'bookmark');
  }

  function renderList(list) {
    if (!list.length) {
      contactListEl.innerHTML = emptyStateHtml();
      return;
    }
    contactListEl.innerHTML = list.map(contactCardHtml).join('');
  }

  function emptyStateHtml() {
    var isBookmark = filter === 'bookmark';
    var icon = isBookmark ? '⭐' : '📇';
    var text = isBookmark ? '还没有收藏任何联系人' : '通讯录还是空的';
    return '' +
      '<div class="empty">' +
      '  <div class="empty-icon">' + icon + '</div>' +
      '  <p>' + text + '</p>' +
      '  <button class="btn btn-primary" data-action="new">＋ 新增联系人</button>' +
      '</div>';
  }

  function contactCardHtml(c) {
    var starClass = c.isBookmark ? 'star active' : 'star';
    var methodsHtml = c.methods.map(methodBadgeHtml).join('');
    return '' +
      '<article class="card" data-id="' + c.id + '">' +
      '  <div class="card-avatar">' + escapeHtml(avatarText(c.name)) + '</div>' +
      '  <div class="card-body">' +
      '    <div class="card-head">' +
      '      <h3 class="card-name" title="' + escapeHtml(c.name) + '">' + escapeHtml(c.name) + '</h3>' +
      '      <button class="' + starClass + '" data-action="bookmark" title="收藏 / 取消收藏" aria-label="收藏">★</button>' +
      '    </div>' +
      '    <div class="card-methods">' + (methodsHtml || '<span class="muted">暂无联系方式</span>') + '</div>' +
      '  </div>' +
      '  <div class="card-actions">' +
      '    <button class="btn btn-ghost" data-action="edit">编辑</button>' +
      '    <button class="btn btn-ghost danger" data-action="delete">删除</button>' +
      '  </div>' +
      '</article>';
  }

  function methodBadgeHtml(m) {
    return '' +
      '<span class="badge">' + typeIcon(m.type) +
      '<span class="badge-type">' + escapeHtml(m.type) + '</span>' +
      '<span class="badge-value">' + escapeHtml(m.value) + '</span>' +
      '</span>';
  }

  // ---------- 模态框 ----------
  function openModal(contact) {
    editingId = contact ? contact.id : null;
    modalTitle.textContent = contact ? '编辑联系人' : '新增联系人';
    nameInput.value = contact ? contact.name : '';
    methodsBox.innerHTML = '';

    var methods = (contact && contact.methods.length)
      ? contact.methods
      : [{ type: '电话', value: '' }];
    methods.forEach(function (m) { addMethodRow(m.type, m.value); });

    modalBackdrop.classList.add('open');
    nameInput.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    editingId = null;
  }

  function addMethodRow(type, value) {
    var row = document.createElement('div');
    row.className = 'method-row';
    row.innerHTML = '' +
      '<input class="method-type" list="typeOptions" placeholder="类型" value="' + escapeHtml(type || '') + '">' +
      '<input class="method-value" placeholder="内容，如 138xxxx" value="' + escapeHtml(value || '') + '">' +
      '<button type="button" class="method-remove" title="删除此联系方式">✕</button>';
    row.querySelector('.method-remove').addEventListener('click', function () {
      row.remove();
    });
    methodsBox.appendChild(row);
    row.querySelector('.method-value').focus();
  }

  function saveFromModal() {
    var name = nameInput.value.trim();
    if (!name) {
      toast('请输入联系人姓名');
      nameInput.focus();
      return;
    }

    var methods = [];
    methodsBox.querySelectorAll('.method-row').forEach(function (row) {
      var type = row.querySelector('.method-type').value.trim() || '其他';
      var value = row.querySelector('.method-value').value.trim();
      if (value) methods.push({ type: type, value: value });
    });

    if (editingId) {
      var old = Storage.getById(editingId);
      if (old) {
        old.name = name;
        old.methods = methods;
        Storage.update(old);
        toast('已更新联系人');
      }
    } else {
      Storage.add(Contact.createContact(name, methods, false));
      toast('已新增联系人');
    }
    closeModal();
    render();
  }

  // ---------- Excel 导入 ----------
  function handleImport(e) {
    var file = e.target.files[0];
    if (!file) return;
    Excel.importFromExcel(file).then(function (contacts) {
      contacts.forEach(function (c) { Storage.add(c); });
      toast('成功导入 ' + contacts.length + ' 位联系人 🎉');
      render();
    }).catch(function (err) {
      alert('导入失败：' + (err && err.message ? err.message : err));
    }).finally(function () {
      importFile.value = '';
    });
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    // 列表事件委托（卡片操作 + 空状态新增按钮）
    contactListEl.addEventListener('click', function (e) {
      var newBtn = e.target.closest('[data-action="new"]');
      if (newBtn) { openModal(); return; }

      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var card = e.target.closest('.card');
      if (!card) return;
      var id = card.dataset.id;
      var action = btn.dataset.action;

      if (action === 'bookmark') {
        var active = Bookmark.toggle(id);
        toast(active ? '已加入收藏 ⭐' : '已取消收藏');
        render();
      } else if (action === 'edit') {
        openModal(Storage.getById(id));
      } else if (action === 'delete') {
        if (confirm('确定删除该联系人吗？')) {
          Storage.remove(id);
          toast('已删除');
          render();
        }
      }
    });

    filterAll.addEventListener('click', function () { filter = 'all'; render(); });
    filterBookmark.addEventListener('click', function () { filter = 'bookmark'; render(); });
    searchInput.addEventListener('input', render);

    addBtn.addEventListener('click', function () { openModal(); });
    exportBtn.addEventListener('click', function () { Excel.exportToExcel(getFilteredList()); });
    importBtn.addEventListener('click', function () { importFile.click(); });
    importFile.addEventListener('change', handleImport);

    clearBtn.addEventListener('click', function () {
      if (!confirm('确定清空全部联系人吗？此操作不可恢复。')) return;
      Storage.clearAll();
      toast('已清空全部联系人');
      render();
    });

    addMethodBtn.addEventListener('click', function () { addMethodRow(); });
    cancelBtn.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      saveFromModal();
    });
  }

  // ---------- 初始化 ----------
  function init() {
    bindEvents();
    render();
  }

  // 暴露给控制台 / 后续扩展
  window.App = { openModal: openModal, render: render };

  init();
})();

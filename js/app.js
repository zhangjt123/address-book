/**
 * app.js — 主控制器（阶段：基础 CRUD + 收藏）
 * 负责联系人列表渲染、搜索、全部/收藏筛选、新增/编辑/删除。
 */
(function () {
  'use strict';

  function $(s) { return document.querySelector(s); }

  var contactListEl = $('#contactList');
  var searchInput = $('#searchInput');
  var filterAll = $('#filterAll');
  var filterBookmark = $('#filterBookmark');
  var countEl = $('#countText');
  var addBtn = $('#addBtn');
  var modalBackdrop = $('#modalBackdrop');
  var modalTitle = $('#modalTitle');
  var contactForm = $('#contactForm');
  var nameInput = $('#nameInput');
  var phoneInput = $('#phoneInput');
  var cancelBtn = $('#cancelBtn');
  var modalCloseBtn = $('#modalCloseBtn');

  var filter = 'all';
  var editingId = null;

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getFilteredList() {
    var all = Storage.getAll();
    var kw = searchInput.value.trim().toLowerCase();
    var list = filter === 'bookmark' ? Bookmark.filterBookmarked(all) : all.slice();
    if (kw) {
      list = list.filter(function (c) {
        return c.name.toLowerCase().indexOf(kw) !== -1 ||
               c.phone.toLowerCase().indexOf(kw) !== -1;
      });
    }
    return list;
  }

  function render() {
    var list = getFilteredList();
    var all = Storage.getAll();
    countEl.textContent = '共 ' + all.length + ' 位联系人 · 收藏 ' +
      Bookmark.filterBookmarked(all).length + ' 位';
    filterAll.classList.toggle('active', filter === 'all');
    filterBookmark.classList.toggle('active', filter === 'bookmark');

    if (!list.length) {
      contactListEl.innerHTML =
        '<div class="empty"><div class="empty-icon">📇</div><p>通讯录还是空的</p>' +
        '<button class="btn btn-primary" data-action="new">＋ 新增联系人</button></div>';
      return;
    }
    contactListEl.innerHTML = list.map(function (c) {
      var star = c.isBookmark ? 'star active' : 'star';
      return '<article class="card" data-id="' + c.id + '">' +
        '<div class="card-avatar">' + escapeHtml(c.name.charAt(0)) + '</div>' +
        '<div class="card-body">' +
        '<div class="card-head"><h3 class="card-name">' + escapeHtml(c.name) + '</h3>' +
        '<button class="' + star + '" data-action="bookmark" title="收藏">★</button></div>' +
        '<div class="card-methods"><span class="badge">📞<span class="badge-type">电话</span>' +
        '<span class="badge-value">' + escapeHtml(c.phone) + '</span></span></div>' +
        '</div>' +
        '<div class="card-actions">' +
        '<button class="btn btn-ghost" data-action="edit">编辑</button>' +
        '<button class="btn btn-ghost danger" data-action="delete">删除</button>' +
        '</div></article>';
    }).join('');
  }

  function openModal(contact) {
    editingId = contact ? contact.id : null;
    modalTitle.textContent = contact ? '编辑联系人' : '新增联系人';
    nameInput.value = contact ? contact.name : '';
    phoneInput.value = contact ? contact.phone : '';
    modalBackdrop.classList.add('open');
    nameInput.focus();
  }
  function closeModal() { modalBackdrop.classList.remove('open'); editingId = null; }

  function saveFromModal() {
    var name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    var phone = phoneInput.value.trim();
    if (editingId) {
      var old = Storage.getById(editingId);
      if (old) { old.name = name; old.phone = phone; Storage.update(old); }
    } else {
      Storage.add({
        id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        name: name, phone: phone, isBookmark: false
      });
    }
    closeModal();
    render();
  }

  contactListEl.addEventListener('click', function (e) {
    var newBtn = e.target.closest('[data-action="new"]');
    if (newBtn) { openModal(); return; }
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var card = e.target.closest('.card');
    if (!card) return;
    var id = card.dataset.id;
    var action = btn.dataset.action;
    if (action === 'bookmark') { Bookmark.toggle(id); render(); }
    else if (action === 'edit') { openModal(Storage.getById(id)); }
    else if (action === 'delete') { if (confirm('确定删除该联系人吗？')) { Storage.remove(id); render(); } }
  });

  filterAll.addEventListener('click', function () { filter = 'all'; render(); });
  filterBookmark.addEventListener('click', function () { filter = 'bookmark'; render(); });
  searchInput.addEventListener('input', render);
  addBtn.addEventListener('click', function () { openModal(); });
  cancelBtn.addEventListener('click', closeModal);
  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', function (e) { if (e.target === modalBackdrop) closeModal(); });
  contactForm.addEventListener('submit', function (e) { e.preventDefault(); saveFromModal(); });

  if (!localStorage.getItem('addressBook.initialized')) {
    Storage.add({
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: '张伟', phone: '138-0000-1234', isBookmark: true
    });
    localStorage.setItem('addressBook.initialized', '1');
  }
  render();
})();

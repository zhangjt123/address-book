/**
 * storage.js — 数据持久化模块
 * -------------------------------------------------------
 * 负责联系人数据的读写，基于浏览器 localStorage 实现。
 * 对外提供联系人数组的增、删、改、查等基础操作，
 * 是所有业务模块（收藏 / 多联系方式 / Excel）共用的数据底座。
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'addressBook.contacts.v1';

  /** 读取全部联系人；数据不存在或损坏时返回空数组 */
  function getAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.error('读取本地数据失败：', e);
      return [];
    }
  }

  /** 覆盖保存全部联系人 */
  function saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('保存本地数据失败：', e);
      alert('保存失败：浏览器存储空间不足或被禁用。');
    }
  }

  /** 新增联系人，返回创建后的对象 */
  function add(contact) {
    var list = getAll();
    list.unshift(contact);
    saveAll(list);
    return contact;
  }

  /** 按 id 更新联系人，返回更新后的对象；找不到返回 null */
  function update(contact) {
    var list = getAll();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === contact.id) { idx = i; break; }
    }
    if (idx === -1) return null;
    list[idx] = contact;
    saveAll(list);
    return contact;
  }

  /** 按 id 删除联系人，返回是否删除成功 */
  function remove(id) {
    var list = getAll();
    var next = list.filter(function (c) { return c.id !== id; });
    if (next.length === list.length) return false;
    saveAll(next);
    return true;
  }

  /** 按 id 查找联系人 */
  function getById(id) {
    var list = getAll();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /** 清空全部联系人 */
  function clearAll() {
    saveAll([]);
  }

  global.Storage = { getAll: getAll, saveAll: saveAll, add: add, update: update, remove: remove, getById: getById, clearAll: clearAll };
})(window);

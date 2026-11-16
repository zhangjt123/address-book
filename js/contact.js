/**
 * contact.js — 联系人模型与多联系方式模块
 * -------------------------------------------------------
 * 定义联系人数据结构，并管理“一个联系人可绑定多种联系方式”的增删逻辑。
 * 数据结构：
 *   {
 *     id: 唯一标识,
 *     name: 姓名,
 *     isBookmark: 是否收藏,
 *     methods: [ { type: '电话', value: '138xxxx' }, ... ]
 *   }
 */
(function (global) {
  'use strict';

  /** 生成全局唯一 id */
  function genId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /** 常用联系方式类型（供下拉候选与 Excel 列排序参考） */
  var COMMON_TYPES = ['电话', '邮箱', '微信', 'QQ', '社交账号', '地址', '公司', '备注'];

  /**
   * 创建联系人对象
   * @param {string} name 姓名
   * @param {Array<{type:string, value:string}>} methods 联系方式数组
   * @param {boolean} isBookmark 是否收藏
   */
  function createContact(name, methods, isBookmark) {
    return {
      id: genId(),
      name: (name || '').trim(),
      isBookmark: !!isBookmark,
      methods: (methods || []).filter(function (m) {
        return m && (m.value || '').trim() !== '';
      })
    };
  }

  /** 向联系人追加一条联系方式，返回更新后的 methods */
  function addMethod(contact, type, value) {
    var t = (type || '其他').trim() || '其他';
    var v = (value || '').trim();
    if (!v) return contact.methods;
    contact.methods.push({ type: t, value: v });
    return contact.methods;
  }

  /** 删除指定下标的联系方式，返回更新后的 methods */
  function removeMethod(contact, index) {
    if (index >= 0 && index < contact.methods.length) {
      contact.methods.splice(index, 1);
    }
    return contact.methods;
  }

  /**
   * 收集所有联系人中出现过的联系方式类型，按「常用优先 + 使用频率」排序。
   * 用于 Excel 导出的列顺序，保证表头稳定、可读。
   */
  function collectTypes(list) {
    var freq = {};
    list.forEach(function (c) {
      c.methods.forEach(function (m) {
        freq[m.type] = (freq[m.type] || 0) + 1;
      });
    });
    var keys = Object.keys(freq);
    keys.sort(function (a, b) {
      var ia = COMMON_TYPES.indexOf(a);
      var ib = COMMON_TYPES.indexOf(b);
      var ra = ia === -1 ? COMMON_TYPES.length : ia;
      var rb = ib === -1 ? COMMON_TYPES.length : ib;
      if (ra !== rb) return ra - rb;
      return freq[b] - freq[a];
    });
    return keys;
  }

  global.Contact = {
    genId: genId,
    COMMON_TYPES: COMMON_TYPES,
    createContact: createContact,
    addMethod: addMethod,
    removeMethod: removeMethod,
    collectTypes: collectTypes
  };
})(window);

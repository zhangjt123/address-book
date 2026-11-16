/**
 * bookmark.js — 收藏功能模块
 * -------------------------------------------------------
 * 负责切换联系人的收藏状态、按收藏状态筛选联系人。
 * 收藏状态保存在联系人对象的 isBookmark 字段中，随联系人持久化。
 */
(function (global) {
  'use strict';

  /**
   * 切换某联系人的收藏状态
   * @param {string} id 联系人 id
   * @returns {boolean} 切换后的收藏状态；联系人不存在返回 false
   */
  function toggle(id) {
    var c = Storage.getById(id);
    if (!c) return false;
    c.isBookmark = !c.isBookmark;
    Storage.update(c);
    return c.isBookmark;
  }

  /**
   * 筛选出已收藏的联系人
   * @param {Array} list 联系人数组
   * @returns {Array} 收藏联系人数组
   */
  function filterBookmarked(list) {
    return list.filter(function (c) { return c.isBookmark; });
  }

  global.Bookmark = { toggle: toggle, filterBookmarked: filterBookmarked };
})(window);

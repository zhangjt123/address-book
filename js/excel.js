/**
 * excel.js — Excel 导入 / 导出模块
 * -------------------------------------------------------
 * 依赖 SheetJS（xlsx）实现纯前端 Excel 处理：
 *   - 导出：一行一人、一列一类信息，生成 .xlsx 文件下载
 *   - 导入：读取 Excel，解析表头与数据行，批量转换为联系人数据
 *
 * 约定格式：
 *   首列「姓名」，可选列「收藏」（值为“是/否”），其余列作为联系方式类型。
 *   同一单元格内的多个值用 、；;，或换行分隔，导入时自动拆分。
 */
(function (global) {
  'use strict';

  /** 单元格内多个值使用的分隔符 */
  var SPLITTERS = /[、;；,，\n]+/;

  /** 判断 xlsx 库是否可用 */
  function ensureXLSX() {
    if (typeof XLSX === 'undefined') {
      alert('Excel 组件加载失败，请检查网络后刷新页面。');
      return false;
    }
    return true;
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function formatDate(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  }

  /**
   * 导出联系人数组为 Excel 文件（.xlsx）
   * 列结构：姓名 | 收藏 | 电话 | 邮箱 | ...（动态收集类型）
   * @param {Array} list 联系人数组
   */
  function exportToExcel(list) {
    if (!ensureXLSX()) return;
    if (!list.length) {
      alert('当前没有可导出的联系人。');
      return;
    }

    var types = Contact.collectTypes(list);
    var header = ['姓名', '收藏'].concat(types);

    var rows = [header];
    list.forEach(function (c) {
      var row = [c.name, c.isBookmark ? '是' : '否'];
      types.forEach(function (t) {
        var values = c.methods
          .filter(function (m) { return m.type === t; })
          .map(function (m) { return m.value; });
        row.push(values.join('、'));
      });
      rows.push(row);
    });

    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = header.map(function (h) {
      return { wch: Math.max(h.length * 2 + 2, 12) };
    });

    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '通讯录');
    XLSX.writeFile(wb, '通讯录_' + formatDate(new Date()) + '.xlsx');
  }

  /**
   * 读取 Excel 文件，解析为联系人数组
   * @param {File} file
   * @returns {Promise<Array>} 解析出的联系人数组
   */
  function importFromExcel(file) {
    return new Promise(function (resolve, reject) {
      if (!ensureXLSX()) return reject(new Error('xlsx 组件不可用'));

      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('文件读取失败')); };
      reader.onload = function (e) {
        try {
          var wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          var ws = wb.Sheets[wb.SheetNames[0]];
          var aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          resolve(aoaToContacts(aoa));
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 将二维数组（第一行为表头）转换为联系人数组
   * @param {Array<Array>} aoa
   * @returns {Array} 联系人数组
   */
  function aoaToContacts(aoa) {
    if (!aoa || aoa.length < 2) throw new Error('Excel 内容为空或缺少数据行');

    var header = aoa[0].map(function (h) { return String(h).trim(); });
    var nameCol = header.indexOf('姓名');
    if (nameCol === -1) throw new Error('Excel 缺少「姓名」列，请检查表头格式');

    var bookmarkCol = header.indexOf('收藏');
    var contacts = [];

    for (var i = 1; i < aoa.length; i++) {
      var row = aoa[i] || [];
      var name = String(row[nameCol] || '').trim();
      if (!name) continue; // 跳过空行

      var methods = [];
      header.forEach(function (h, col) {
        if (col === nameCol || col === bookmarkCol) return; // 跳过姓名/收藏列
        if (!h) return;
        var cell = String(row[col] || '').trim();
        if (!cell) return;
        cell.split(SPLITTERS).forEach(function (v) {
          v = v.trim();
          if (v) methods.push({ type: h, value: v });
        });
      });

      var isBookmark = bookmarkCol !== -1 && String(row[bookmarkCol] || '').trim() === '是';
      contacts.push(Contact.createContact(name, methods, isBookmark));
    }

    return contacts;
  }

  global.Excel = { exportToExcel: exportToExcel, importFromExcel: importFromExcel };
})(window);

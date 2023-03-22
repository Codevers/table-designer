/**
 $ @Description: 方法群
 $ @Author: Peng.p
 $ @Date: 2021-11-12 13:38:39
 $ @LastEditTime: 2021-11-23 15:43:44
 */

/******
 * Description: 效验数字，正负->浮点数或整数
 * param {any} val
 * return {bool} 结果
 **/
export function isNumber(val) {
  var regPos = /^\d+(\.\d+)?$/; //非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
  if (regPos.test(val) && regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}
/******
 * Description: 生成UUID
 * param {any}
 * return {String} 随机UUID
 **/
export function generateUuid() {
  var temp_url = URL.createObjectURL(new Blob());
  var uuid = temp_url.toString();
  URL.revokeObjectURL(temp_url);
  return uuid.substr(uuid.lastIndexOf("/") + 1);
}
/**
 * description: 根据子id获取父级id
 * param {String} id 子id
 * param {Array} data 源数据
 * return {String} id 结果
 **/
export function getParentIds(id, data) {
  // 深度遍历查找
  function dfs(data, id, parents) {
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      // 找到id则返回父级id
      if (item.id === id) return parents;
      // children不存在或为空则不递归
      if (!item.children || !item.children.length) continue;
      // 往下查找时将当前id入栈
      parents.push(item.id);

      if (dfs(item.children, id, parents).length) return parents;
      // 深度遍历查找未找到时当前id 出栈
      parents.pop()
    }
    // 未找到时返回空数组
    return [];
  }
  return dfs(data, id, []);
}
/**
 * description: 删除指定字段
 * param {Array} fieldNames 字段名
 * param {Array} data 数据
 * return {Array} data 结果
 **/
export function deleteTreeFields(fieldNames, data) {
  (function fn(data) {
    for (let item of data) {
      for (let name in item) {
        if (fieldNames.includes(name)) {
          delete item[name];
        }
      }
      item.children && item.children.length && fn(item.children)
    }
  }
  )(data)
  return data;
}
/**
 * description: 添加指定字段
 * param {Object} fieldNames 字段名
 * param {Array} data 数据
 * return {Array} data 结果
 **/
export function addTreeFields(fieldNames, data) {
  (function fn(data) {
    for (let item of data) {
      for (let name in fieldNames) {
        if (item.prop != 'editIcon') {
          item[name] = fieldNames[name];
        }
      }
      item.children && item.children.length && fn(item.children)
    }
  }
  )(data)
  return data;
}

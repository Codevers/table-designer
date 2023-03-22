/**
 $ @Description: 表格增删改统一逻辑
 $ @Author: Peng.p
 $ @Date: 2021-11-18 09:32:48
 $ @LastEditTime: 2021-11-18 11:03:27
 */
import { generateUuid, getParentIds } from '../utils'
export default {
  data() {
    return {}
  },
  methods: {
    /**
     * description: 创建平级
     * param {*}
     * return {*}
     **/
    addRowItem() {
      this.data.push(this.createNewRow())
    },
    /**
    * description: 创建子级
    * param {*} scope
    * return {*}
    **/
    addChildNode(scope) {
      scope.row.children.push(this.createNewRow())
      if (!this.option.expandRowKeys.includes(scope.row.id)) {
        this.option.expandRowKeys.push(scope.row.id)
      }
      this.$refs.crud.refreshTable()
    },
    /**
    * description: 创建新的表格行
    * param {*}
    * return {Object} 行数据
    **/
    createNewRow() {
      let rowData = {};
      for (let item of this.option.column) {
        if (item.prop != 'editIcon') {
          rowData[item.prop] = ''
          rowData['$cellEdit'] = true //默认开启编辑模式
          rowData['id'] = generateUuid()
          rowData['children'] = []
        }
      }
      return rowData;
    },
    /**
    * description: 树级展开事件
    * param {*} row
    * param {*} expendList
    * return {*}
    **/
    toggleRowExpand(row) {
      if (!this.option.expandRowKeys.includes(row.id)) {
        this.option.expandRowKeys.push(row.id)
      } else {
        this.option.expandRowKeys = this.option.expandRowKeys.filter(i => i != row.id)
      }
    },
    /**
     * description: 删除行
     * param {*} scope
     * return {*}
     **/
    removeItem({ row }) {
      const ids = this.findChildAllIds([{ ...row }]);
      const parentIds = getParentIds(row.id, this.data)
      const parentId = parentIds.slice(-1);
      const allIds = [...ids, ...parentId];
      // 清除被删除的项所关联的ids
      this.option.expandRowKeys = this.option.expandRowKeys.filter(i => !allIds.includes(i))
      this.deleteTreeNode(this.data, row.id)
    },
    /**
    * description: 根据当前节点，通过id获取其所有子id
    * param {String} id 父id
    * return {Array} ids 结果
    **/
    findChildAllIds(rowChild) {
      let allIds = [];
      const getAllIds = (data) => {
        for (let item of data) {
          allIds.push(item.id);
          item.children && item.children.length && getAllIds(item.children)
        }
      }
      getAllIds(rowChild);
      return allIds
    },
    /**
     * description: 指定id删除树数据
     * param {*} data 树数据
     * param {*} id 要删除的id
     * return {*}
     **/
    deleteTreeNode(data, id) {
      data.map((node, index) => {
        if (node.id == id) {
          data.splice(index, 1)
        } else if (node.children && node.children.length) {
          this.deleteTreeNode(node.children, id)
        }
      })
    }
  }
}

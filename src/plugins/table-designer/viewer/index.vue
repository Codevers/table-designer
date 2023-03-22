<template>
    <div class="table-designer">
        <div class="content">
            <avue-crud ref="crud" v-if="isData" v-model="form" :option="option" :data="data" @expand-change="toggleRowExpand" @selection-change="selectionChange" @row-click="rowClick" :class="{'isModify':tableMode=='modify'}" :row-class-name="rowClassName">
                <!-- 定义图标 -->
                <template slot="editIconHeader" slot-scope="scope">
                    <el-tooltip class="item" effect="dark" content="增加行" placement="top">
                        <div class="addRowMenu">
                            <i class="el-icon-circle-plus-outline pushItem" @click="addRowItem()"></i>
                        </div>
                    </el-tooltip>
                </template>
                <!-- 定义单选模式 -->
                <template v-if="checkType == 'radio'" #radio="{row}">
                    <el-radio v-model="form.radio" :label="row.id"><i></i></el-radio>
                </template>
                <!-- 定义添加、删除图标 -->
                <template slot="editIcon" slot-scope="scope">
                    <div class="addRowMenu">
                        <i class="el-icon-circle-plus-outline pushItem" @click="addChildNode(scope)"></i>
                        <i class="el-icon-remove-outline removeItem" @click="removeItem(scope)"></i>
                    </div>
                </template>
            </avue-crud>
            <div class="emptyData" v-else>
                <avue-empty></avue-empty>
            </div>

        </div>
    </div>
</template>
<script>
import beautifier from '../editor/json-beautifier'
import { deleteTreeFields, addTreeFields } from '../utils'
import { stringify } from '../editor'
import adm from '../mixins/adm'
export default {
    props: {
        tableData: {
            type: Object,
            default: function () {
                return { option: {}, data: [] }
            }
        },
        processStatus: {
            type: String,
            default: ''
        },
        isSelection: {
            type: Boolean,
            default: false
        },
        checkType: {
            type: String,
            default: 'radio'
        }
    },
    mixins: [adm],
    data() {
        return {
            form: {},
            option: {},
            data: [],
            selectionList: [],
            tableMode: 'view',
            isData: false
        }
    },
    methods: {
        hasColumnData() {
            try {
                let jsonData = {};
                if (typeof this.tableData === 'string') {
                    let transf = eval('(' + this.tableData + ')');
                    jsonData = this.deepClone(transf);
                } else {
                    jsonData = this.deepClone(this.tableData);
                }
                let column = jsonData.option.column.filter(i => i.prop != 'editIcon')
                return column.length ? true : false;
            } catch (e) {
                return false
            }
        },
        viewMode() {
            this.tableMode = 'view';
            this.option.header = false; //表格头部菜单的显隐
            this.option.selection = this.checkType == 'checkbox' ? true : false;
            this.option.column = deleteTreeFields(['cell', '_order', '_prop'], this.option.column);
            this.option.column.find(i => i.prop == 'editIcon').hide = true;
            this.data = deleteTreeFields(['$cellEdit'], this.data);
            this.$refs.crud && this.$refs.crud.refreshTable();
        },
        modifyMode() {
            this.tableMode = 'modify';
            this.option.header = false; //表格头部菜单的显隐
            this.option.selection = this.checkType == 'checkbox' ? true : false;
            this.option.column = addTreeFields({ cell: true }, this.option.column);
            this.option.column.find(i => i.prop == 'editIcon').hide = false;
            this.data = addTreeFields({ $cellEdit: true }, this.data);
            this.$refs.crud && this.$refs.crud.refreshTable();
        },
        modifyMode_notNew() {
            this.tableMode = 'modify';
            this.option.header = false; //表格头部菜单的显隐
            this.option.selection = this.checkType == 'checkbox' ? true : false;
            this.option.column = addTreeFields({ cell: true }, this.option.column);
            this.option.column.find(i => i.prop == 'editIcon').hide = true;
            this.data = addTreeFields({ $cellEdit: true }, this.data);
            this.$refs.crud && this.$refs.crud.refreshTable();
        },
        hasColumn() {
            if (this.option && Object.keys(this.option).length && Object.keys(this.option.column).length) return true
            else return false;
        },
        rowClick(row) {
            if (this.checkType == 'radio') {
                this.selectionList = [row]
                this.$set(this.form, 'radio', row.id)
                this.$emit('selectionChange', [row])
            } else this.$refs.crud.toggleSelection([row])
        },
        rowClassName({ row }) {
            const currentId = this.selectionList.length ? this.selectionList[0].id : '';
            if (currentId == row.id) {
                return 'selectHighLight'
            }
        },
        selectionChange(selection) {
            console.log(selection)
            this.selectionList = selection;
            this.$emit('selectionChange', selection)
        },
        /**
         * description: 实例获取编辑后的数据
         * param {String} type “json”：json对象，“string”：json字符串
         * return {Any}
         **/
        getData(type = 'json') {
            let data = {
                option: this.option,
                data: this.data
            }
            if (type == 'json') {
                return data
            }
            if (type == 'string') {
                return stringify(data)
            }
        },
        initTable(v) {
            if (v) this.tableData = v;
            let jsonData = {};
            if (!this.tableData || !this.hasColumnData()) {
                this.isData = false;
                console.log('无数据')
            } else {
                try {
                    if (typeof this.tableData === 'string') {
                        let transf = eval('(' + this.tableData + ')');
                        jsonData = this.deepClone(transf);
                    } else {
                        jsonData = this.deepClone(this.tableData);
                    }
                    const { option, data } = jsonData;
                    this.option = option;
                    this.data = data;
                    if (this.hasColumn()) {
                        this.isData = true;
                        this.processStatus == 'todo' ? this.modifyMode() : this.processStatus == 'notNew' ? this.modifyMode_notNew() : this.viewMode()
                    } else {
                        this.isData = false;
                    }
                } catch (e) {
                    console.log('错误', e)
                }
            }

        }
    },
    mounted() {
        this.initTable();
    }
}
</script>

<style lang="scss" scoped>
.table-designer {
    display: flex;
    flex: 1;
    height: 100%;
    .content {
        flex: 1;
        overflow: auto;
    }
}

.addRowMenu {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    i {
        font-size: 18px;
        cursor: pointer;
        transition: 0.1s all;
        &:hover {
            font-weight: bold;
        }
    }
    .pushItem {
        color: #409eff;
    }
    .removeItem {
        color: #ff6464;
        margin-left: 8px;
    }
}
.emptyData {
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
}
</style>
<style lang="scss">
.selectHighLight > td {
    background-color: #eef0f3;
}
</style>

<template>
    <el-dialog :visible.sync="visible" :close-on-click-modal="false" append-to-body title="表格设计器" fullscreen custom-class="customTables">
        <div class="loadArea" v-loading="firstLoad" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading" v-if="firstLoad"></div>
        <div class="table-designer" v-else>
            <div class="leftContent">
                <avue-crud ref="crud" v-if="hasColumnData" class="isModify" :option="option" :data="data" :table-loading="refreshLoading" @expand-change="toggleRowExpand" :header-cell-class-name="headSelected" :cell-class-name="headSelected" @row-click="handleRowClick" @cell-click="cellClick">
                    <!-- 自定义左侧栏的按钮 -->
                    <template slot="menuRight" slot-scope="">
                        <el-button type="text" icon="el-icon-upload2" size="medium" @click="importJson()">导入JSON</el-button>
                        <el-button type="text" icon="el-icon-download" size="medium" @click="jsonPreview(1)">生成JSON</el-button>
                        <el-button type="text" icon="el-icon-view" size="medium" @click="previewTable()">预览</el-button>
                        <el-button type="primary" icon="el-icon-view" size="small" @click="saveTableDesign()">保存表格</el-button>
                    </template>
                    <!-- 自定义表头 -->
                    <template :slot="`${item.prop}Header`" slot-scope="scope" v-for="item in option.column">
                        <div class="headArea" :class="{'fieldRequired':scope.column._prop===''}" :key="item.prop" @click="selectHeader(scope)">{{(scope.column || {}).label}}</div>
                    </template>
                    <!-- 自定义图标 -->
                    <template slot="editIconHeader" slot-scope="scope">
                        <el-tooltip class="item" effect="dark" content="增加行" placement="top">
                            <div class="addRowMenu">
                                <i class="el-icon-circle-plus-outline pushItem" @click="addRowItem()"></i>
                            </div>
                        </el-tooltip>
                    </template>
                    <!-- 自定义添加、删除图标 -->
                    <template slot="editIcon" slot-scope="scope">
                        <div class="addRowMenu">
                            <i class="el-icon-circle-plus-outline pushItem" @click="addChildNode(scope)"></i>
                            <i class="el-icon-remove-outline removeItem" @click="removeItem(scope)"></i>
                        </div>
                    </template>
                </avue-crud>
                <div class="emptyText" v-else>
                    <div class="noResult">
                        <img src="../../assets/empty.png" alt="">
                        <span>进入“表格属性配置”，创建表头开始。</span>
                    </div>
                </div>
            </div>
            <div class="rightPanle">
                <rightWidget @newCrudColumn="newCrudColumn" @deleteColumn="deleteColumn" :data="currentColumn" :tableOption="option" ref="widget"></rightWidget>
            </div>
        </div>
        <viewJson ref="viewJson"></viewJson>
        <codeEditor ref="editCode" @handleImportJson="handleImportJson"></codeEditor>
        <el-drawer title="预览" :visible.sync="viewerVisible" size="80%" append-to-body destroy-on-close custom-class="drawerCanScroll" @close="()=>{switchTableViewMode = false}">
            <div class="view-operation">
                <el-switch v-model="switchTableViewMode" active-text="开启编辑" @change="switchViewerMode" inactive-color="#ccc"></el-switch>
                <el-button size="mini" @click="jsonPreview(2)" icon="el-icon-download" style="margin-left:20px">生成JSON</el-button>
            </div>
            <tableViewer ref="viewer" :tableData="previewTableData" style="padding:0 20px"></tableViewer>
        </el-drawer>
    </el-dialog>
</template>

<script>
import rightWidget from './rightWidget'
import viewJson from './viewJson'
import codeEditor from './codeEditor'
import tableViewer from './viewer'
import beautifier from './editor/json-beautifier'
import adm from './mixins/adm'
export default {
    components: {
        rightWidget,
        viewJson,
        codeEditor,
        tableViewer
    },
    mixins: [adm],
    data() {
        return {
            switchTableViewMode: false,
            viewerVisible: false,
            visible: false,
            firstLoad: true,
            refreshLoading: false,
            debounceTimer: null,
            currentColumn: {},
            previewTableData: {},
            needUpdateFields: [{
                field: 'order',
                _field: '_order'
            }],
            row: {},
            _option: {},
            option: {
                tableTitle: '明细',
                rowKey: 'id',
                menu: false, //操作栏
                addBtn: false, //表格的“新增”按钮
                columnBtn: false, //表格右侧操作列显隐的按钮
                refreshBtn: false, //表格的刷新按钮
                expandRowKeys: [],
                // headerAlign: 'center',  //若不设置该项，则使用表格的对齐方式
                align: 'center',
                cellBtn: true,
                editBtn: false,
                border: true,
                index: true,
                indexLabel: '序号',
                // defaultExpandAll: true,
                // 行拖拽
                // sortable: true,
                // dragHandler: true,
                column: [
                    {
                        label: 'editIcon',
                        prop: 'editIcon',
                        align: 'center',
                        width: 80,
                        slot: true
                    },
                ],
            },
            data: [],
        }
    },
    computed: {
        optionData() {
            return JSON.parse(JSON.stringify(this.option))
        },
        hasColumnData() {
            let column = this.option.column.filter(i => i.prop != 'editIcon')
            return column.length ? true : false;
        }
    },
    watch: {
        visible(val) {
            if (!val) {
                setTimeout(() => {
                    this.firstLoad = true;
                    // 重置表配置、数据
                    this.option = this._option;
                    this.data = []
                    this.currentColumn = {}
                }, 500)
            }
        },
        optionData: {
            handler(newVal, oldVal) {
                let formatReg = new RegExp(/^[0-9a-zA-Z]*$/, 'g')
                const { prop, _prop } = this.currentColumn;
                // 修改直接影响到表格，会输入卡顿，进行二次处理
                if (prop != _prop) {
                    if (_prop === '') return;
                    if (formatReg.test(_prop)) {
                        if (this.debounceTimer) clearTimeout(this.debounceTimer);
                        this.debounceTimer = setTimeout(() => {
                            const otherColumn = this.option.column.filter(i => i.prop != prop);
                            const isRepeatProp = otherColumn.some(i => i.prop == _prop);
                            if (!isRepeatProp) {
                                this.updateFields(prop, _prop)
                                console.log('表头字段已更新')
                            } else {
                                console.log('表头字段存在重复')
                                this.currentColumn._prop = prop;
                                this.$refs.widget.$refs.columnForm.validateField('_prop');
                            }
                        }, 1000)
                    }
                } else {
                    // 修改其他配置时，刷新表格渲染
                    if (this.debounceTimer) clearTimeout(this.debounceTimer);
                    this.debounceTimer = setTimeout(() => {
                        // 对一些特殊字段的改变，做刷新处理
                        for (let item of this.needUpdateFields) {
                            if (this.currentColumn[item.field] != this.currentColumn[item._field]) {
                                this.currentColumn[item.field] = this.currentColumn[item._field]
                                console.log('current', this.currentColumn);
                                this.$refs.crud.refreshTable();
                                this.$refs.crud.init();
                                console.log('表格重刷新', this.option)
                            }
                        }
                    }, 500)
                }
            },
            deep: true
        }
    },
    methods: {
        handleStatus(v) {
            this.$emit('dialogHandle', v)
        },
        /**
         * description: 删除表列
         * param {*}
         * return {*}
         **/
        deleteColumn() {
            this.option.column = this.option.column.filter(i => i.prop != this.currentColumn.prop)
            this.currentColumn = {}
            const column = this.option.column.filter(i => i.prop != 'editIcon');
            const isColumnData = column.length ? true : false;
            if (!isColumnData) {
                this.data = []
            }
        },
        /**
         * description: 创建表头
         * param {Array} data
         * param {Fn} callback $emit回调
         * return {*}
         **/
        newCrudColumn(data, callback) {
            this.refreshLoading = true;
            // 此处易造成渲染堵塞，避免loading延迟出现
            setTimeout(() => {
                const len = this.option.column.length - 1;
                this.option.column.splice(len, 0, data);
                // 新增表数据字段
                if (this.data && this.data.length) {
                    this.dataNewField(data.prop)
                }
                this.$nextTick(() => {
                    callback()
                    this.refreshLoading = false
                    this.$refs.crud.refreshTable()
                })
            }, 200)
        },
        /**
         * description: 创建表头-新增对应的表数据字段
         * param {String} fieldName
         * return {*}
         **/
        dataNewField(fieldName) {
            (function fn(data) {
                for (let item of data) {
                    item[fieldName] = '';
                    item.children && item.children.length && fn(item.children)
                }
            }
            )(this.data)
        },
        /**
         * description: 拖拽行重排列，暂时不搞
         * param {*} oldindex
         * param {*} newindex
         * param {*} row
         * param {*} list
         * return {*}
         **/
        // sortableChange(oldindex, newindex, row, list) {
        //     this.data = []
        //     this.$nextTick(() => {
        //         this.data = list;
        //         console.log('拖拽后data', this.data)
        //     })
        //     console.log(oldindex, newindex, row, list)
        // },
        /**
         * description: 表列选中
         * param {*} scope
         * return {*}
         **/
        selectHeader(scope) {
            const { column, $index } = scope;
            this.currentColumn = column;
            this.$refs.widget.activeName = 'tab_1';
            this.$nextTick(() => {
                this.$refs.widget.$refs.columnForm.clearValidate()
            })
        },
        /**
         * description: 行选中
         * param {*} row
         * param {*} event
         * param {*} column
         * return {*}
         **/
        handleRowClick(row, event, column) {
            // row.$cellEdit = true
        },
        /**
         * description: 选中表头时，给当前列切换背景色
         * param {*} param1
         * return {*}
         **/
        headSelected({ column }) {
            const _hideColumn = this.option.column.find(i => i.prop == column.property);
            if (column.property != undefined && column.property === this.currentColumn.prop && this.currentColumn._prop === '') return 'selectedColumnErrorBg'
            if (column.property != undefined && column.property === this.currentColumn.prop) return 'selectedColumnBg'
            if (column.property != undefined && _hideColumn && _hideColumn._hide) return 'columnOpacity'
        },
        // 单元格点击
        cellClick(row, column, cell, event) {
            console.log(row, column, cell, event);
        },
        /**
         * description: 预览JSON
         * param {*} type 1本地数据 | 2预览数据
         * return {*}
         **/
        jsonPreview(type) {
            let localOption = {
                option: {
                    ...this.option
                },
                data: [
                    ...this.data
                ]
            }
            let previewOption = this.$refs.viewer ? this.$refs.viewer.getData() : {}
            this.$refs.viewJson.openJsonView(type == 1 ? localOption : previewOption)
        },
        importJson() {
            this.$refs.editCode.openCodeEditor()
        },
        previewTable() {
            // 根据伪隐藏状态，恢复到真实hide
            let _option = JSON.parse(JSON.stringify(this.option));
            _option.column.forEach((item) => {
                if (typeof item._hide === 'boolean' && item._hide) {
                    item.hide = true;
                }
            })
            this.previewTableData = {
                option: _option,
                data: this.data
            }
            this.viewerVisible = true;
        },
        handleImportJson(json) {
            // 转对象
            if (typeof json == 'string') json = eval('(' + json + ')')
            // const data = this.deepClone(json)
            const data = json;
            console.log('json', data)
            if (json.option) {
                this.option = json.option;
            }
            if (json.data) {
                this.data = json.data;
            }
        },
        saveTableDesign() {
            if (!this.option.tableTitle) {
                this.option.tableTitle = '明细'
            }
            // 根据伪隐藏状态，恢复到真实hide
            this.option.column.forEach((item) => {
                if (typeof item._hide === 'boolean' && item._hide) {
                    item.hide = true;
                }
            })
            let tableData = {
                option: this.option,
                data: this.data
            }
            let formDatas = beautifier(tableData, {
                generateType: 'string',
                dropQuotesOnKeys: true
            })
            this.handleStatus('saveSuccess!')
            alert(formDatas)
            console.log('表格数据', formDatas);
            // 二次编辑时，更新表数据
            // let formJsonObj = eval('(' + this.row.content + ')');
            // formJsonObj.tableOption = {
            //     option: this.option,
            //     data: this.data
            // };
            // 保存总参数
            // let formDatas = beautifier(formJsonObj, {
            //     generateType: 'string',
            //     dropQuotesOnKeys: true
            // })
            // ...saveTable
        },

        /**
         * description: 更新表数据字段
         * param {*} oldProp 旧prop名
         * param {*} newProp 新prop名
         * return {*}
         **/
        updateFields(oldProp, newProp) {
            (function fn(data) {
                for (let item of data) {
                    for (let name in item) {
                        if (name == oldProp) {
                            item[newProp] = item[name];
                            delete item[oldProp];
                        }
                    }
                    item.children && item.children.length && fn(item.children)
                }
            }
            )(this.data)
            this.currentColumn.prop = newProp
            this.$refs.crud.refreshTable();
            this.$refs.crud.init();
        },
        switchViewerMode(v) {
            if (v) {
                this.$refs.viewer.modifyMode();
            } else {
                this.$refs.viewer.viewMode();
            }
        },
        setColumnHide(data) {
            if (data && data.length) {
                return data.map(i => { return { ...i, hide: false } })
            } else {
                return []
            }
        },
        /**
         * description: 初始化
         * param {*} param1
         * return {*}
         **/
        setOption({ row, visible = true }) {
            this._option = JSON.parse(JSON.stringify(this.option))
            // console.log('row', row)
            // this.row = row;
            // 复显表
            // let jsonObj = eval('(' + row.content + ')');
            // let options = jsonObj.tableOption
            // if (options && Object.keys(options).length) {
            //     this.option = options.option;
            //     this.option.column = this.setColumnHide(options.option.column)
            //     this.data = options.data;
            // }
            this.visible = visible
            setTimeout(() => {
                this.$nextTick(() => {
                    this.firstLoad = false;
                })
            }, 400)
        },
    }
}
</script>

<style lang="scss" scoped>
.loadArea {
    height: 100%;
}
.table-designer {
    display: flex;
    flex: 1;
    height: 100%;
    .leftContent {
        padding: 30px 0 25px 25px;
        flex: 1;
        overflow: auto;
        .emptyText {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            .noResult {
                display: flex;
                flex-direction: column;
                align-items: center;

                i {
                    font-size: 80px;
                    color: #d7d7d7;
                }
                img {
                    width: 140px;
                }
                span {
                    margin-top: 20px;
                    font-size: 15px;
                    color: #979797;
                    em {
                        font-size: 12px;
                        color: #409eff;
                        margin-left: 4px;
                        cursor: pointer;
                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }
            }
        }
    }
    .rightPanle {
        border-left: 2px solid #e4e7ed;
        margin-left: 15px;
        background: #fff;
        padding: 15px;
        width: 420px;
        overflow: auto;
    }
}
.headArea {
    width: 100%;
    height: 100%;
    transition: 0.2s all;
}
.view-operation {
    padding: 10px 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.fieldRequired {
    // font-weight: bold;
    // color: #ff4d4d;
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
</style>
<style lang="scss">
.cell {
    // display: flex;
    // align-items: center;
}
.selectedColumnBg {
    background-color: #f5f5f5 !important;
}
.columnOpacity {
    opacity: 0.5;
}
.selectedColumnErrorBg {
    background-color: #fff2f2 !important;
}
.customTables {
    .el-dialog__body {
        height: calc(100% - 40px);
        padding: 0;
    }
}
</style>

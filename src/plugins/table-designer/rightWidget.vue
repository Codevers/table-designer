<template>
    <div class="widget-config-container">
        <el-tabs v-model="activeName">
            <el-tab-pane name="tab_1">
                <span slot="label"><i class="el-icon-s-tools"></i> 表列配置</span>
                <div class="widget-config" v-if="this.data && Object.keys(this.data).length > 0">
                    <el-form :model="data" label-suffix="：" labelPosition="left" labelWidth="90px" size="small" :rules="rules2" ref="columnForm">
                        <el-collapse v-model="collapse">
                            <el-collapse-item name="1">
                                <template slot="title">
                                    <div class="collapseTitle">
                                        <span>基本属性</span>
                                        <i class="el-icon-info"></i>
                                    </div>
                                </template>
                                <el-form-item label="标题">
                                    <el-input v-model="data.label" clearable placeholder="属性值"></el-input>
                                </el-form-item>
                                <el-form-item label="字段值" prop="_prop">
                                    <el-input v-model="data._prop" maxlength="32" clearable placeholder="数字或字母组成"></el-input>
                                </el-form-item>
                                <el-form-item label="类型" v-if="data.type && !data.component">
                                    <el-select v-model="data.type" style="width:100%;" placeholder="请选择类型" @change="handleChangeType">
                                        <el-option-group v-for="group in fields" :key="group.title" :label="group.title">
                                            <el-option v-for="item in group.list" :key="item.type" :label="item.label" :value="item.type"></el-option>
                                        </el-option-group>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="宽度">
                                    <el-input v-model="data.width" clearable placeholder="宽度"></el-input>
                                </el-form-item>
                                <el-form-item label="排序">
                                    <el-input v-model="data._order" type="number" maxLength="99" clearable placeholder="无值默认排最后，同值遵循先来后到"></el-input>
                                </el-form-item>
                                <el-form-item label="对齐方式">
                                    <el-select v-model="data.align" placeholder="对齐方式">
                                        <el-option v-for="item in alignConfig" :label="item.key" :value="item.value" :key="item.value"></el-option>
                                    </el-select>
                                </el-form-item>
                                <component :is="getComponent" :data="data" :default-values="defaultValues"></component>
                            </el-collapse-item>
                        </el-collapse>
                        <el-form-item style="margin-top:18px" label-width="0">
                            <el-button type="danger" icon="el-icon-delete" style="width:100%" @click="deleteCrudColumn()">删除</el-button>
                        </el-form-item>
                    </el-form>
                </div>
                <div v-else class="defaultArea">
                    <span v-if="hasColumnDatas()"><i class="el-icon-edit" style="font-size:24px"></i>点击表头进行列配置</span>
                    <span v-else><i class="el-icon-warning-outline" style="font-size:24px;margin-right:5px"></i>未创建表头</span>
                </div>
            </el-tab-pane>
            <el-tab-pane name="tab_2">
                <span slot="label"><i class="el-icon-s-tools"></i> 表格属性配置</span>
                <el-collapse v-model="collapse2">
                    <el-collapse-item name="1">
                        <template slot="title">
                            <div class="collapseTitle">
                                <span>基本属性</span>
                                <i class="el-icon-info"></i>
                            </div>
                        </template>
                        <el-form label-suffix="：" labelPosition="left" labelWidth="90px" size="small">
                            <el-form-item label="表名">
                                <el-input v-model="tableOption.tableTitle" clearable placeholder="默认“明细”"></el-input>
                            </el-form-item>
                            <el-form-item label="索引名">
                                <el-input v-model="tableOption.indexLabel" clearable placeholder="索引名"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                    <el-collapse-item name="2">
                        <template slot="title">
                            <div class="collapseTitle">
                                <span>表头配置</span>
                                <i class="el-icon-info"></i>
                            </div>
                        </template>
                        <el-form ref="optionForm" :model="dataColumn" label-suffix="：" labelPosition="left" labelWidth="90px" size="small" :rules="rules">
                            <el-form-item label="标题" prop="label">
                                <el-input v-model="dataColumn.label" clearable placeholder="输入标题"></el-input>
                            </el-form-item>
                            <el-form-item label="字段值" prop="prop">
                                <el-input v-model="dataColumn.prop" maxlength="32" clearable placeholder="数字或字母组成"></el-input>
                            </el-form-item>
                            <el-form-item label="对齐方式">
                                <el-select v-model="dataColumn.align" placeholder="对齐方式">
                                    <el-option v-for="item in alignConfig" :label="item.key" :value="item.value" :key="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="宽度">
                                <el-input v-model="dataColumn.width" clearable placeholder="默认”auto“，即自适应"></el-input>
                            </el-form-item>
                            <el-form-item label="占位内容">
                                <el-input v-model="dataColumn.placeholder" clearable placeholder="输入占位内容"></el-input>
                            </el-form-item>
                            <el-form-item label="排序">
                                <el-input v-model="dataColumn.order" type="number" maxLength="99" clearable placeholder="1、2、3"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" icon="el-icon-plus" :loading="addLoading" @click="addCrudColumn()">立即添加</el-button>
                                <el-button @click="resetCrudColumnForm()" icon="el-icon-refresh-right">重置</el-button>
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                </el-collapse>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
const dateArr = [
    'year', 'month', 'week', 'date', 'datetime', 'time', 'daterange', 'timerange', 'datetimerange', 'dates'
]
import fields from './fieldsConfig.js'
export default {
    props: ['data', 'tableOption', 'defaultValues'],
    data() {
        var fieldRule = (rule, value, callback) => {
            let reg = new RegExp(/^[0-9a-zA-Z_]{1,}$/, 'g')
            const otherColumn = this.tableOption.column.filter(i => i.prop != this.data.prop);
            const isRepeat = otherColumn.some(i => i.prop == value);
            if (reg.test(value)) {
                if (isRepeat) callback(new Error('字段值不可重复，请自觉点'))
                else callback()
            }
            else callback(new Error('字段值必须为数字或字母，请自觉点'));
        };
        return {
            addLoading: false,
            activeName: 'tab_1',
            fields,
            collapse: ['1', '2'],
            collapse2: ['1', '2'],
            alignConfig: [{
                key: '左对齐',
                value: 'left'
            }, {
                key: '右对齐',
                value: 'right'
            }, {
                key: '居中对齐',
                value: 'center'
            }],
            dataColumn: {
                ...this.creatColumnValue()
            },
            rules2: {
                _prop: [
                    { required: true, message: '字段值不可为空！', trigger: 'change' },
                    { validator: fieldRule, trigger: 'change' }
                ]
            },
            rules: {
                label: [
                    { required: true, message: '请输入标题', trigger: 'change' },
                ],
                prop: [
                    { required: true, message: '字段值不可为空！', trigger: 'change' },
                    { validator: fieldRule, trigger: 'change' }
                ]
            }

        }
    },
    watch: {
        activeName(v) {
            if (v == 'tab_2') {
                this.dataColumn = this.creatColumnValue();
            }
        }
    },
    computed: {
        getComponent() {
            const prefix = 'widget-'
            const { type, component } = this.data
            if ((!type || component) && type != 'ueditor') return prefix + 'custom'
            let result = 'input'
            if ([undefined, 'input', 'password', 'url'].includes(type)) result = 'input'
            else if (dateArr.includes(type)) result = 'date'
            else if (['array', 'img'].includes(type)) result = 'array'
            else if (['tree', 'cascader'].includes(type)) result = 'tree'
            else if (['radio', 'checkbox', 'select'].includes(type)) result = 'select'
            else result = type
            return prefix + result
        }
    },
    methods: {
        hasColumnDatas() {
            const column = this.tableOption.column.filter(i => i.prop != 'editIcon');
            return column.length ? true : false;
        },
        // prop随机数
        generateID() {
            return 'p' + Date.now() + Math.ceil(Math.random() * 99999)
        },
        /**
         * description: 生成表头数据
         * param {*}
         * return {*}
         **/
        creatColumnValue() {
            return {
                label: '',
                prop: this.generateID(),
                align: 'center',
                type: 'input',
                width: 'auto',
                order: this.lastSort() + 1,
                //开启编辑（表头cell和表数据$cellEdit都为true才可起效）
                cell: true
            }
        },
        /**
         * description: 获取列的最后一个sort
         * param {*}
         * return {*}
         **/
        lastSort() {
            let allColumn = this.tableOption.column.filter(i => i.prop != 'editIcon');
            if (allColumn) {
                if (allColumn.length === 0) {
                    return 0
                } else {
                    let last = allColumn[allColumn.length - 1].order;
                    let isNumReg = new RegExp(/^[0-9]+$/, 'i');
                    if (isNumReg.test(last)) {
                        return Number(last)
                    } else {
                        return 0
                    }
                }
            }
        },
        /**
         * description: 获取类型
         * param {*} type
         * return {*}
         **/
        getConfigByType(type) {
            return new Promise((resolve, reject) => {
                fields.forEach(field => {
                    field.list.forEach(config => {
                        if (config.type == type) resolve(config)
                    })
                })
                reject()
            })
        },
        /**
         * description: 对data设置类型
         * param {*} type
         * return {*}
         **/
        async handleChangeType(type) {
            if (type) {
                const config = await this.getConfigByType(type);
                config.prop = this.data.prop;
                for (let key in config) {
                    if (config && Object.prototype.hasOwnProperty.call(config, key) && !['icon', 'label', 'span'].includes(key)) {
                        const val = config[key]
                        this.$set(this.data, key, val);
                    }
                }
            }
        },
        /**
         * description: 添加表头
         * param {*}
         * return {*}
         **/
        addCrudColumn() {
            this.$refs.optionForm.validate((valid) => {
                if (valid) {
                    this.addLoading = true;
                    this.dataColumn._prop = this.dataColumn.prop
                    this.dataColumn._order = this.dataColumn.order
                    this.dataColumn._hide = false;
                    let value = JSON.parse(JSON.stringify(this.dataColumn))
                    this.$emit('newCrudColumn', value, (res) => {
                        this.resetCrudColumnForm();
                        this.addLoading = false;
                    })
                }
            });
        },
        deleteCrudColumn() {
            this.$emit('deleteColumn')
        },
        resetCrudColumnForm() {
            this.$refs.optionForm.resetFields();
            this.dataColumn = this.creatColumnValue();
        }
    },
    mounted() {
        this.activeName = this.hasColumnDatas() ? 'tab_1' : 'tab_2'
    },

}
</script>

<style lang="scss" scoped>
.defaultArea {
    padding: 50px 20px;
    text-align: center;
    span {
        font-size: 22px;
        color: #ccc;
    }
}
.collapseTitle {
    span {
        color: #000;
    }
    i {
        margin-left: 4px;
        font-size: 15px;
    }
}
</style>
<style lang="scss">
@import "./styles/index.scss";
</style>

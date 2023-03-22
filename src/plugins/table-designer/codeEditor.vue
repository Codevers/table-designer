<template>
    <div>
        <el-drawer title="导入JSON" :visible.sync="visible" size="50%" append-to-body destroy-on-close custom-class="drawerCanScroll">
            <monaco-editor v-model="codeJson" keyIndex="import" height="91%"></monaco-editor>
            <div class="drawer-foot">
                <el-button size="medium" type="success" @click="handleImportJson()">生成表</el-button>
                <el-button size="medium" @click="visible = false">取消</el-button>
            </div>
        </el-drawer>
    </div>
</template>
<script>
import MonacoEditor from './editor/monaco-editor'
export default {
    components: {
        MonacoEditor
    },
    data() {
        return {
            visible: false,
            codeJson: {}
        }
    },
    methods: {
        openCodeEditor() {
            this.visible = true;
            this.codeJson = {}
        },
        handleImportJson() {
            this.$emit('handleImportJson', this.codeJson)
            this.visible = false;
            this.codeJson = {}
        }
    },
    mounted() {
    },
}
</script>

<style lang="scss">
.drawerCanScroll {
    .el-drawer__body {
        overflow: auto;
    }
}
</style>

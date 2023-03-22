<template>
    <div>
        <el-drawer title="生成JSON" :visible.sync="jsonVisible" size="50%" append-to-body destroy-on-close custom-class="drawerCanScroll">
            <json-view :data="json" :deep="deepNum" style="padding-bottom:100px" />
            <div class="drawer-foot">
                <el-popover placement="top" trigger="hover" width="350px">
                    <el-form v-model="configOption" style="padding: 0 20px" label-suffix="：" label-width="180px" label-position="left">
                        <el-form-item label="类型">
                            <el-popover placement="top-start" trigger="hover" content="复制json对象" style="margin-right: 15px;">
                                <el-radio slot="reference" v-model="configOption.generateType" label="json">json</el-radio>
                            </el-popover>
                            <el-popover placement="top-start" trigger="hover" content="复制string字符串，可直接用于后端保存无需再次处理。">
                                <el-radio slot="reference" v-model="configOption.generateType" label="string">string</el-radio>
                            </el-popover>
                        </el-form-item>
                        <el-form-item label="缩进长度-空格数量">
                            <el-slider v-model="configOption.space" show-stops :marks="{ 1: '1', 2: '2', 3: '3', 4: '4' }" :min="1" :max="4" :step="1"></el-slider>
                        </el-form-item>
                        <el-form-item label="引号类型">
                            <el-switch v-model="configOption.quoteType" active-value="single" inactive-value="double" active-text="单引号" inactive-text="双引号"></el-switch>
                        </el-form-item>
                        <el-form-item label="移除key的引号">
                            <el-switch v-model="configOption.dropQuotesOnKeys"></el-switch>
                        </el-form-item>
                        <el-form-item label="移除数字字符串的引号">
                            <el-switch v-model="configOption.dropQuotesOnNumbers"></el-switch>
                        </el-form-item>
                    </el-form>
                    <el-button size="medium" slot="reference" type="primary" @click="copyJson()">复制</el-button>
                </el-popover>
                <el-button size="medium" @click="visible = false" style="margin-left: 10px;">取消</el-button>
            </div>
        </el-drawer>
    </div>
</template>
<script>
import jsonView from 'vue-json-views'
import beautifier from './editor/json-beautifier'
export default {
    components: {
        jsonView
    },
    data() {
        return {
            jsonVisible: false,
            json: {},
            deepNum: 5,
            configOption: {
                generateType: 'json',
                space: 2,
                quoteType: 'single',
                dropQuotesOnKeys: true
            },
        }
    },
    methods: {
        openJsonView(json) {
            this.jsonVisible = true;
            this.json = json;
        },
        copyJson() {
            this.$Clipboard({
                text: beautifier(this.json, {
                    minify: false,
                    ...this.configOption
                })
            }).then(() => {
                this.$message.success('复制成功')
            }).catch(() => {
                this.$message.error('复制失败')
            });
        },
    }
}
</script>

<style lang="scss">
.drawerCanScroll {
    .el-drawer__body {
        overflow: auto;
    }
}
</style>

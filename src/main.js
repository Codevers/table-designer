import Vue from 'vue'
import App from './App.vue'
import Avue from '@smallwei/avue';
import ElementUI from 'element-ui';
import '@smallwei/avue/lib/index.css';
import 'element-ui/lib/theme-chalk/index.css';
import tableDesigner from './plugins/table-designer/'
import widgetConfig from './plugins/table-designer/widget'
Vue.use(ElementUI);
Vue.use(tableDesigner)
Vue.use(widgetConfig)
Vue.use(Avue);
Vue.config.productionTip = false
new Vue({
  render: h => h(App),
}).$mount('#app')
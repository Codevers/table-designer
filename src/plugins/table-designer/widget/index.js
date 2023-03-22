/**
 $ @Description: 加载小组件
 $ @Author: Peng.p
 $ @Date: 2021-11-12 13:38:39
 $ @LastEditTime: 2021-11-23 15:43:18
 */
const requireComponent = require.context('./', true, /\.vue$/);
const install = (Vue) => {
  if (install.installed) return
  else install.installed
  requireComponent.keys().forEach(fileName => {
    const config = requireComponent(fileName)
    const componentName = config.default.name
    Vue.component(componentName, config.default || config)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install
}

import template from './template'
export default {
  install(Vue) {
    const TempConstructor = Vue.extend(template);
    const Instance = new TempConstructor().$mount(document.createElement("div"));
    document.body.appendChild(Instance.$el)
    let Object = {
      open(options = { }) {
        return new Promise((resolve, reject) => {
          Instance.setOption(options);
          Instance.$on('dialogHandle', (val) => resolve({ status: val }))
        })
      },
      close() {
        Instance.visible = false
      }
    }
    Vue.prototype.$tableDesigner = Object
  }
}

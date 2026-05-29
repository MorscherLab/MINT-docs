import DefaultTheme from 'vitepress/theme'
import { createPinia } from 'pinia'
import ComponentCatalog from './components/ComponentCatalog.vue'
import ComponentPlayground from './components/ComponentPlayground.vue'
import MermaidDiagram from './components/MermaidDiagram.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(createPinia())
    app.component('ComponentCatalog', ComponentCatalog)
    app.component('ComponentPlayground', ComponentPlayground)
    app.component('MermaidDiagram', MermaidDiagram)
  },
}

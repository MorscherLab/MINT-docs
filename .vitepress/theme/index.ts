import DefaultTheme from 'vitepress/theme'
import { createPinia } from 'pinia'
import '@morscherlab/mint-sdk/styles'
import ComponentCatalog from './components/ComponentCatalog.vue'
import MermaidDiagram from './components/MermaidDiagram.vue'
import Terminal from './components/Terminal.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(createPinia())
    app.component('ComponentCatalog', ComponentCatalog)
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('Terminal', Terminal)
  },
}

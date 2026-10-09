import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './theme.generated.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
}

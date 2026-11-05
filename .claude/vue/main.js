// Para un proyecto Vite: npm i vue vuetify @mdi/font
import { createApp } from 'vue';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import ListaCompra from './ListaCompra.vue';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'casa',
    themes: {
      casa: {
        dark: false,
        colors: {
          background: '#fafafa', surface: '#ffffff',
          primary: '#086375', secondary: '#3C1642',
          accent: '#AFFC41', 'on-background': '#3C1642', 'on-surface': '#3C1642'
        }
      }
    }
  }
});

createApp(ListaCompra).use(vuetify).mount('#app');

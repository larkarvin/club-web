import 'flatpickr/dist/flatpickr.css';
import VueFlatpickr from 'vue-flatpickr-component';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueFlatpickr);
});

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      '50': '#eff9ff',
      '100': '#daf1ff',
      '200': '#bde7ff',
      '300': '#90daff',
      '400': '#5cc4fe',
      '500': '#36a6fb',
      '600': '#1985f0',
      '700': '#1871dd',
      '800': '#1a5bb3',
      '900': '#1b4f8d',
      '950': '#153056',
    },
  },
  components: {
    inputtext: {
      root: {
        placeholderColor: 'var(--p-surface-400)',
      },
    },
    // datatable: {
    //   headerCell: {
    //     background: 'var(--p-slate-50)',
    //   },
    // },
  },
});

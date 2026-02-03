import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      "50": "#e6effd",
      "100": "#ccdefb",
      "200": "#99bdf7",
      "300": "#669df2",
      "400": "#337cee",
      "500": "#005bea",
      "600": "#0049bb",
      "700": "#00378c",
      "800": "#00245e",
      "900": "#00122f",
    },
  },
  components: {
    inputtext: {
      root: {
        placeholderColor: "var(--p-surface-400)",
      },
    },
  },
});

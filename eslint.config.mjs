import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Laravel yedek kopyası — marel-v2 kapsamı dışı
    "marel-plise - Copy/**",
    "marel-plise/**",
  ]),
  {
    rules: {
      // The project contains legacy API/DB adapters with intentionally broad
      // payload shapes. Keep reporting them without blocking deployment.
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;

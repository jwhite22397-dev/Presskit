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
  ]),
  {
    files: ["src/components/artist/**/*.{ts,tsx}", "src/components/dashboard/content-studio.tsx"],
    rules: {
      // Artist photos can be any https host the musician uploads or links.
      // next/image requires a build-time host allow-list, so these stay as img.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;

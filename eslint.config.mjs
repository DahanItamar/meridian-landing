import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  {
    rules: {
      // Constitution principle 7: images render through next/image with explicit
      // dimensions. next/core-web-vitals ships this as a warning, which never fails
      // a build — so the rule the constitution calls enforced was not enforcing
      // anything. Escalated so `next lint` exits non-zero (AC-036).
      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "error",

      // AC-050: a placeholder is not a label.
      "jsx-a11y/label-has-associated-control": "error",
      // AC-054: informative images described, decorative ones empty.
      "jsx-a11y/alt-text": "error",

      // Constitution: no unexplained unused code.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;

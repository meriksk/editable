import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const banner = `/*!
 * @meriksk/editable v${pkg.version}
 * (c) meriksk
 * Released under the MIT License
 */`;

// When loaded via <script> tag, auto-register with the global jQuery.
// In CJS/AMD contexts `Editable` is never a global, so typeof check skips this safely.
const browserFooter =
    "if (typeof Editable === 'function') {" +
    "  if (typeof jQuery !== 'undefined') { Editable(jQuery); }" +
    "  else if (typeof $ !== 'undefined') { Editable($); }" +
    "}";

export default {
    input: "src/editable.js",
    external: ["jquery"],
    plugins: [resolve()],
    output: [
        {
            file: "dist/editable.esm.js",
            format: "esm",
            banner,
        },
        {
            file: "dist/editable.esm.min.js",
            format: "esm",
            banner,
            plugins: [terser()],
        },
        {
            file: "dist/editable.cjs.js",
            format: "cjs",
            banner,
            exports: "auto",
        },
        {
            file: "dist/editable.cjs.min.js",
            format: "cjs",
            banner,
            exports: "auto",
            plugins: [terser()],
        },
        {
            file: "dist/editable.umd.js",
            format: "umd",
            name: "Editable",
            banner,
            footer: browserFooter,
            globals: {
                jquery: "$",
            },
        },
        {
            file: "dist/editable.umd.min.js",
            format: "umd",
            name: "Editable",
            banner,
            footer: browserFooter,
            globals: {
                jquery: "$",
            },
            plugins: [terser()],
        },
    ],
};

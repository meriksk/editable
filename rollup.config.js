import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const banner = `/*!
 * @meriksk/editable v${pkg.version}
 * (c) meriksk
 * Released under the MIT License
 */`;

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
            globals: {
                jquery: "$",
            },
        },
        {
            file: "dist/editable.umd.min.js",
            format: "umd",
            name: "Editable",
            banner,
            globals: {
                jquery: "$",
            },
            plugins: [terser()],
        },
    ],
};

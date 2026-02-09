import path from "node:path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";
import {defineConfig} from "vite";

// https://vite.dev/config/
export default defineConfig({
    base: "/vue-starter",
    plugins: [
        vue(),
        vueJsx(),
        AutoImport({
            include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
            imports: ["vue"],
            dirs: ["./src"],
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // 1️⃣ 静默 node_modules 中的 Sass warning
                quietDeps: true,

                // 2️⃣ 全局注入 devui 变量（可选，但强烈推荐）
                additionalData: `
          @use "devui-theme/styles-var/devui-var.scss" as *;
        `,
            },
        },
    },

    resolve: {
        alias: {
            "@view": path.resolve(__dirname, "./src/view"),
            "@": path.resolve(__dirname, "./src"),
        },
    },
});

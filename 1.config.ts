import {defineConfig} from "@rspack/cli";
//import * as rspack from "@rspack/core";
export default defineConfig({
    mode:"development",
    target:"node",
    entry:"./src/serv.ts",
    output:{
        filename:"main.js",
        assetModuleFilename:"[hash][ext]"
    },
    externalsType:"commonjs",
    externals:{
        "express":"express"
    },
    externalsPresets:{node:true},
    devtool:false
});

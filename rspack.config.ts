import {defineConfig} from "@rspack/cli";
import {HtmlRspackPlugin} from "@rspack/core";
export default defineConfig({
    mode:"production",
    target:"web",
    entry:"./src/index.ts",
    output:{
        filename:"[contenthash].js",
        clean:true,
        assetModuleFilename:"[hash][ext]"
    },
    module:{
        rules:[
            {
                test:/\.(mp3|wav|bmp|jpe?g|png|svg|gif)$/,
                type:"asset/resource"
            },
            {
                test:/\.txt$/,
                type:"asset/source"
            }
        ]
    },
    externals:{
        "phaser":"Phaser",
        "eventemitter3":"EventEmitter"
    },
    //devtool:false,
    plugins:[new HtmlRspackPlugin({
        template:"src/index.html"
    })]
});

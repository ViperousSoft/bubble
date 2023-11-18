import {defineConfig} from "@rspack/cli";
import * as rspack from "@rspack/core";
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
                test:/\.css$/,
                use:[
                    {
                        loader:"postcss-loader",
                        options:{
                            postcssOptions:{
                                plugins:[
                                    [
                                        "postcss-preset-env"
                                    ]
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    },
    externals:{
        "phaser":"Phaser"
    },
    //devtool:false,
    plugins:[new rspack.HtmlRspackPlugin({
        template:"src/index.html"
    })],
    builtins:{
        react:{runtime:"classic"}
    }
});

const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css', 'ts'];
require('babel-polyfill')

const isProduction = process.env.NODE_ENV === 'production';


module.exports = {
    lintOnSave: false,
    outputDir: "dist",
    runtimeCompiler: false,
    productionSourceMap: false,
    css: {
      loaderOptions: {
        scss: {
          additionalData: `@import "~@/styles/variables.scss";`
        }
      }
    },
    pages: {
        index: {
            // entry point to NFT-MARKET application
            entry: "src/main.js",
            // html file to use as template when serving or building
            template: "public/index.html",
            // file to distribute from build for production (in the dist directory)
            filename: "index.html"
        }
    },
    transpileDependencies: [
      'some-imported-lib',
      'iview',
      'axios',
    ],
    pwa: {
      name: "d1m1",
      iconPaths: {
        favicon32: 'favicon.ico',
        favicon16: 'favicon.ico',
        appleTouchIcon: 'favicon.ico',
        maskIcon: 'favicon.ico',
        msTileImage: 'favicon.ico'
      }
    },
    chainWebpack: (config) => {
       config.plugins.delete('index').delete('preload-index');
    },
    devServer: {
        host: '0.0.0.0',
        port: 20008,
        https: false,
        hotOnly: false,
        disableHostCheck: false,
        proxy: {
            '/fingernft': {
              target: 'http://localhost:20004',
            },
            "/static":{
              target: 'http://localhost:20004',
              changeOrigin: true,
            },
        },
    },
    // chainWebpack(config) {
    //   if (isProduction) {
    //     config.optimization.splitChunks({
    //       cacheGroups: {
    //         common: {//commons 一般是是个人定义的
    //           name: 'chunk-common', // 打包后的文件名
    //           chunks: 'initial',
    //           minChunks: 1,
    //           maxInitialRequests: 5,
    //           minSize: 0,
    //           priority: 1,
    //           reuseExistingChunk: true
    //         },
    //         vendors: {//vendor 是导入的 npm 包
    //           name: 'chunk-vendors',
    //           test: /[\\/]node_modules[\\/]/,
    //           chunks: 'initial',
    //           maxSize: 600000,
    //           maxInitialRequests: 20,
    //           priority: 2,
    //           reuseExistingChunk: true,
    //           enforce: true
    //         },
    //         antDesignVue: {//把antDesignVue从chunk-vendors.js提取出来。当然我们也可以把mixins，vue.min.js等等也按照类似配置提取出来
    //           name: 'chunk-ant-design-vue',
    //           test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
    //           chunks: 'initial',
    //           priority: 3,
    //           maxSize: 600000,
    //           reuseExistingChunk: true,
    //           enforce: true
    //         }
    //       }
    //     })
    //   }
    // },  
    configureWebpack: config => {
        if (!isProduction) {
            config.devtool = 'cheap-source-map';
            config.optimization = {
                splitChunks: {
                    cacheGroups: {
                        default: false
                    }
                }
            }
        }
        // 生产模式
        if (isProduction) {
            // 打包生产.gz包
            config.plugins.push(new CompressionWebpackPlugin({
                algorithm: 'gzip',
                test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
                threshold: 10240,
                minRatio: 0.8
            }))
            config.performance = {
              hints: "warning",
              hints: "error",
              hints: false,
              maxAssetSize: 200000,
              maxEntrypointSize: 400000,
              assetFilter: function(assetFilename) {
                return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
              }
            }
        }
    }
}

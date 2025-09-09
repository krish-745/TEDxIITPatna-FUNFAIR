const { defineConfig } = require('@vue/cli-service')
const autoprefixer = require('autoprefixer')

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,   // 🚀 disable .map files in prod build
  configureWebpack: {
    plugins: [
      autoprefixer
    ]
  },
})

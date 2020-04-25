# vue-cli-plugin-ssh

vue-cli3 ssh插件

## 安装

命令

    vue add ssh

## 使用准备

向你的 `vue.config.js` 文件的 `pluginOptions`对象上添加一些配置

```javascrit
module.exports = {
    pluginOptions: {
        ssh:{
            projectName: 'projectName', // Optional. If provided, target will be uploaded to 'remotePath/projectName', otherwise to 'remotePath/'
            host: 'localhost',
            port: 22,
            username: 'root',
            password: '123456',
            // privateKey: require('fs').readFileSync('/here/is/my/key')
            remotePath:'/var/www',
            localPath:'dist'
        }
    }
}
```

## 命令行模式下的一些配置

---
请保证 `package.json`  文件的`scripts` 下有 `ssh`命令

```json

"scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "ssh": "vue-cli-service build && vue-cli-service ssh"
},
```

现在使用命令行运行

    npm run ssh

或者

    yarn ssh

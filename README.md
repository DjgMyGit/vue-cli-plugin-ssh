# vue-cli-plugin-ssh2

vue-cli-plugin for ssh2

## Installation

via command line

    vue add ssh2

## Before Use

add this to your `vue.config.js` in  `pluginOptions`

```javascrit
module.exports = {
    pluginOptions: {
        ssh2:{
            projectName: 'projectName',
            host: 'localhost',
            port: 22,
            username: 'root',
            password: '123456',
            remotePath:'/var/www',
            localPath:'dist'
        }
    }
}
```

## Command Line Setting

---
Add command to 'scripts' part of package.json

```json

"scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "ssh2": "vue-cli-service build && vue-cli-service ssh2"
},
```

Now you can

    npm run ssh2

or

    yarn ssh2
module.exports = api => {
    api.extendPackage({
        scripts: {
            ssh: 'vue-cli-service build && vue-cli-service ssh'
        },
        dependencies: {
            "archiver": "^3.0.0",
            "chalk": "^2.4.1",
            "ssh2": "^0.6.1"
        },
    })

}
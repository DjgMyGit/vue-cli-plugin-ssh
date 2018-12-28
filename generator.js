module.exports = api => {
    api.extendPackage({
        scripts: {
            ssh2: 'vue-cli-service build && vue-cli-service ssh2'
        },
        dependencies: {
            "archiver": "^3.0.0",
            "chalk": "^2.4.1",
            "ssh2": "^0.6.1"
        },
    })

}
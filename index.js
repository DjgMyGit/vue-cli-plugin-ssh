const chalk = require('chalk')
var Client = require('ssh2').Client
var archiver = require('archiver')
var conn = new Client()
var fs = require('fs')
var path = require('path');
module.exports = (api, projectOptions) => {

    api.chainWebpack(webpackConfig => {
        // 通过 webpack-chain 修改 webpack 配置
    })

    api.configureWebpack(webpackConfig => {
        // 修改 webpack 配置
        // 或返回通过 webpack-merge 合并的配置对象
    })

    api.registerCommand('ssh', args => {
        // 注册 `vue-cli-service test`
        if (!projectOptions.pluginOptions.ssh) {
            throw new Error(`请在vue.config.js 里的 pluginOptions 配置
                ssh: {
                    projectName: 'projectName', // Optional. If provided, target will be uploaded to 'remotePath/projectName', otherwise to 'remotePath/'
                    host: 'localhost',
                    port: 22,
                    username: 'root',         // username
                    password: '123456',       // password
                    // privateKey: require('fs').readFileSync('/here/is/my/key') 
                    remotePath: '/var/www',   // remote path to upload
                    localPath: 'publish'      // local path to upload
                }
            `)
        }
        let config = projectOptions.pluginOptions.ssh;
        let sshObj = new SSH2ToServer(config, conn, api.service.context);
        sshObj.Tar();
    })
}
module.exports.defaultModes = {
    build: 'production'
}
/// <reference path="./index.d.ts" />
class SSH2ToServer {
    /**
     * @param {ISSh2Config} config
     * @param {Client} conn
     */
    constructor(config, conn, rootPath) {
        this.config = config;
        this.rootPath = rootPath;
        this.user = {
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            privateKey: config.privateKey
        }

        if (!this.config.projectName) {
            this.config.projectName = '____'+new Date().valueOf()
        }

        this.uploadShellList = this.config.projectName.startsWith('____') ? [
            `cd ${config.remotePath}\n`,
            `ls | grep -v ${config.projectName}.zip | xargs rm -rf\n`,
            `unzip -o ${config.remotePath}/${config.projectName}.zip -d ${config.remotePath}\n`,
            `rm -rf ${config.remotePath}/${config.projectName}.zip\n`,
            `exit\n`
          ] : [
            `cd ${config.remotePath}\n`,
            `[ -f ${config.projectName} ] && mv ${config.projectName} ${config.projectName}-${(new Date()).toLocaleDateString()}-${(new Date()).toLocaleTimeString()}\n`,
            `[ -f ${config.projectName} ] && rm -rf ${config.projectName}/*\n`,
            `unzip -o ${config.projectName}.zip -d ${config.projectName}\n`,
            `rm -rf ${config.projectName}.zip\n`,
            `exit\n`
        ]
        this.params = {
            file: path.resolve(this.rootPath, `${config.localPath}/${config.projectName}.zip`),
            target: `${config.remotePath}/${config.projectName}.zip`
        }
        this.SShClient = conn;
        console.log(`Uploading ${this.params.file} to ${this.user.host}/${this.params.target}……`)
    }

    Tar() {
        const outPutFile = path.resolve(this.rootPath, this.config.localPath, this.config.projectName + ".zip");
        var output = fs.createWriteStream(outPutFile);
        var archive = archiver('zip');
        var $this = this;
        output.on("close", function () {
            function humanFileSize(size) {
                var i = Math.floor( Math.log(size) / Math.log(1024) );
                return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
            }
            console.log(`Tar completed with size ${humanFileSize(archive.pointer())}...ready to upload`)
            $this.Ready();
        })
        output.on("end", function () {});
        archive.on('error', function (error) {
            throw error
        })

        var cwd = this.config.localPath.startsWith('/')
          ? this.config.localPath
          : process.cwd()+'/'+this.config.localPath
        if (!cwd.endsWith('/')) cwd += '/'

        archive.pipe(output);
        archive.glob("**", {
            cwd: cwd,
            ignore: this.config.projectName + ".zip"
        });
        archive.finalize();
    }
    uploadFile() {
        var $this = this;
        const {
            file,
            target
        } = this.params;
        if (!this.SShClient) {
            return;
        }
        this.SShClient.sftp(function (error, sftp) {
            if (error) {
                throw error;
            }
            sftp.fastPut(file, target, {}, function (err, result) {
                if (err) {
                    console.log(chalk.red(err.message));
                    throw err;
                }
                $this.ExecShell();
            })
        })
    }
    ExecShell() {
        var $this = this;
        this.SShClient.shell(function (error, stream) {
            if (error) throw err;
            stream.on('close', function () {
                console.log('========Stream::CLose=========');
                $this.SShClient.end();
                fs.unlinkSync($this.params.file)
            }).on('data', function (data) {
                // console.log('STDOUT: ' + data)
            }).stderr.on('data', function (data) {
                console.log('STDERR: ' + data)
            })
            stream.end($this.uploadShellList.join(''))

        })
    }
    Ready() {
        var $this = this;
        this.SShClient.on('ready', function () {
            console.log('client::Ready')
            $this.uploadFile();
        }).connect(this.user);
    }
}

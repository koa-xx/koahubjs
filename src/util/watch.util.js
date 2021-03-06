import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import {watch as debug} from "./../util/log.util";
import config from "./../config/index.config";

function mkdirsSync(dirname, mode) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}

function delDirs(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                delDirs(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

export default function watch(callback) {

    const watcher = chokidar.watch(config.app, {
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('add', function (filePath, stats) {

        const fileRuntimePath = filePath.replace(`${config.app}/`, `${config.runtime}/`);
        mkdirsSync(path.dirname(fileRuntimePath));

        debug(filePath, 'add');
        callback(filePath);
    });

    watcher.on('change', function (filePath, stats) {

        debug(filePath, 'change');
        callback(filePath);
    });

    watcher.on('unlink', function (filePath, stats) {

        const runtimePath = filePath.replace(`${config.app}/`, `${config.runtime}/`);
        fs.unlinkSync(runtimePath);

        debug(filePath, 'unlink');
        callback(filePath, false);
    });

    watcher.on('unlinkDir', function (dirPath) {

        const dirRuntimePath = dirPath.replace(`${config.app}/`, `${config.runtime}/`);
        delDirs(dirRuntimePath);
    });
}
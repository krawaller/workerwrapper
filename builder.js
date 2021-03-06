#! /usr/bin/env node

var fs = require("fs");
var path = require("path");
var webpack = require("webpack");

var workerTemplate = fs.readFileSync(__dirname+"/template_worker.js")+'';
var wrapperTemplate = fs.readFileSync(__dirname+"/template_wrapper.js")+'';

var pathToLib = process.cwd()+'/'+process.argv[2];
var pathToLibDir = path.dirname(pathToLib);
var libName = path.basename(pathToLib,'.js');

var lib = require(pathToLib);

if (lib.default){
  lib = lib.default;
}

// **************** Generate webworker ****************

var pathToTempFile = pathToLibDir + '/' + libName + '_worker_TEMP.js';

fs.writeFileSync(pathToTempFile, workerTemplate.replace('PATH_TO_LIB', pathToLib));

var compiler = webpack({
  entry: pathToTempFile,
  output: {
    path: pathToLibDir,
    filename: libName + '_worker.js'
  },
  resolve: {
    extensions: [".js"]
  }
});

compiler.run(function(err,stats){
  var message = stats.toString("errors-only") || 'Webworker file created at '+pathToLibDir+'/'+libName + '_worker.js';
  console.log(message);
  fs.unlinkSync(pathToTempFile);
});

// **************** Generate wrapped lib ****************

var methods = Object.keys(lib);

fs.writeFileSync(pathToLibDir + '/'+libName+'_async.js', wrapperTemplate.replace('LIB_METHODS', JSON.stringify(methods)));
console.log('Async wrapper file created at '+pathToLibDir+'/'+libName + '_async.js');

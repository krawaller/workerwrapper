/* Generated by WorkerWrapper */

var lib = require('PATH_TO_LIB');

if (lib.default){
  lib = lib.default;
}

onmessage = function(e){
  var method = e.data[0];
  var callid = e.data[1];
  var args = e.data[2];
  var result = lib[method].apply(lib,args);
  postMessage([callid,result]);
}

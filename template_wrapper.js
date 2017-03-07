
module.exports = function(pathToLib, nbrOfWorkers){

  var workerListeners = {};
  var freeWorkers = [];
  var busyWorkers = [];
  var nextCallId = 0;

  function freeUpWorker(worker){
    busyWorkers = busyWorkers.filter(function(w){ return w !== worker; });
    freeWorkers.push(worker);
  }

  function catchWorker(){
    var worker = (freeWorkers.length ? freeWorkers : busyWorkers).shift();
    busyWorkers.push(worker);
    return worker;
  }

  function workerMessageHandler(e){
    var resultid = e.data[0];
    var result = e.data[1];
    workerListeners[resultid](result);
    delete workerListeners[resultid];
    freeUpWorker(this);
  }

  function libMethod(method){
    var args = Array.prototype.slice.call(arguments).slice(1);
    return new Promise(function(resolve,reject){
      var callid = ++nextCallId;
      var worker = catchWorker();
      worker.postMessage([method,callid,args]);
      workerListeners[callid] = resolve;
    });
  }

  for(var i=0; i<nbrOfWorkers; i++){
    var worker = new Worker(pathToLib);
    worker.onmessage = workerMessageHandler;
    freeUpWorker(worker);
  }

  return LIB_METHODS.reduce(mem,function(method){
    mem[method] = libMethod.bind(null,method);
    return mem;
  },{});

};

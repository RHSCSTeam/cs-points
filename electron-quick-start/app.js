var exec = require('child_process').exec;
var output = '';
var child;
// executes `pwd`
child = exec("java -v", function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  output = stderr;
  document.getElementById("test").innerHTML = output;
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});

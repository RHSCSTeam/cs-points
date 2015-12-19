var exec = require('child_process').exec;
var output = '';
var child;
// executes `pwd`
child = exec("npm -version", function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  output = stdout.toString();
  document.getElementById("test").innerHTML = output;
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});
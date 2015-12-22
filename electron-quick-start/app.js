var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var output = '';
var child;
// executes `pwd`
function execTerminal(){
	child = exec("npm -version", function (error, stdout, stderr) {
	  console.log('stdout: ' + stdout);
	  console.log('stderr: ' + stderr);
	  output = stdout;
	  document.getElementById("test").innerHTML = output;
	  if (error !== null) {
	    console.log('exec error: ' + error);
	  }
	});
}
function addProblem(){
	url = document.getElementById("url").value;
	console.log(url.search("uva.onlinjudge.org"));
	if(url.search("onlinejudge") == -1){
		alert("Invalid URL");
	}else{
		console.log(url);
		request(url, function(error, response, html){
			if(!error){
				var DOM = cheerio.load(html);
				var name = '';
				var time = '';
				DOM("tr").each(function(i, elem) {
				  name = DOM(this).text();
				  name = name.trim();
				});

				name = name.split('\t');
				time = name[2];
				name = name[0];
				console.log(name,time);
				$("#added").append('<button type="button" class="list-group-item">'+name+'</button>');
			}else{
				alert("Couldn't load URL");
			}
		});
	}
}


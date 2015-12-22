var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var output = '';
var child;
if(process.platform == "darwin"){
	$(".macNav").addClass("mac");
}
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
function addProblem(override){
	url = document.getElementById("url").value;
	if(override != ''){
		url = override;
	}
	console.log(url);
	if(url.search("uva.onlinejudge") == -1){
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
				if(name == "Display #" && name == ""){
					alert("Invalid Page");
				}else{
					$("#added").append('<button type="button" class="list-group-item">'+name+'</button>');
				}
			}else{
				alert("Couldn't load URL");
			}
		});
	}
}

function loadEVERYTHING(){
//Might Accidently DDos UVa if used. so be careful.
	for(var x = 1; x <= 1000; x++){
		addProblem(("https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&category=3&page=show_problem&problem=" + x).toString());
	}
}

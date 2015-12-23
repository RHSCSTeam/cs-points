var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var toastr = require("toastr"); 
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
		toastr.error("Invalid URL");
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
				iframeURL = DOM("iframe").attr("src");
				resultsURL = DOM("a[target=_new]").attr("href");
				name = name.split('\t');
				time = name[2];
				name = name[0];
				var id = makeid();
				paramId = "'" + id + "'";
				console.log(name,time);
				if(name == "Display #" && time == ""){
					toastr.error("Invalid Page");
				}else{
					$("#added").append('<button type="button" class="list-group-item" id="'+id+'" name="'+name+'"time="'+time+'" url="'+url+'" iframeURL='+iframeURL+' resultsURL="'+resultsURL+'"onclick="viewProblem('+paramId+')">'+name+'</button>');

				}
			}else{
				toastr.error("Couldn't load URL");
			}
		});
	}
}
function viewProblem(id){
	id = '#' + id;
	var name = $(id).attr("name");
	var time = $(id).attr("time");
	var url = $(id).attr("url");
	alert(url);
	console.log(name,time);
	var iframeURL = $(id).attr("iframeURL");
	var resultsURL = $(id).attr("resultsURL");
	$("#title").text(name);
	$('#timelimit').text(time);
	$('#link').attr("href", url);
	console.log(iframeURL);

	loadInfo("https://uva.onlinejudge.org/"+iframeURL,id);
}
function loadInfo(url,id){
	if($(id).hasClass("active") == false){

		$(".list-group-item.active").removeClass("active");
		$(id).addClass("active");
		request(url, function(error, response, html){
			if(!error){
				$("#mainView").empty();
				var Dm = cheerio.load(html);
				newHTML = Dm("body").html();
				console.log(newHTML);
				$("#mainView").append(newHTML);
			}else{
				toastr.error("Couldn't load info");
			}
		});
	}
}
function loadEVERYTHING(){
//Might Accidently DDos UVa if used. so be careful.
	for(var x = 35; x <= 50; x++){
		addProblem(("https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&category=3&page=show_problem&problem=" + x).toString());
	}
}
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
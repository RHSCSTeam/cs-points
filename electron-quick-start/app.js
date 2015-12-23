var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var toastr = require("toastr"); 
var output = '';
var child;
//https://docs.google.com/forms/d/1G71c5d93HVMulv3gmBKC_EAHYvH_cbJC62Xl07csuoA/viewform?entry.1100317659=NAME&entry.445550013=PROBLEMNAME&entry.1833306606=PROBLEMURL&entry.1141395298
var addedProblems = [];
if(process.platform == "darwin"){
	$(".macNav").addClass("mac");
}
if(localStorage.getItem("addedProblems") != null){
	var x = localStorage.getItem("addedProblems");
	addedProblems = x.split(",");
	for(i=0;i<=addedProblems.length;i++){
		$("#added").append(addedProblems[i]);
	}

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
				var appen = '<button type="button" class="list-group-item" id="'+id+'" name="'+name+'"time="'+time+'" url="'+url+'" iframeURL='+iframeURL+' resultsURL="'+resultsURL+'"onclick="viewProblem('+paramId+')">'+name+'</button>';
				
				console.log(name,time);
				if(name == "Display #" && time == ""){
					toastr.error("Invalid Page");
				}else{
					$("#added").append(appen);
					addedProblems.push(appen);
					localStorage.setItem("addedProblems",addedProblems.toString());
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
		if(sessionStorage.getItem(id) == null){
			$(".list-group-item.active").removeClass("active");
			$(id).addClass("active");
			$("#mainView").empty().append("Loading");
			request(url, function(error, response, html){
				if(!error){
					$("#mainView").empty();
					var Dm = cheerio.load(html);
					Dm("img").each(function(i,elem){
						x = Dm(this).attr("src");
						Dm(this).attr("src",url.substring(0,39)+ x);
					});
					newHTML = Dm("body").html();
					if(newHTML === null){
						
						$("#mainView").append('<h2>Unable to get details. Go to the site via another a browser</h2><p>Link: '+url+'</p>');
						sessionStorage.setItem(id,'<h2>Unable to get details. Go to the site via another a browser</h2><p>Link: '+url+'</p>');
					}else{
						$("#mainView").append(newHTML);
						sessionStorage.setItem(id,newHTML);
					}
				}else{
					toastr.error("Couldn't load info");
				}
			});
		}else{
			$("#mainView").empty();
			$(".list-group-item.active").removeClass("active");
			$(id).addClass("active");
			$("#mainView").append(sessionStorage.getItem(id));
		}
	}
}
function loadEVERYTHING(){
//Might Accidently DDos UVa if used. so be careful.
	for(var x = 1; x <= 1000; x++){
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
function solvedSolution(name,problemName,problemURL){
	//google forms response
	url = 'https://docs.google.com/forms/d/1G71c5d93HVMulv3gmBKC_EAHYvH_cbJC62Xl07csuoA/formResponse?entry.1100317659='+name+'&entry.445550013='+problemName+'&entry.1833306606='+problemURL+'&entry.1141395298';
	request.post(url, function(error, response, html){
		if(!error){
			toastr.success("Problem Solved");
			console.log(response);
		}else{
			toastr.error("Error");
		}
	});
}
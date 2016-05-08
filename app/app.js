if (process.platform == "darwin") {
    $(".macNav").addClass("mac");
}
var addedProblems = [];
if (localStorage.getItem("addedProblems") != null) {
    var x = localStorage.getItem("addedProblems");
    addedProblems = x.split(",");
    for (i = 0; i <= addedProblems.length; i++) {
        $("#added").append(addedProblems[i]);
    }

}
var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var toastr = require("toastr");
var querystring = require('querystring');
var remote = require('remote');
var dialog = remote.require('dialog');
var path = require('path');
var output = '';
var child;
var username;
var GoogleSpreadsheet = require("google-spreadsheet");

var done = [];
//https://docs.google.com/forms/d/1G71c5d93HVMulv3gmBKC_EAHYvH_cbJC62Xl07csuoA/viewform?entry.1100317659=NAME&entry.445550013=PROBLEMNAME&entry.1833306606=PROBLEMURL&entry.1141395298


if (localStorage.getItem("username") != null) {
    username = localStorage.getItem("username");
} else {
    window.location.replace("signin.html");
}
var my_sheet = new GoogleSpreadsheet('1zivhDkTjW1Wj8qGf05ZUpdeLalhbEWJDuUusUy9rNAg');
my_sheet.getRows(1, function(err, row_data) {
    for (i = 1; i <= row_data.length; i++) {
        if (row_data[i] !== undefined) {
            addProblem(row_data[i].featuredproblems);
        }
    }
});
if (localStorage.getItem("doneProblems") != null) {
    done = localStorage.getItem("doneProblems").split(",");
}

function execTerminal(command, dir,filename,output,id) {
    child = exec(command,{cwd:dir}, function(error, stdout, stderr) {
      $("#terminal").append("> " + 'java ' + filename + '<br><br>');
      console.log("Theoretical: " + stdout.toString().replace(/\s/g, '').trim());
      console.log("Actual: " + output.replace(/\s/g, '').trim())
      if (error !== null) {
          toastr.error('exec error: ' + error);
          console.log('exec error: ' + error);
          $("#terminal").append(error);
      } else {
          $("#terminal").append(stdout);
          if (stdout.toString().replace(/\s/g, '').trim() == output.replace(/\s/g, '').trim()) {
              toastr.success("Congrats, You successfully solved the program! +1 Point");
              $("#run").hide();
              var toDel = $('#' + id).text();
              $('#' + id).hide();
              $('#mainView').empty();
              $('#submitAnswer').modal("hide");
              var check;
              for (i = 0; i <= addedProblems.length; i++) {
                  check = cheerio.load(addedProblems[i].toString());
                  if (check("button").text() == toDel.toString()) {
                      done.push(check("button").text());
                      addedProblems.remove(i);
                  }

              }
              localStorage.setItem("addedProblems", addedProblems.toString());
              localStorage.setItem("doneProblems", done.toString());
              solvedSolution(username, name, url);
          } else {
              toastr.error("Output didn't match expected output. Make sure it matches the format perfectly!");
          }
      }
      $("#run").button('reset');
    });
}

function addProblem(override) {
    url = document.getElementById("url").value;
    if (override != '') {
        url = override;
    }
    if (url.search("uva.onlinejudge") == -1) {
        toastr.error("Invalid URL");
    } else {
        request(url, function(error, response, html) {
            if (!error) {
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
                var cancel = false;
                for (i = 0; i <= done.length; i++) {
                    if (done[i] == name) {
                        if (override == '') {
                            toastr.error("You already solved this problem");
                        }
                        cancel = true;
                    }
                }
                if (!cancel) {
                    var id = makeid();
                    paramId = "'" + id + "'";
                    var appen = '<button type="button" class="list-group-item" id="' + id + '" name="' + name + '"time="' + time + '" url="' + url + '" iframeURL=' + iframeURL + ' resultsURL="' + resultsURL + '"onclick="viewProblem(' + paramId + ')">' + name + '</button>';

                    if (name == "Display #" && time == "") {q
                        toastr.error("Invalid Page");
                    } else if (override != '') {
                        $("#recommended").append(appen);
                    } else {
                        $("#added").append(appen);
                        addedProblems.push(appen);
                        localStorage.setItem("addedProblems", addedProblems.toString());
                    }
                }
            } else {
                toastr.error("Couldn't load URL");
            }
        });
    }
}

function viewProblem(id) {
    id = '#' + id;
    var name = $(id).attr("name");
    var time = $(id).attr("time");
    var url = $(id).attr("url");
    var iframeURL = $(id).attr("iframeURL");
    var resultsURL = $(id).attr("resultsURL");
    $("#title").text(name);
    $('#timelimit').text(time);
    $('#link').attr("href", url);

    loadInfo("https://uva.onlinejudge.org/" + iframeURL, id);
}
function logOut(){
  a = confirm("Are you sure you want to logOut. All local data will be erased.");
  if(a){
    localStorage.clear();
    window.location = "signin.html";
  }
}
function loadInfo(url, id) {
    if ($(id).hasClass("active") === false) {
        if (sessionStorage.getItem(id) === null) {
            $(".list-group-item.active").removeClass("active");
            $(id).addClass("active");
            $("#mainView").empty().append("Loading");
            request(url, function(error, response, html) {
                if (!error) {
                    $("#mainView").empty();
                    var Dm = cheerio.load(html);
                    Dm("img").each(function(i, elem) {
                        x = Dm(this).attr("src");
                        Dm(this).attr("src", url.substring(0, 39) + x);
                    });
                    newHTML = Dm("body").html();
                    if (newHTML === null) {
                        $("#mainView").append('<button class="btn btn-primary btn-block" id="readyToSubmit" openProblem="' + id.substring(1, id.length) + '" style="margin-top:10px;" data-toggle="modal" data-target="#submitAnswer" onclick="$(\'#run\').show();">Submit your solution</button>');
                        $("#mainView").append('<h2>Unable to get details. Go to the site via another a browser</h2><p>Link: ' + url + '</p>');
                        sessionStorage.setItem(id, '<h2>Unable to get details. Go to the site via another a browser</h2><p>Link: ' + url + '</p>');
                    } else {
                        $("#mainView").append('<button class="btn btn-primary btn-block" id="readyToSubmit" openProblem="' + id.substring(1, id.length) + '" style="margin-top:10px;" data-toggle="modal" data-target="#submitAnswer" onclick="$(\'#run\').show();">Submit your solution</button>');
                        $("#mainView").append(newHTML);
                        sessionStorage.setItem(id, newHTML);
                    }
                } else {
                    toastr.error("Couldn't load info");
                }
            });
        } else {
            $("#mainView").empty();
            $(".list-group-item.active").removeClass("active");
            $(id).addClass("active");
            $("#mainView").append('<button class="btn btn-primary btn-block" id="readyToSubmit" openProblem="' + id.substring(1, id.length) + '" style="margin-top:10px;" data-toggle="modal" data-target="#submitAnswer" onclick="$(\'#run\').show();">Submit your solution</button>');

            $("#mainView").append(sessionStorage.getItem(id));
        }
    }
}


function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function solvedSolution(name, problemName, problemURL) {
    //google forms response
    url = 'https://docs.google.com/forms/d/1G71c5d93HVMulv3gmBKC_EAHYvH_cbJC62Xl07csuoA/formResponse?entry.1100317659=' + encodeURIComponent(name) + '&entry.445550013=' + encodeURIComponent(problemName) + '&entry.1833306606=' + encodeURIComponent(problemURL) + '&entry.1141395298';
    request.post(url, function(error, response, html) {
        if (!error) {
            toastr.success("Problem Solved");
        } else {
            toastr.error("Error");
        }
    });
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function openFile() {
    $("#terminal").empty();
    $("#run").button("loading");

    var id = $("#readyToSubmit").attr("openProblem");
    var name = $("#" + id).attr("name");
    var url = $("#" + id).attr("url");
    var resultsURL = $("#" + id).attr("name").split("-");
    resultsURL = "https://www.udebug.com/UVa/" + resultsURL[0].trim();
    request(resultsURL, function(error, response, html) {
        if (!error) {
            $("#terminal").append("> " + 'Setting up HTTP request...<br>');
            var DOM = cheerio.load(html);
            problem_nid = DOM("input[name='problem_nid']").attr("value");
            form_build_id = DOM("input[name='form_build_id']").attr("value");
            form_id = DOM("input[name='form_id']").attr("value");
            var random_id = DOM(".input_desc").attr("data-id");
            var random_data;
            var formData;
            var input;
            var output;
            console.log("random_id: " + random_id);
            request.post({url: "https://www.udebug.com/get-selected-input/", formData: {"nid":random_id}}, function(error, response, html) {
                if (!error) {
                    random_data = encodeURIComponent(html).replace(/%20/g, ' ').replace(/%22/g, '').replace(/%5Cr/g, ' ').replace(/%5Cn/g, ' ').replace(/!/g, ' ');;
                } else {
                    toastr.error("Error");
                }

                $("#terminal").append("> " + 'Getting random input...<br>');
                request.post({
                  url:resultsURL,
                  headers:{
                    "Content-Type": "application/x-www-form-urlencoded"
                  },
                  form:{
                    "problem_nid": problem_nid,
                    "input_data": random_data,
                    "node_nid":"",
                    "user_output":"",
                    "form_id":"udebug_custom_problem_view_input_output_form"
                  }
                }, function(err, res, body) {
                    $("#terminal").append("> " + 'Getting corresponding output...<br>');
                    var Out = cheerio.load(body);
                    input = Out("#edit-input-data").text();
                    output = Out("#edit-output-data").text();
                    console.log("in: " + input);
                    console.log("out: " + output);
                    dialog.showOpenDialog(function(filePath) {
                        var tmp;
                        var fp;
                        var index;
                        var filename;
                        console.log(filePath);

                        if (process.platform === "win32") {
                            filePath[0].replace("/", "\\");
                            index = filePath[0].lastIndexOf("\\");
                            fp = filePath[0].substring(0, index);
                            filename = filePath[0].substring(index + 1, filePath[0].length - 6);
                            tmp = "\\TestCases.txt";
                        } else {
                            index = filePath[0].lastIndexOf("/");
                            fp = filePath[0].substring(0, index);
                            filename = filePath[0].substring(index + 1, filePath[0].length - 6);
                            tmp = "/TestCases.txt";
                        }
                        console.log(filename,fp);

                        fs.writeFile(fp + tmp, input, function(err) {
                            if (err) {
                                console.log(err);
                                toastr.error(err);
                            }
                            $("#terminal").append("> " + 'Writing TestCases.txt...<br>');
                            var cmmnd = "java " + filename + " < TestCases.txt";
                            execTerminal(cmmnd, fp,filename,output,id);
                        });
                    });
                });
            });


        } else {
            toastr.error("Error");
        }
    });


}

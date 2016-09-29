if (process.platform == "darwin") {
    $(".macNav").addClass("mac");
    $("#hideIfMac").empty();
}
var addedProblems = [];
var added_problems = {};
var featured_problems = {};

// if (localStorage.getItem("addedProblems") != null) {
//     var x = localStorage.getItem("addedProblems");
//     addedProblems = x.split(",");
//     for (i = 0; i <= addedProblems.length; i++) {
//         $("#added").append(addedProblems[i]);
//     }
//
// }
var exec = require('child_process').exec;
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var toastr = require("toastr");
var querystring = require('querystring');
const {dialog} = require('electron').remote
var path = require('path');
var output = '';
var child;
var leaderboard = [null,null,null];
var usr;
var username;
var done = {};
//https://docs.google.com/forms/d/1G71c5d93HVMulv3gmBKC_EAHYvH_cbJC62Xl07csuoA/viewform?entry.1100317659=NAME&entry.445550013=PROBLEMNAME&entry.1833306606=PROBLEMURL&entry.1141395298

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    usr = user;
    console.log(user);
    username = user.displayName;
    $("#profile").text(username);
    $("#cover").fadeOut(250);
    var version = firebase.database().ref('/version');
    version.once('value').then(function(snapshot){
      if(snapshot.val() > window.settings["version"])
        window.location = "invalidversion.html";
    });
    var addedRef = firebase.database().ref('/users/' + usr.uid + "/added_problems");
    addedRef.once('value').then(function(snapshot) {
      for(value in snapshot.val()){
        var tmp = snapshot.val()[value]["url"]
        added_problems[tmp] = firebase.database().ref('/users/' + usr.uid + "/added_problems/" + value);
        console.log(tmp);
        addProblem(tmp, true);
      }
    });
    var doneRef = firebase.database().ref('/users/' + usr.uid + "/solved_problems");
    doneRef.once('value').then(function(snapshot) {
      for(value in snapshot.val()){
        var tmp = snapshot.val()[value]["title"]
        done[tmp] = firebase.database().ref('/users/' + usr.uid + "/solved_problems/" + value);
        console.log(tmp);
        addToDone(tmp);
      }
    });

    doneRef.on('child_removed', function(data) {
      console.log(data);
    });
    var featuredRef = firebase.database().ref('/featured_problems');
    featuredRef.once('value').then(function(snapshot) {
      for(value in snapshot.val()){
        var tmp = snapshot.val()[value]["name"];
        var tmp2 = snapshot.val()[value]["url"];
        featured_problems[tmp] = snapshot.val()[value]["weight"];
        added_problems[tmp2] = firebase.database().ref('/featured_problems/' + value);
        addProblem(tmp2, false);
        console.log(tmp);
      }
    });
    firebase.database().ref().child('/users/' + usr.uid + "/points").once("value").then(function(snapshot) {
      $("#points").text(snapshot.val());
    });
    var feedRef = firebase.database().ref('/solved_problems');
    feedRef.on('child_added', function(data) {
      var d = new Date(data.val()["date"]).toLocaleString();
      addToFeed("<strong>" + data.val()["name"] + "</strong> solved <strong>" + data.val()["title"].trim() + "</strong><span class='pull-right'>" + d + "</span>")
    });


    var usersRef = firebase.database().ref('/users');
    refreshLeaderboard(usersRef);
    usersRef.on('child_removed', function(data) {
      refreshLeaderboard(usersRef);
    });
    usersRef.on('child_changed', function(data) {
      refreshLeaderboard(usersRef);
    });


  } else {
    window.location = "signin.html";
  }
})

// var my_sheet = new GoogleSpreadsheet('1zivhDkTjW1Wj8qGf05ZUpdeLalhbEWJDuUusUy9rNAg');
// my_sheet.getRows(1, function(err, row_data) {
//     for (i = 1; i <= row_data.length; i++) {
//         if (row_data[i] !== undefined) {
//             addProblem(row_data[i].featuredproblems, false);
//         }
//     }
// });
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  }
function refreshLeaderboard(usersRef){
  console.log("called");
  usersRef.orderByChild('points').limitToLast(3).once('value').then(function(data){
    var count = 2;
    data.forEach(function(child){
      leaderboard[count] = child.val();

      if(count == 0){
        $("#leaderboard").show();
        $("#firstPlaceName").text(leaderboard[0]["username"]);
        $("#firstPlacePoints").text(leaderboard[0]["points"] + "pts");
        $("#secondPlaceName").text(leaderboard[1]["username"]);
        $("#secondPlacePoints").text(leaderboard[1]["points"] + "pts");
        $("#thirdPlaceName").text(leaderboard[2]["username"]);
        $("#thirdPlacePoints").text(leaderboard[2]["points"] + "pts");
      }else{
        $("#leaderboard").hide();
      }
      count--;
    });
  });
}

function execTerminal(command, dir,filename,output,id) {
    var startTime = Date.now() / 1000;
    child = exec(command,{cwd:dir}, function(error, stdout, stderr) {
      $("#terminal").append("> " + command);
      console.log("stderr: " + stderr.toString());
      console.log("Theoretical: " + stdout.toString().replace(/\s/g, '').trim());
      console.log("Actual: " + output.replace(/\s/g, '').trim())
      if (error !== null) {
          toastr.error('exec error: ' + error);
          console.log('exec error: ' + error);
          $("#terminal").append(error);
      } else {
          $("#terminal").append(stdout);
          if (stdout.toString().replace(/\s/g, '').trim() == output.replace(/\s/g, '').trim()) {
              toastr.success("Congrats, You successfully solved the program!");
              toastr.success("Runtime: "+ ((Date.now() / 1000) - startTime) + " seconds.");
              $("#run").hide();
              var toDel = $('#' + id).text();
              $('#' + id).hide();
              $('#mainView').empty();
              $('#submitAnswer').modal("hide");
              var check;
              for (i = 0; i < addedProblems.length; i++) {
                  check = cheerio.load(addedProblems[i].toString());
                  console.log(check("button").attr("name"), toDel.toString());
                  if (check("button").text() == toDel.toString()) {
                      if(!(featured_problems[check("button").attr("name")])){
                        addedProblems.remove(i);
                      }
                      console.log(added_problems, check("button").attr("url"));
                      added_problems[check("button").attr("url")].remove();
                      solvedSolution(check("button").attr("name"), check("button").attr("url"));
                      addToDone(check("button").attr("name"));
                      new Audio("pop.mp3").play()
                  }

              }
          } else {
              toastr.error("Output didn't match expected output. Make sure it matches the format perfectly!");
              fs.writeFile(dir + "TestCases.txt", "", function(err) {
                  if (err) {
                      console.log(err);
                      toastr.error("Error clearing TestCases.txt");
                  }
              });
          }
      }
      $("#run").button('reset');
    });
}
function changeView(view){
  $("#main").hide();
  $("#mainNav").removeClass("active");
  $("#solved").hide();
  $("#solvedNav").removeClass("active");
  if(view == "solved"){
    $("#solved").show();
    $("#solvedNav").addClass("active");
  }else if(view == "main"){
    $("#main").show();
    $("#mainNav").addClass("active");
  }
}
function addToDone(name){
  var appen = '<button type="button" class="list-group-item">' + name + '</button>';
  $("#solved_probs").prepend(appen);
}
function addToFeed(name){
  var appen = '<button type="button" class="list-group-item">' + name + '</button>';
  $("#solved_feed").prepend(appen);
}
function addProblem(override, doit) {
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
                for (val in done) {
                  console.log(val)
                    if (val == name) {
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
                    if(featured_problems[name.trim()]){
                      var appen = '<button type="button" class="list-group-item" id="' + id + '" name="' + name + '"time="' + time + '" url="' + url + '" iframeURL=' + iframeURL + ' resultsURL="' + resultsURL + '"onclick="viewProblem(' + paramId + ')">' + name + '<span class="badge">'+featured_problems[name.trim()]+' point(s)</span></button>';
                    }
                    if(override == ""){
                      addNewProblem(usr.uid, name, url);
                    }
                    if (name == "Display #" && time == "") {q
                        toastr.error("Invalid Page");
                    } else if (override != '' && !(doit)) {
                        addedProblems.push(appen);
                        $("#recommended").append(appen);
                    } else {
                        addedProblems.push(appen);
                        $("#added").append(appen);
                        localStorage.setItem("addedProblems", addedProblems.toString());
                    }
                }
            } else {
                toastr.error("Couldn't load URL");
            }
        });
    }
}
function addNewProblem(uid, name, url) {
  // A post entry.
  var postData = {
    uid: usr.uid,
    title: name,
    url: url
  };

  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;
  var ref = firebase.database().ref('/users/' + uid + '/added_problems/' + newPostKey);
  added_problems[url] = ref;
  return ref.set(postData);
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
    $('#linkContainer').empty().append("<a href='#' id='link' onclick='window.open(\""+url+"\");'>View link in browser</a>")

    loadInfo("https://uva.onlinejudge.org/" + iframeURL, id);
}
function logOut(){
  a = confirm("Are you sure you want to log out. ");
  if(a){
    firebase.auth().signOut().then(function() {
      localStorage.clear();
      window.location = "signin.html";
    }, function(error) {
      toastr.error(error);
    });
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

function solvedSolution(problemName, problemURL) {
    // A post entry.
    var add = 1;
    if(featured_problems[problemName.trim()]){
      add = featured_problems[problemName.trim()];
      toastr.success("+" + add);
    }
    var postData = {
      uid: usr.uid,
      title: problemName,
      name: usr.displayName,
      url: problemURL,
      date: new Date().toString()
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('solved_problems').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/users/' + usr.uid + '/solved_problems/' + newPostKey] = postData;
    firebase.database().ref().child('/users/' + usr.uid + "/points").once("value").then(function(snapshot) {
      add += snapshot.val();
      $("#points").text(add);
      updates['/users/' + usr.uid + '/points'] = add;
      updates['/solved_problems/' + newPostKey] = postData;

      return firebase.database().ref().update(updates);
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
                console.log(html);
                if (!error) {
                    random_data = JSON.parse(html)["input_value"];
                } else {
                    toastr.error("Error");
                }
                var payload = {
                  "problem_nid":problem_nid,
                  "input_data":random_data,
                  "node_nid":"",
                  "user_output":"",
                  "form_id":"udebug_custom_problem_view_input_output_form"
                }
                var formData = querystring.stringify(payload);
                var contentLength = formData.length;
                $("#terminal").append("> " + 'Getting random input...<br>');
                request.post({
                  url:resultsURL,
                  headers: {
                    'Content-Length': contentLength,
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body:formData
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
                            filename = filePath[0].substring(index + 1, filePath[0].length - 5);
                            tmp = "\\TestCases.txt";
                        } else {
                            index = filePath[0].lastIndexOf("/");
                            fp = filePath[0].substring(0, index);
                            filename = filePath[0].substring(index + 1, filePath[0].length - 5);
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
function KeyDownFn(evt) {
if (evt.keyCode == 73 && evt.ctrlKey && evt.shiftKey) evt.preventDefault();
}
function stressTest(){
  for(x = 36; x<50; x++){
    addProblem("https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&category=3&page=show_problem&problem=" + x, true);
  }
}

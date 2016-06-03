function updateClock(){
  var currentTime = new Date(),
    currentHours = currentTime.getHours(),
    currentMinutes = ('0'+currentTime.getMinutes()).slice(-2);
  document.getElementById("clock").innerHTML = currentHours + ':' + currentMinutes;
}

updateClock();
var intervalID = window.setInterval(updateClock, 10000);

function ajax(requestType, requestUrl, data, headers, successCb) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 ) {
      if (xmlhttp.status == 200 && typeof successCb == 'function')
        successCb(xmlhttp);
      else
        console.log('Error: '+xmlhttp.status);
    }
  }
  xmlhttp.open(requestType, requestUrl, true);
  for (key in headers)
    xmlhttp.setRequestHeader(key, headers[key]);
  if (data) {
    var dataToSend = [];
    if (typeof data == 'object') {
      for (var i in data)
        dataToSend.push(i+'='+encodeURIComponent(data[i]));
      dataToSend = dataToSend.join('&');
    }
    else
      dataToSend = data;
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send(dataToSend);
  }
  else
    xmlhttp.send();
}

(function() {
  var heights = [],
    sections = document.querySelectorAll('section');
  for (var i = 0; i < sections.length; i++)
    heights.push(sections[i].clientHeight);
  var maxHeight = Math.max.apply(null, heights);
  document.getElementById('wrap').style.height = maxHeight+'px';

  chrome.bookmarks.getTree(function(results) {
    results[0].children.forEach(function(dir) {
      if (dir.title && dir.title == 'Bookmarks Bar') {
        var html = '';
        dir.children.forEach(function(bookmark) {
          html += '<li><a href="'+bookmark.url+'">'+bookmark.title+'</a></li>';
        });
        document.getElementById('bookmarks').innerHTML = html;
        return;
      }
    });
  });

  var doneRequests = {}, pulls = [];

  var showPulls = function(skipCheck) {
    if (!skipCheck) {
      for (var repo in doneRequests)
        if (!doneRequests[repo])
          return;
    }
    if (!localStorage.getItem('prsMarkup') || Date.now() - 7200000 > localStorage.getItem('prsTimeChecked')) {
      localStorage.setItem('prsTimeChecked', Date.now());
      localStorage.setItem('prsMarkup', pulls.join(''));
      pulls = pulls.join('');
    } else
      pulls = localStorage.getItem('prsMarkup');
    document.getElementById('pull-requests').innerHTML = pulls;
  };

  var parsePulls = function(r, type) {
    if (doneRequests[type])
      return;
    doneRequests[type] = true;
    var result = JSON.parse(r.response), html = '';
    for (var i = 0; i < result.length; i++) {
      var pull = result[i];
      if (pull.state == 'open' && pull.user.login == '{{github-username}}') {
        if (html == '')
          html = '<ul><h2><a href="https://github.com/{{github-org}}/'+type+'">'+type+'</a></h2>';
        html += '<li><a href="'+pull.html_url+'?w=1">'+pull.title+'</a>:&nbsp;&nbsp;<code>'+pull.head.ref+'</code></li>';
      }
    }
    html += (html == '' ? '' : '</ul>');
    pulls.push(html);
    showPulls();
  };

  var lastRepoCount = 0,
    allRepos = [];

  var parseRepos = function() {
    allRepos.forEach(function(repoName) {
      ajax('GET', 'https://api.github.com/repos/{{github-org}}/'+repoName+'/pulls', false, {Authorization: 'token {{github-oauth-token}}'}, function(r) {
        parsePulls(r, repoName);
      });
    });
  };

  var getAllPrs = function(page) {
    if (Date.now() - 7200000 <= localStorage.getItem('prsTimeChecked'))
      return showPulls(true);
    if (lastRepoCount > 0 && lastRepoCount % 100 !== 0)
      return parseRepos();
    ajax('GET', 'https://api.github.com/orgs/{{github-org}}/repos?per_page=100&page='+page, false, {Authorization: 'token {{github-oauth-token}}'}, function(r) {
      var repos = JSON.parse(r.response);
      lastRepoCount = repos.length;
      repos.forEach(function(repo) {
        if (repo.open_issues_count === 0)
          return;
        doneRequests[repo.name] = false;
        allRepos.push(repo.name);
      });
      getAllPrs(page + 1);
    });
  };

  getAllPrs(1);

  document.getElementById('refresh-prs-btn').onclick = function() {
    localStorage.setItem('prsTimeChecked', 0);
    localStorage.setItem('prsMarkup', '');
    window.location.reload();
  };
}());

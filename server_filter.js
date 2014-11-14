var form = "<form id='filter_form'>\
<div class='filter_region'>\
  <input type='checkbox' name='DE' id='filter_de'><label for='filter_de'>DE</label>\
  <input type='checkbox' name='FR' id='filter_fr'><label for='filter_fr'>FR</label>\
  <input type='checkbox' name='UK' id='filter_uk'><label for='filter_uk'>UK</label>\
  <input type='checkbox' name='US' id='filter_us'><label for='filter_us'>US</label>\
</div>\
<div class='filter_type'>\
  <input type='checkbox' name='Regular' id='filter_regular'><label for='filter_regular'>Regular</label>\
  <input type='checkbox' name='Hardcore' id='filter_hardcore'><label for='filter_hardcore'>Hardcore</label>\
  <input type='checkbox' name='Ranked' id='filter_ranked'><label for='filter_ranked'>Ranked</label>\
  <input type='checkbox' name='Ghost Hotel' id='filter_ghost_hotel'><label for='filter_ghost_hotel'>Ghost Hotel</label>\
</div>\
</form> ";

$("div#wrapper").prepend(form);

function filter() {
  var region = [];
  var type = [];

  $("form#filter_form div.filter_region input").each(function(){
    var key = $(this).attr("name");

    if (this.checked) {
      $("div.status_wrapper:contains('" + key + "')").each(function(i, e){
        region.push(e);
      });
    }
  });

  $("form#filter_form div.filter_type input").each(function(){
    var key = $(this).attr("name");

    if (this.checked) {
      $("div.status_wrapper:contains('" + key + "')").each(function(i, e){
        type.push(e);
      });
    }
  });

  var shown = region.filter(function(n) {
    return type.indexOf(n) != -1
  });

  $("div.status_wrapper").hide();

  shown.forEach(function (e){
    $(e).show();
  });
}

// Save the checked filters to local storage
$("form#filter_form input").change(function () {
  var key = $(this).attr("name");

  if (this.checked) {
    var obj = {};
    obj[key] = true

    chrome.storage.local.set(obj);
  } else {
    chrome.storage.local.remove(key);
  }

  filter();
});

// Cache server names and populate offline servers
$("div.status_wrapper").each(function(){
  var element = $(this);
  var server_name = element.find("div.server_name").html();
  var server_ip = element.find("div.server_ip").html();
  var server_status = element.find("div.server_status span").html().trim();

  if (server_status === "OFFLINE") {
    chrome.storage.local.get(server_ip, function(res){
      element.find("div.server_name").html(res[server_ip]);
    });
  } else {
    var obj = {};
    obj[server_ip] = server_name;
    chrome.storage.local.set(obj);
  }
});

// Fade out servers which have just started or is getting close to full
$("div.status_wrapper").each(function(){
  var element = $(this);
  var server_status = element.find("div.server_status span").html().trim();

  if (server_status === "GAME IN PROGRESS" || server_status === "SERVER OPEN") {
    var players = element.find("div.server_players").html().replace(/&nbsp;/g, '');
    var current_players = players.split("/")[0];
    var max_players = players.split("/")[1];
    var progress = (max_players - current_players) / max_players;

    if (progress < 0.2) progress = 0.2;

    element.css("opacity", progress);
  }
});

// Get the checked filters from local storage and check the checkbox
chrome.storage.local.get(null, function(res){
  for (var key in res) {
    $("form#filter_form input[name='" + key + "'").click();
  }
});

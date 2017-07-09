$(document).ready(function() {

  var Model = [
    {
      "name": "Bella's Bar and Grill",
      "id": "4b5fb874f964a520dfc929e3"
    },
    {
      "name": "Bourbon Pub",
      "id": "53e1a180498e17de4b64a70f"
    },
    {
      "name": "Vahl's Restaurant & Cocktail",
      "id": "4f329e6919836c91c7e95c55"
    },
    {
      "name": "Bogart's Lounge & Tech Pub",
      "id": "4ba6bbf0f964a5202b6c39e3"
    },
    {
      "name": "Bennigan's of Santa Clara",
      "id": "40bd1880f964a520c1001fe3"
    },
    {
      "name": "SmokeEaters",
      "id": "51f09509498e68343017e3e9"
    },
    {
      "name": "Faultline Brewing Company",
      "id": "40958b80f964a520e8f21ee3"
    },
    {
      "name": "KnockOut Sports Bar & Grill",
      "id": "5679b2bb498ed9939fc7dc11"
    },
    {
      "name": "The Office Bar & Grill",
      "id": "4ca4ecc897c8a1cde15662a5"
    },
    {
      "name": "Quarter Note Bar",
      "id": "4b65225df964a520b5e52ae3"
    }
  ];

  var viewModel = function() {

    var self = this;

    self.allPlaces = ko.observableArray();
    self.filter = ko.observable("");


    // initialize map
    var map = initMap();

    self.map = ko.observable(map);

    // gather info of model and place markers/info
    initFoursquare(self.allPlaces, self.map());

    // manipulate info/marker display from user search entry
    self.searchUpdate = ko.computed(function() {
      return ko.utils.arrayFilter(self.allPlaces(), function(item) {
        // filter marker to appear based on user input
        if (item.name.toLowerCase().indexOf(self.filter().toLowerCase()) > -1) {
          if (item.marker)
            item.marker.setMap(map);
        } else {
          if (item.marker)
            item.marker.setMap(null);
        }
        // filter list based on user input
        return item.name.toLowerCase().indexOf(self.filter().toLowerCase()) > -1;
      });
    }, self);

    self.onClick = function(item) {
      mainPlace(item, self.map());
    };
  };

    // methods
    function initMap() {
      var startingPos = {lat: 37.3708905, lng: -121.9675525};
      var mapData = {
        center: startingPos,
        zoom: 12
      };
      return new google.maps.Map(document.getElementById('map-container'), mapData);
    }



    function initFoursquare(allPlaces, map) {
      var url = "";
      var infoWindow = new google.maps.InfoWindow();

      for (var bars in Model) {
        url = "https://api.foursquare.com/v2/venues/" +
          Model[bars].id +
          "?client_id=S5443SP2CFGGGTMRFYB54B4ZDZYKWIFBE0RIFITOSTAQEUYO" +
          "&client_secret=MXIYMGA5TAFG23QI3V4VYIEER4P5DVU4HL0PEIY502URMWE1" +
          "&v=20170702";

        getJSON(url, allPlaces, map, infoWindow);
      }
    }

    function getJSON(url, allPlaces, map, infoWindow) {
        var info = [];

        $.getJSON(url, function(data) {
          if (data.response.venue) {
            var entry = data.response.venue;
            // push search result into locations array
            allPlaces.push(entry);
            // save needed data for google maps into an object
            info = {
              lat: entry.location.lat,
              lng: entry.location.lng,
              name: entry.name,
              address: entry.location.address + ", " +
                       entry.location.city + ", " +
                       entry.location.state + ", " +
                       entry.location.postalCode,
              website: entry.url,
              foursquareSite: entry.canonicalUrl
            };
            // run place markers
            placeMarkers(allPlaces, info, map, infoWindow);
          } else {
            alert("An error occured. Please refresh.");
            return;
          }
        });
    }

  function placeMarkers(allPlaces, info, map, infoWindow) {
    var point = new google.maps.LatLng(info.lat, info.lng);
    var restaurantSite = "";
    var altSite ="Foursquare Page";
    if (info.website) {
      restaurantSite = "Restuarant Website";
    }

    var marker = new google.maps.Marker({
      position: point,
      map: map,
      animation: google.maps.Animation.DROP,
      content: info.name + "<br>" +
               info.address + "<br>" +
               "<a href=" + info.foursquareSite + " target=_blank>" + altSite + "</a>" + "<br>" +
               "<a href=" + info.website + " target=_blank>" + restaurantSite + "</a>"
    });


    allPlaces()[allPlaces().length - 1].marker = marker;

    marker.addListener('click', function() {
      //close opened infoWindows
      infoWindow.setContent(marker.content);
      infoWindow.open(map, marker);
    });
  }

  function mainPlace(item, map) {
    map.setCenter(new google.maps.LatLng(item.location.lat, item.location.lng));
    map.setZoom(14);
  }

  ko.applyBindings(new viewModel());
});

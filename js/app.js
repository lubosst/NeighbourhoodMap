'use strict';
// Global Variables
var map;
//clientID, clientSecret, foursquareVersion - variables with info for foursquare
var clientID = "CDGKZM2PWSNOUQIHFSZ4OZUGJXNRWWBLXTZ0U5MWNX2FEP2E";
var clientSecret = "Q0LVAAUM0D4G3PPLSFZTQLSQUKR2LPRZLEH1DOFXGWEVCPBV";
var foursquareVersion = 20180624;

//lat and lng for map center
var centerLang = 48.148321;
var centerLong = 17.109273;

function AppViewModel() {
    var self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    // This function populates the popUpMessage when the marker is clicked.
    //popUpMessage is populated right on the marker
    //only one popUpMessage is allowed at any given time
    this.populateInfo = function(marker, popUpMessage) {
        if (popUpMessage.marker != marker) {
            popUpMessage.setContent('');
            popUpMessage.marker = marker;
            //console.log('Marker: ' + marker.lat + ' ' + marker.lng );
            this.loadForsquareData(popUpMessage, marker.Lat, marker.Lng);
        }
        this.htmlContent = '<div>' + '<h4 class="pum_title">' + marker.title + '</h4>';
        popUpMessage.open(map, marker);
        popUpMessage.addListener('closeclick', function() {
            popUpMessage.marker = null;
        });
    };

    //This function builds up HTML code for popUpMessage
    this.loadForsquareData = function(popUpMessage, lat, lng) {
        var url = 'https://api.foursquare.com/v2/venues/search?ll=' +
            popUpMessage.marker.lat + ',' + popUpMessage.marker.lng + '&client_id=' + clientID +
            '&client_secret=' + clientSecret + '&query=' + popUpMessage.marker.title +
            '&v=' + foursquareVersion + '&m=foursquare';
        //console.log(url);

        //response JSON is simple, I find all info which I wat to show in popUpMessage
        $.getJSON(url).done(function(marker) {
            var htmlFoursquareContent = "Failed to load data";
            var response = marker.response.venues[0];
            if (response) {
                self.street = response.location.formattedAddress[0];
                self.city = response.location.city;
                self.zip = response.location.postalCode;
                self.country = response.location.formattedAddress[2];
                self.category = response.categories[0].shortName;
                self.lat = response.location.lat;
                self.lng = response.location.lng;

                htmlFoursquareContent =
                '<h5 class="pum_subtitle">(' + self.category +
                ')</h5>' + '<div>' +
                '<h6 class="pum_address_title"> Address: </h6>' +
                '<p class="pum_address">' + self.street + '</p>' +
                '<p class="pum_address">' + self.city + '</p>' +
                '<p class="pum_address">' + self.zip + '</p>' +
                '<p class="pum_address">' + self.country + '</p>' +
                '<p class="pum_address">' + self.lat + ', ' + self.lng +
                '</p>' + '</div>' + '</div>';
            }
            popUpMessage.setContent(self.htmlContent + htmlFoursquareContent);
        }).fail(function() {
            // Send alert
            alert(
                "Unable to load forsquare data, please refresh your page."
            );
        });

    };

    //using this to animate bounce for the markers
    this.bounceMarker = function() {
        self.populateInfo(this, self.viewWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1500);
    };

    initMap(self);

    // appending my locations to a list using data-bind
    // It also serves to make the filter work
    this.locationsFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

var googleError = function googleError() {
    alert(
        'Oops, something went horribly wrong and google maps did not load. World is in chaos, so stay calm and try to refresh the page. ;)'
    );
};

function doTheMagic() {
    ko.applyBindings(new AppViewModel());
}

//initialize map and center map to given coordinates
var initMap = function(self) {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
        center: new google.maps.LatLng(centerLang, centerLong),
        zoom: 12,
    };
    map = new google.maps.Map(mapCanvas, mapOptions);

    // Set InfoWindow
    self.viewWindow = new google.maps.InfoWindow();
    for (var i = 0; i < locations.length; i++) {
        self.markerTitle = locations[i].title;
        self.markerLat = locations[i].lat;
        self.markerLng = locations[i].lng;
        // Google Maps marker setup
        self.marker = new google.maps.Marker({
            map: map,
            position: {
                lat: self.markerLat,
                lng: self.markerLng
            },
            title: self.markerTitle,
            lat: self.markerLat,
            lng: self.markerLng,
            id: i,
            animation: google.maps.Animation.DROP
        });
        self.marker.setMap(map);
        self.markers.push(self.marker);
        self.marker.addListener('click', self.bounceMarker);
    }
};

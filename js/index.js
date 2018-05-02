var app = angular.module('app',[]);

app.controller('appController', ['$scope','$http','$interval', function($scope, $http, $interval){


  $scope.waveform = null; // Waveform object
  $scope.isPlaying = false;

  // Set image on poster
  $scope.thumb = 'https://vfmradio.github.io/img/logo.png';
  // Artist name (default: 'Radio Record')
  $scope.artist = 'Radio VFM';
  // Song name
  $scope.song = '';
  
  // Get track information
  $scope.getTrack = function(){
    $http.get('https://player.vfmradio.ru/status-json.xsl').then(function(response){
      $scope.artist = response.data.icestats.source[0].title;
    });
  }
  
  
  // artwork
  $scope.getArtwork = function(){
    $http.get('https://ws.audioscrobbler.com/2.0/?method=track.search&api_key=8e2a8811033e6a5880786382f2fca772&format=json&', {
                params: {
                    album: $scope.artist.replace(/ *\([^)]*\) */g, "")
                }
            }).then(function(response){
                $scope.thumb = response.data.results.trackmatches.track[0].image[3]['#text'] ? response.data.results.trackmatches.track[0].image[3]['#text'] : 'https://vfmradio.github.io/img/logo.png';

 
    });
  }

  // Play & Pause track
  $scope.play = function(){

    // If track is playing ...
    if (!$scope.isPlaying) {

      // First, get track info
      $scope.getTrack();
      

      // Make audio wave
      $scope.waveform = new Waveform({
        container: document.getElementById("track-wave"),
        interpolate: false
      });

      // Set gradient color
      var ctx = $scope.waveform.context;
      var gradient = ctx.createLinearGradient(0, 0, 0, $scope.waveform.height);
      gradient.addColorStop(0.0, "#666");
      gradient.addColorStop(1.0, "#fff");
      $scope.waveform.innerColor = gradient;

      // Scoping global sound object
      $scope.soundObject = soundManager.createSound({
        id: 'vfm', // Set current track ID
        url: 'http://player.vfmradio.ru/stream.ogg', // Radio stream URL
        autoLoad: false, // It makes no sense to preload an endless stream
        autoPlay: false, // Music is played back after the create object
        volume: 50, // Track volume
        useFastPolling: true, // check documentation...
        useEQData: true, // enable equalizer data
        onload: function(bSuccess) {
          if(!bSuccess) console.error('Audio not loaded!');
        },
        whileplaying: function() {
          // updating waveform data
          $scope.waveform.update({data: $scope.soundObject.eqData.right});
        }
      });

      // Play audio stream
      $scope.soundObject.play();
      $scope.isPlaying = true;

      document.querySelector('#track-wave canvas:first-child').remove();

    } else {
      soundManager.destroySound('vfm');
      $scope.isPlaying = false;
    }
  }

  // Update track info every 10 sec
  $interval(function(){
    $scope.getArtwork();
  },10000);
  
  
  // Update track info every 10 sec
  $interval(function(){
    $scope.getTrack();
  },10000);

}]);

app.run(['$rootScope', function($rootScope){

  // Configuration soundManager
  soundManager.setup({	// initialize player
		url: 'https://archakov.im/uploads/iframes/angular-wave-player/public/swf/',	// SWF path
		flashVersion: 9,	// Flash version
		preferFlash: true,	// Use only flash
		useHighPerformance: true // Flash is given higher priority when positioned within the viewable area of the browser
	});

}]);

 $(document).ready(function(){
        $('.dropdown-toggle').dropdown()
    });
      var map;

      require(["esri/map",
               "esri/layers/FeatureLayer",
               "esri/tasks/QueryTask",
               "esri/tasks/query",
               "esri/symbols/SimpleMarkerSymbol",
               "esri/InfoTemplate",
               "dojo/_base/Color",
               "dojo/dom",
               "dojo/on",
               "dijit/form/DateTextBox",
               "dojo/domReady!"],

        function(Map, FeatureLayer, QueryTask, Query, SimpleMarkerSymbol, InfoTempalte, Color, dom, on,DateTextBox) {
        map = new Map("map", {
          basemap: "dark-gray",  //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
          center: [-118.401341,34.068918], // longitude, latitude
          zoom: 20
        });

    });
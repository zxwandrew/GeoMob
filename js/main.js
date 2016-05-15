 $(document).ready(function() {
   $('.dropdown-toggle').dropdown()
 });
 var map;
 var baseHeatUrl = "http://128.200.216.252:6080/arcgis/rest/services/Hackathon/MobileSignalnfo/FeatureServer/0";
 var routesFeatureUrl = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/1";

 require(["esri/map",
     "esri/layers/FeatureLayer",
     "esri/tasks/QueryTask",
     "esri/tasks/query",
     "esri/InfoTemplate",
     "esri/symbols/SimpleMarkerSymbol",
     "esri/symbols/SimpleLineSymbol",
     "esri/symbols/SimpleFillSymbol",
     "esri/renderers/HeatmapRenderer",
     "esri/geometry/Circle",
     "esri/graphic",
     "esri/dijit/Search",
     "dojo/_base/Color",
     "dojo/dom",
     "dojo/on",
     "dijit/form/DateTextBox",
     "dojo/domReady!"
   ],

   function(Map, FeatureLayer, QueryTask, Query, InfoTemplate,
     SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, HeatmapRenderer,
     Circle, Graphic,
     Search, Color, dom, on, DateTextBox) {

     map = new Map("map", {
       basemap: "streets", //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
       center: [-122.086, 40.01803741], // longitude, latitude THE REAL ONES ARE: -73.8291346, 40.88389
       zoom: 15
     });

     var circleSymb = new SimpleFillSymbol(
       SimpleFillSymbol.STYLE_NULL,
       new SimpleLineSymbol(
         SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
         new Color([105, 105, 105]),
         2
       ), new Color([255, 255, 0, 0.25])
     );

     var search = new Search({
       map: map
     }, "search");
     search.startup();

     var infoTemplate = new InfoTemplate("Attributes",
       "device_id: ${device_id}<br>Time: ${timestamp_}");

     var heatmapFeatureLayerOptions = {
       mode: FeatureLayer.MODE_SNAPSHOT,
       outFields: ["device_id", "timestamp_"],
       infoTemplate: infoTemplate
     };

     //the point featurelayer
     var heatmapFeatureLayer = new FeatureLayer(baseHeatUrl, heatmapFeatureLayerOptions);

     //the polyline FeatureLayer
     var routeLayer = new FeatureLayer(routesFeatureUrl, {
       mode: FeatureLayer.MODE_SNAPSHOT,
       outFields: ["last_edited_date"]
     });

     var heatmapRenderer = new HeatmapRenderer();
     heatmapFeatureLayer.setRenderer(heatmapRenderer);
     map.addLayer(heatmapFeatureLayer);

     map.addLayer(routeLayer);

     map.on("click", clickHandler);

     function clickHandler(evt) {
       console.log("Hi");

       circle = new Circle({
         center: evt.mapPoint,
         geodesic: true,
         radius: 0.1,
         radiusUnit: "esriMiles"
       });

       map.graphics.clear();
       var circleGraphic = new Graphic(circle, circleSymb);
       map.graphics.add(circleGraphic);

       var query = new Query();
       query.geometry = circle;
       query.orderByFields = ["last_edited_date DESC"];
       routeLayer.queryFeatures(query, function(featureset) {
         var allFeats = featureset.features;

         var allTimes = [];
         var dailyAverage = [];

         for (var i = 0; i < allFeats.length; i++) {

         }
       });

       //  var query = new Query();
       //  query.where = "device_id = 493265";
       //  query.orderByFields = ["timestamp_ DESC"];
       //  heatmapFeatureLayer.queryFeatures(query, function(featureset){
       //
       //  });


     }
   });

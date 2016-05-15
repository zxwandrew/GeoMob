 $(document).ready(function() {
   $('.dropdown-toggle').dropdown()
 });
 var map;
 var baseHeatUrl = "http://128.200.216.252:6080/arcgis/rest/services/Hackathon/MobileSignalnfo/FeatureServer/0";

 require(["esri/map",
       "esri/layers/FeatureLayer",
       "esri/tasks/QueryTask",
       "esri/tasks/query",
       "esri/InfoTemplate",
       "esri/symbols/SimpleMarkerSymbol",
       "esri/renderers/HeatmapRenderer",
       "dojo/_base/Color",
       "dojo/dom",
       "dojo/on",
       "dijit/form/DateTextBox",
       "dojo/domReady!"
     ],

     function(Map, FeatureLayer, QueryTask, Query, InfoTemplate, SimpleMarkerSymbol, HeatmapRenderer, Color, dom, on, DateTextBox) {
       map = new Map("map", {
         basemap: "streets", //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
         center: [-73.8291346, 40.88389], // longitude, latitude
         zoom: 18
       });

       var infoTemplate = new InfoTemplate("Attributes",
         "device_id: ${device_id}<br>Time: ${timestamp_}");

       var heatmapFeatureLayerOptions = {
         mode: FeatureLayer.MODE_SNAPSHOT,
         outFields: ["device_id", "timestamp_"],
         infoTemplate: infoTemplate
       };

       var heatmapFeatureLayer = new FeatureLayer(baseHeatUrl, heatmapFeatureLayerOptions);
       var heatmapRenderer = new HeatmapRenderer();
       heatmapFeatureLayer.setRenderer(heatmapRenderer);
       map.addLayer(heatmapFeatureLayer);

       map.on("click", clickHandler);

       function clickHandler(){
         console.log("Hi");

         var query = new Query();
         query.where = "device_id = 493265";
         query.orderByFields = ["timestamp_ DESC"];
         heatmapFeatureLayer.queryFeatures(query, function(featureset){
           
         });


       }
});

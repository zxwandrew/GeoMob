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
         basemap: "dark-gray", //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
         center: [-73.900245, 40.93486], // longitude, latitude
         zoom: 20
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
});

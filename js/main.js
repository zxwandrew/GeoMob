 $(document).ready(function() {
   $('.dropdown-toggle').dropdown()
 });
 var map;
 var baseHeatUrl = "http://128.200.216.252:6080/arcgis/rest/services/Hackathon/MobileSignalnfo/FeatureServer/0";
 var routesFeatureUrl = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/1";
 var allTimes = [];
 var dailyAverage = [];

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
     "dojox/charting/Chart2D",
     "dojox/charting/themes/MiamiNice",
     "dojox/charting/action2d/Highlight", "dojox/charting/action2d/MoveSlice", "dojox/charting/action2d/Tooltip",
     "dojo/_base/Color",
     "dojo/dom",
     "dojo/dom-class",
     "dojo/on",
     "dijit/form/DateTextBox",
     "dojo/domReady!"
   ],

   function(Map, FeatureLayer, QueryTask, Query, InfoTemplate,
     SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, HeatmapRenderer,
     Circle, Graphic,
     Search, Chart2D, dojoxTheme, Highlight, MoveSlice, Tooltip, Color, dom, domClass, on, DateTextBox) {

     map = new Map("map", {
       basemap: "streets-night-vector", //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
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

         allTimes = [];

         for (var i = 0; i < allFeats.length; i++) {
           var nowDate = new Date(allFeats[i].attributes.last_edited_date*1000);
           allTimes.push(nowDate);
         }
         initHistogram();
       });
     }

     function initHistogram(){
        showChart();
          
     }
     function showChart(){
         if($("#histogrampanel").css("display") =="none"){
            $("#histogrampanel").css("display","block");
        }
        else{
             $("#chart").empty();
        }
        
        
        $("#closePanelBtn").click(function(){
            $("#chart").empty();
            if($("#histogrampanel").css("display") =="block"){
                $("#histogrampanel").css("display","none");
            }
        })
            
        
        var chart = new Chart2D($("#chart")[0]);
          domClass.add(chart, "chart");

          // Apply a color theme to the chart.
          chart.setTheme(dojoxTheme);
          // Add the only/default plot
          chart.addPlot("default", {
              type: "Columns",
              markers: true,
              gap: 5
          });
         
         chart.resize(630,160);
         
          // Define the data
          var chartData = [10000,9200,11811,12000,7662,13887,14200];
         
          new Highlight(chart, "default");
          new Tooltip(chart, "default");
          new MoveSlice(chart, "default");
          
          // Add axes
          chart.addAxis("x",{
                  labels: [
                     {value: 0, text: ""},
			         {value: 1, text: "Mon"}, 
			         {value: 2, text: "Tue"},
			         {value: 3, text: "Wed"}, 
			         {value: 4, text: "Thu"},
			         {value: 5, text: "Fri"},
                     {value: 6, text: "Sat"},
                     {value: 7, text: "Sun"} 
                  ]   
          });
          chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });
          
          // Add the series of data
          chart.addSeries("Monthly Sales",chartData);
          
          // Render the chart!
          chart.render();    
         
     }
   });

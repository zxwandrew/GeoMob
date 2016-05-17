 $(document).ready(function() {
   $('.dropdown-toggle').dropdown()
 });
 //http://10.150.92.6:6080/arcgis/rest/services/UCI/HackData/FeatureServer/0
 //http://128.200.216.252:6080/arcgis/rest/services/Hackathon/HackData/FeatureServer/0

 var map;
 var baseHeatUrl = "http://10.150.92.6:6080/arcgis/rest/services/UCI/HackData/FeatureServer/0";
 var routesFeatureUrl = "http://10.150.92.6:6080/arcgis/rest/services/UCI2/HackData/FeatureServer/0";
 var allTimes = [];
 var allDeviceIDs = [];
 var dailyAverage = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
 var dailyAverageComputed = false;

 require(["esri/map",
     "esri/dijit/LayerList",
     "esri/layers/FeatureLayer",
     "esri/tasks/QueryTask",
     "esri/tasks/query",
     "esri/InfoTemplate",
     "esri/symbols/SimpleMarkerSymbol",
     "esri/symbols/SimpleLineSymbol",
     "esri/symbols/SimpleFillSymbol",
     "esri/renderers/HeatmapRenderer",
     "esri/renderers/SimpleRenderer",
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
     "dijit/layout/BorderContainer",
     "dijit/layout/ContentPane",
     "dojo/domReady!"
   ],

   function(Map, LayerList, FeatureLayer, QueryTask, Query, InfoTemplate,
     SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, HeatmapRenderer, SimpleRenderer,
     Circle, Graphic,
     Search, Chart2D, dojoxTheme, Highlight, MoveSlice, Tooltip, Color, dom, domClass, on, DateTextBox) {

     map = new Map("map", {
       basemap: "streets-night-vector", //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
       center: [-73.7761702, 41.0308234], // longitude, latitude THE REAL ONES ARE: -73.8291346, 40.88389 //not real: -122.086, 40.01803741
       zoom: 12
     });

     var circleSymb = new SimpleFillSymbol(
       SimpleFillSymbol.STYLE_SOLID,
       new SimpleLineSymbol(
         SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
         new Color([105, 105, 105]),
         4
       ), new Color([124, 252, 0, 0.5])
     );

     var lineSymb = new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([247, 34, 101, 0.9]),
            1
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

     //the points layer
     var pointsLayer = new FeatureLayer(baseHeatUrl, {mode: FeatureLayer.MODE_SNAPSHOT});


     //the polyline FeatureLayer
     var routeLayer = new FeatureLayer(routesFeatureUrl, {
       mode: FeatureLayer.MODE_SNAPSHOT,
       outFields: ["END_TIME", "Day_", "DeviceID"]
     });

     var heatmapRenderer = new HeatmapRenderer();
     heatmapFeatureLayer.setRenderer(heatmapRenderer);
     map.addLayer(heatmapFeatureLayer);

     routeLayer.setRenderer(new SimpleRenderer(lineSymb));
     map.addLayer(routeLayer);
     map.addLayer(pointsLayer);

     var llWidget = new LayerList({
        map: map,
        showLegend: true,
        layers: [{
            layer: heatmapFeatureLayer,
            showLegend: true,
            id: "HeatMap Layer"
          },{
            layer: routeLayer,
              showLegend: true,
              id: "RoutePath Layer"
          },{
            layer: pointsLayer,
              showLegend: true,
              id: "Points Layer"
          }]
        },"layerList");

        llWidget.startup();

    llWidget.on("load", function() {
      document.getElementsByClassName("esriLabel")[0].innerHTML = "Points Layer";
      document.getElementsByClassName("esriLabel")[1].innerHTML = "Routes Layer";
      document.getElementsByClassName("esriLabel")[2].innerHTML = "HeatMap Layer";
     });


     map.on("click", clickHandler);

     function clickHandler(evt) {
       console.log("Hi");
      $("#spinner").css("display","block");
       circle = new Circle({
         center: evt.mapPoint,
         geodesic: true,
         radius: 0.02,
         radiusUnit: "esriMiles"
       });



       map.graphics.clear();
       var circleGraphic = new Graphic(circle, circleSymb);
       map.graphics.add(circleGraphic);


       map.setLevel(17);
       map.centerAt(evt.mapPoint);

       var query = new Query();
       query.geometry = circle;
       query.orderByFields = ["END_TIME DESC"];
       routeLayer.queryFeatures(query, function(featureset) {

         var allFeats = featureset.features;

         allTimes = [];
         allDeviceIDs = [];

         for (var i = 0; i < allFeats.length; i++) {
           var nowDate = new Date(allFeats[i].attributes.END_TIME*1000);
           allTimes.push(nowDate);
           if(allDeviceIDs.indexOf(allFeats[i].attributes.DeviceID)== -1){
             allDeviceIDs.push(allFeats[i].attributes.DeviceID);
           }
         }
         initHistograms();
       });
     }


     function initHistograms(){
       calcDailyAverage();
       calcPopApp();
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
        });


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

         chart.resize(630, 150);

          // Define the data
          var chartData = dailyAverage;

          new Highlight(chart, "default");
          new Tooltip(chart, "default");
          new MoveSlice(chart, "default");

          chart.addAxis("x", {labels: [
                    {value: 1, text: "1"},
                   {value: 2, text: "2"},
                    {value: 3, text: "3"},
                   {value: 4, text: "4"},
                    {value: 5, text: "5"},
                   {value: 6, text: "6"},
                   {value: 7, text: "7"},
                    {value: 8, text: "8"},
                   {value: 9, text: "9"},
                    {value: 10, text: "10"},
                   {value: 11, text: "11"},
                    {value: 12, text: "12"},
                   {value: 13, text: "13"},
                   {value: 14, text: "14"},
                    {value: 15, text: "15"},
                   {value: 16, text: "16"},
                    {value: 17, text: "17"},
                   {value: 18, text: "18"},
                    {value: 19, text: "19"},
                   {value: 20, text: "20"},
                   {value: 21, text: "21"},
                   {value: 22, text: "22"},
                   {value: 23, text: "23"},
                   {value: 24, text: "24"},
               ]});
          chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });

          // Add the series of data
          chart.addSeries("Monthly Sales",chartData);

          // Render the chart!
          chart.render();
          $("#spinner").css("display","none");

     }

     function calcDailyAverage(){
      //  if(!dailyAverageComputed){
         var dailySum = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
         var uniqueDays = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

         dailyAverageComputed = true;
         console.log(allTimes.length);

         for(var i=0; i<allTimes.length; i++){
           hour = allTimes[i].getHours();
           uniqueDays[hour] = 1;
           dailySum[hour].push(allTimes[i]);
         }
         for(var i=0; i<24; i++){
           for(var j=1; j<dailySum[i].length; j++){ //loop through to get all unique days
             if(dailySum[i][j].getDate() != dailySum[i][j-1].getDate()){
               uniqueDays[i]++;
             }
           }
           if(uniqueDays[i]!==0){
             dailyAverage[i] = dailySum[i].length/uniqueDays[i];
           }else{
             dailyAverage[i] = 0;
           }
         }
      //  }//finished computing daily average for all days at hourly interval
     }

     function calcPopApp(){
       var appDivision = [];
       for(var i=0; i<allDeviceIDs.length; i++){
         var qtask = new QueryTask("http://128.200.216.252:6080/arcgis/rest/services/Hackathon/HackData/FeatureServer/2");
         var q = new Query();
         q.outFields = ["deviceID", "app"];
         q.where = "deviceID = "+allDeviceIDs[i];
         qtask.execute(q, function(res){
           console.log(res);
           appDivision.push(res.features[0].attributes.app);
         });
       }
     }

     function swtichCharts(){
       
     }


   });

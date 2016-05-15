import arcpy
import os 
from arcpy import env

def FetchDeviceIDs(table, column='device_id'):
    with arcpy.da.SearchCursor(table, column, sql_clause=(None, 'ORDER BY {}'.format(column))) as cursor:
        return list(set([row[0] for row in cursor]))
    
def FetchDays(table):
    with arcpy.da.SearchCursor(table, 'day_', sql_clause=(None, 'ORDER BY day_')) as cursor:
        return list(set([row[0] for row in cursor]))

try:
    #Check out the Network Analyst extension license
    arcpy.CheckOutExtension("Network")

    #Set environment settings
    env.workspace = r"C:\Kurama\Dropbox\Hackathon\2015_Release_3\DVD\FGDB\StreetMap_Data\NorthAmerica.gdb"
    env.overwriteOutput = True
    
    table = r'C:\Users\fredd\AppData\Roaming\ESRI\Desktop10.4\ArcCatalog\Connection to kurama.sde\testgdb.SDE.MobileSignal'
    outRoutesFC = r'C:\Users\fredd\Desktop\data.gdb\d{}_{}'
    outRoutesFCtemp = r'C:\Users\fredd\Desktop\data.gdb\sept6'
    layer = arcpy.management.MakeFeatureLayer(table, 'devices')
    
    #Set local variables
    inNetworkDataset = "Routing/Routing_ND"
    outNALayerName = "BestRoute"
    impedanceAttribute = "TravelTime"
    outStops = "Stops"
    
    #Create a new Route layer. For this scenario, the default value for all the
    #remaining parameters statisfies the analysis requirements
    outNALayer = arcpy.na.MakeRouteLayer(inNetworkDataset, outNALayerName,
                                         impedanceAttribute)

    #Get the layer object from the result object. The route layer can now be
    #referenced using the layer object.
    outNALayer = outNALayer.getOutput(0)

    #Get the names of all the sublayers within the route layer.
    subLayerNames = arcpy.na.GetNAClassNames(outNALayer)
    
    #Stores the layer names that we will use later
    stopsLayerName = subLayerNames["Stops"]    
    routesLayerName = subLayerNames["Routes"]    
    
    # Fetch the device ids
    ids = FetchDeviceIDs(table)
    print('Located {} unique Device IDs'.format(len(ids)))
    
    sdi = FetchDeviceIDs(r'C:\Users\fredd\AppData\Roaming\ESRI\Desktop10.4\ArcCatalog\Connection to kurama.sde\testgdb.SDE.MobileWalkPath', 'deviceID')
    
    for ID in ids:
        if str(ID) in sdi:
            continue
        print('Device ID {}'.format(ID))
        
        # Create a table for the records with this device
        arcpy.management.SelectLayerByAttribute(layer, 'NEW_SELECTION', '%s = %s' % ('device_id', ID))
        sort = arcpy.management.Sort(layer, 'in_memory/dsort', [['device_id', 'ASCENDING'], ['timestamp_', 'ASCENDING']])
        
        print('\t...{} records located for device.'.format(arcpy.management.GetCount(sort).getOutput(0)))
        
        # 
        days = FetchDays(sort)
        print('\t...device spans {} days.'.format(len(days)))
        
        for day in days:
            print('\t\t...processing day {}'.format(day))
            
            
            #targetGDB = os.path.join(os.path.dirname(__file__), 'hackdata.gdb')
            #if arcpy.Exists(targetGDB):
            #    arcpy.management.Delete(targetGDB)
            #arcpy.management.CreateFileGDB(*os.path.split(targetGDB))
            #targetFCL = arcpy.management.CreateFeatureclass(targetGDB, 'd{}_day{}'.format(str(ID).zfill(10), str(day).zfill(2)), spatial_reference=arcpy.SpatialReference(4326), geometry_type='POLYLINE')
            targetFCL = r'C:\Users\fredd\AppData\Roaming\ESRI\Desktop10.4\ArcCatalog\Connection to kurama.sde\testgdb.SDE.MobileWalkPath'
            #arcpy.management.DeleteFeatures(targetFCL)
            
            #for field in [['END_TIME', 'DATE'], ['DeviceID', 'TEXT'], ['DAY_', 'INT']]:
            #    arcpy.management.AddField(targetFCL, *field)
                       
            with arcpy.da.SearchCursor(sort, ['OID@', 'day_'], 'day_ = {}'.format(day)) as cursor:
                oid = [str(row[0]) for row in cursor]
                
                cnt = 0
                
                while (len(oid) > 1):
                    cnt += 1
                    sql = 'OBJECTID IN ({})'.format(', '.join(oid[:2]))
                    lyr = arcpy.management.MakeFeatureLayer(sort, 'days', sql)
        
                    arcpy.na.AddLocations(outNALayer, stopsLayerName, lyr, exclude_restricted_elements = "EXCLUDE")
                                   
                    try:
                        arcpy.na.Solve(outNALayer)        
                        
                
                        RoutesSubLayer = arcpy.mapping.ListLayers(outNALayer, routesLayerName)[0]
                                            
                        rout = arcpy.management.CopyFeatures(RoutesSubLayer, 'in_memory\\route')
                        
                        geom = next(arcpy.da.SearchCursor(rout, 'SHAPE@'))[0]
                        print(geom)
                        date = next(arcpy.da.SearchCursor(sort, ['OID@', 'timestamp_'], 'OBJECTID={}'.format(oid[1])))[1]
                        if geom != None:
                            writer = arcpy.da.InsertCursor(targetFCL, ['SHAPE@', 'END_TIME', 'DeviceID', 'Day_']);
                            writer.insertRow((geom, date, ID, day))
                            del writer
                        oid.pop(0)
                        
                    except Exception as e:
                        print(e.message)
                        pass        
    
    
    
    '''
    with arcpy.da.SearchCursor(table, 'device_id', where_clause= "timestamp_ >= '2015-09-06 00:00:00' AND timestamp_ < '2015-09-07 00:00:00'", sql_clause=(None, 'ORDER BY device_id')) as cursor:
        ID = set([row[0] for row in cursor])
        
        print('Located {} unique Device IDs'.format(ID))

        for row in cursor:
            print('Device ID: {}'.format(row[0]))
            
            # Fetch the records for the device id
            arcpy.management.SelectLayerByAttribute(layer, 'NEW_SELECTION', '%s = %s' % ('device_id', row[0]))
            sort = arcpy.management.Sort(layer, 'in_memory/dsort', [['device_id', 'ASCENDING'], ['timestamp_', 'ASCENDING']])
            
            print('\tLocated {} records for device'.format(arcpy.management.GetCount(sort).getOutput(0)))
            
            
            # Fetch the days this id appears
            days = []
            with arcpy.da.SearchCursor(sort, ["day_"], sql_clause=('DISTINCT day_', None)) as dcursor:
                days = [d[0] for d in dcursor]
            print('\tDevice spans {} days'.format(len(days)))
            
            for day in days:
                print('\t\tProcessing day {}'.format(day))
                with arcpy.da.SearchCursor(sort, ["OID@", "day_"], 'day_ = {}'.format(day)) as tcursor:
                    oid = [str(trow[0]) for trow in tcursor]
                    print('\t\t\tDay {} has {} records'.format(day, len(oid)))
                    cnt = 0
                    while len(oid) > 1:
                        cnt += 1
                        sql =  "OBJECTID IN ({})".format(', '.join(oid[:2]))
                        slayer = arcpy.management.MakeFeatureLayer(sort, 'sort_layer', sql)
                
                        arcpy.na.AddLocations(outNALayer, stopsLayerName, slayer, exclude_restricted_elements = "EXCLUDE")
                
                        try:
                            arcpy.na.Solve(outNALayer,"SKIP")        
                            oid.pop(0)
                    
                            RoutesSubLayer = arcpy.mapping.ListLayers(outNALayer, routesLayerName)[0]
                            RoutesSubLayer.setSelectionSet("NEW", [0]);                    
                            arcpy.management.CopyFeatures(RoutesSubLayer, outRoutesFC.format(row[0], cnt))
                        except:
                            pass '''
                                 
            

except Exception as e:
    # If an error occurred, print line number and error message
    import traceback, sys
    tb = sys.exc_info()[2]
    print "An error occured on line %i" % tb.tb_lineno
    print str(e)

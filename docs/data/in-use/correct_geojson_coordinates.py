import json

# Load GeoJSON data from a file
with open('output.geojson', 'r') as infile:
    geo_json_data = json.load(infile)

# Function to correct coordinates
def correct_geojson_coordinates(data):
    for feature in data['features']:
        geometry = feature['geometry']
        
        if geometry['type'] == 'Point':
            geometry['coordinates'] = [
                float(geometry['coordinates'][0]['content']),
                float(geometry['coordinates'][1]['content'])
            ]
        # Handle other geometry types if necessary

# Correct the GeoJSON data
correct_geojson_coordinates(geo_json_data)

# Print the corrected data
print(json.dumps(geo_json_data, indent=2))

# Save the corrected data to a new file
with open('corrected_geojson.json', 'w') as outfile:
    json.dump(geo_json_data, outfile, indent=2)  # Pretty print with indentation
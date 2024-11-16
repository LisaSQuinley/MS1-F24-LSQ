import json

# Load your GeoJSON data from a file
with open('data.geojson', 'r') as f:
    data = json.load(f)

# Remove the 'image' property from each feature
for feature in data['features']:
    if 'image' in feature['properties']:
        del feature['properties']['image']

# Convert the modified data back to a GeoJSON string
modified_geojson = json.dumps(data, indent=2)

# Print the modified GeoJSON
print(modified_geojson)

# Save the modified GeoJSON back to a file
with open('modified.geojson', 'w') as f:
    f.write(modified_geojson)
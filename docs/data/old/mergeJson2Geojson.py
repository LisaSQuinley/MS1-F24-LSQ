import json

# Load the GeoJSON data
try:
    with open('modified.geojson', 'r') as f:
        geojson_data = json.load(f)
except FileNotFoundError:
    print("Error: 'modified.geojson' not found.")
    exit()

# Load the JSON data containing image_content
try:
    with open('filtered.json', 'r') as f:
        images_data = json.load(f)
except FileNotFoundError:
    print("Error: 'filtered.json' not found.")
    exit()

# Create a mapping from id to image_content for quick access
image_mapping = {item['id']: item['image_content'] for item in images_data}

# Merge image_content into the GeoJSON features
for feature in geojson_data['features']:
    nudi_id = feature['properties']['Nudi_id']
    if nudi_id in image_mapping:
        feature['properties']['image_content'] = image_mapping[nudi_id]

# Convert the modified GeoJSON data back to a string
modified_geojson = json.dumps(geojson_data, indent=2)

# Save the modified GeoJSON back to a file
with open('Merged.geojson', 'w') as f:
    f.write(modified_geojson)

# Print a confirmation message
print("Merged GeoJSON saved as 'Merged.geojson'.")

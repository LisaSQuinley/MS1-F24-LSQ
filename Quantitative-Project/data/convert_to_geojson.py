import json

# Load the JSON data from a file
with open('data.json', 'r') as f:
    data = json.load(f)

# Extract coordinates
features = []
for obj in data:
    # Adjust these keys according to your JSON structure
    latitude = obj.get('latitude')
    longitude = obj.get('longitude')
    
    if latitude is not None and longitude is not None:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]  # Note: [lng, lat] order
            },
            "properties": {
                "Nudi_id": obj.get('id'),
                "title": obj.get('title')  # You can include other properties here if needed
        }
        }
        features.append(feature)

# Create the GeoJSON structure
geojson = {
    "type": "FeatureCollection",
    "features": features
}

# Save the GeoJSON data to a file
with open('output.geojson', 'w') as f:
    json.dump(geojson, f, indent=4)

print("GeoJSON file created successfully.")
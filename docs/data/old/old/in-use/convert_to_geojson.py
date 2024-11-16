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
                "title": obj.get('title'),
                "sci_name": obj.get('sci_name'),
                "link": obj.get('link'),  
                "place": obj.get('place'),  
                "depth": obj.get('depth'),   
                "tax_class": obj.get('tax_class'),
                "tax_family": obj.get('tax_family'),
                "tax_kingdom": obj.get('tax_kingdom'),
                "tax_order": obj.get('tax_order'), 
                "tax_phylum": obj.get('tax_phylum'),
                "image": obj.get('image') if obj.get('image') else obj.get('idsId')  
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
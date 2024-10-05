import json

# Assuming you have a GeoJSON file named 'data.geojson'
with open('data.geojson') as f:
    geojson_data = json.load(f)

# Function to convert taxonomy lists to strings, add tax_subclass, and set defaults
def convert_taxonomy_types(data):
    for feature in data['features']:
        properties = feature['properties']
        # Set default for sci_name
        properties['sci_name'] = properties['sci_name'] if properties['sci_name'] is not None else 'No information available'
        # Convert lists to strings
        properties['tax_class'] = properties['tax_class'][0] if properties['tax_class'] else None
        properties['tax_family'] = properties['tax_family'] if properties['tax_family'] is not None else 'No information available'
        properties['tax_kingdom'] = properties['tax_kingdom'][0] if properties['tax_kingdom'] else None
        properties['tax_order'] = properties['tax_order'][0] if properties['tax_order'] else None
        properties['tax_phylum'] = properties['tax_phylum'][0] if properties['tax_phylum'] else None
        
        # Add tax_subclass
        properties['tax_subclass'] = 'Heterobranchia'

# Convert the taxonomy types in the GeoJSON data
convert_taxonomy_types(geojson_data)

with open('modified_data.geojson', 'w') as f:
    json.dump(geojson_data, f, indent=2)

print("Modified GeoJSON data has been written to 'modified_data.geojson'")
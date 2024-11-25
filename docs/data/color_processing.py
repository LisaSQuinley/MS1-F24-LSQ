import webcolors
import json

# Function to find the closest color name
def closest_color(requested_color):
    min_colors = {}
    for name in webcolors.names("css3"):
        r_c, g_c, b_c = webcolors.name_to_rgb(name)
        rd = (r_c - requested_color[0]) ** 2
        gd = (g_c - requested_color[1]) ** 2
        bd = (b_c - requested_color[2]) ** 2
        min_colors[(rd + gd + bd)] = name
    return min_colors[min(min_colors.keys())]

# Function to get the color name from RGB
def get_color_name(rgb_value):
    try:
        return webcolors.rgb_to_name(rgb_value)
    except ValueError:
        return closest_color(rgb_value)

# Load the GeoJSON file
with open('data.geojson', 'r') as f:
    geojson_data = json.load(f)

# Iterate through each feature in the GeoJSON
for feature in geojson_data['features']:
    # Check if the feature has palettes
    if 'palettes' in feature['properties']:
        for palette in feature['properties']['palettes']:
            # Get the color from the swatch
            swatch_rgb = tuple(palette['swatch'])
            # Get the color category (name)
            color_name = get_color_name(swatch_rgb)
            # Add the category to the palette properties
            palette['category'] = color_name

# Save the modified GeoJSON data to a new file
with open('output_with_categories.geojson', 'w') as f:
    json.dump(geojson_data, f, indent=4)

print("GeoJSON processed and saved with color categories.")

import json

# Load the original JSON data
with open('data.json', 'r') as f:
    data = json.load(f)

# Prepare a new list to store the filtered results
filtered_data = []

# Loop through each item in the original data
for item in data:
    # Initialize filtered item
    filtered_item = {
        'id': item.get('id'),
        'sci_name': item.get('sci_name'),
        'title': item.get('title')
    }
    
    # Check if 'image' is a dictionary and extract 'content' if it is
    image_data = item.get('image')
    if isinstance(image_data, dict):  # Check if 'image' is a dict
        filtered_item['image_content'] = image_data.get('content')
    else:
        filtered_item['image_content'] = None  # or set to a default value if necessary

    filtered_data.append(filtered_item)

# Save the filtered results to a new JSON file
with open('filtered.json', 'w') as f:
    json.dump(filtered_data, f, indent=4)

print("Filtered data has been saved to 'filtered.json'.")

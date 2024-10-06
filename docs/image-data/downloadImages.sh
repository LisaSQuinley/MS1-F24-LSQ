#!/bin/bash

# Define your JSON file path
JSON_FILE="/Users/lisasakaiquinley/TNS-F24/Major-Studio-1_F24/MS1-F24-LSQ/docs/filtered.json"
DOWNLOAD_FOLDER="/Users/lisasakaiquinley/TNS-F24/Major-Studio-1_F24/MS1-F24-LSQ/docs/image-data/images"

# Create the download directory if it doesn't exist
mkdir -p "$DOWNLOAD_FOLDER"

# Parse JSON, download images
jq -c '.[] | select(.image_content != null and .id) | {imageUrl: .image_content, id: .id}' "$JSON_FILE" | \
while IFS= read -r item; do
    # Extract the details from the JSON object
    IMAGE_URL=$(echo "$item" | jq -r '.imageUrl')
    ID=$(echo "$item" | jq -r '.id')

    # Create a valid filename using the ID
    FILE_NAME="${ID}.jpg"
    FILE_PATH="$DOWNLOAD_FOLDER/$FILE_NAME"

    # Debug: Show what URL is being downloaded
    echo "Downloading from URL: $IMAGE_URL"

    # Download the image using curl
    curl -L -o "$FILE_PATH" "$IMAGE_URL"

    # Check if the download was successful
    if [[ $? -ne 0 ]]; then
        echo "Failed to download: $IMAGE_URL"
    else
        echo "Downloaded: $FILE_PATH"
    fi
done

#!/bin/bash

# LQIP (Low Quality Image Placeholder) Generator
# Uses ImageMagick to generate lightweight placeholder images
#
# Usage: ./generate-lqip.sh <image_path_or_url> [output_folder]
# Example: ./generate-lqip.sh /path/to/image.jpg
#          ./generate-lqip.sh https://example.com/image.jpg products
#          ./generate-lqip.sh folder/subfolder/image.png

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# LQIP Configuration
LQIP_WIDTH=20        # 20px width (very small for fast loading)
LQIP_QUALITY=30      # Low quality for smaller file size
BLUR_SIGMA=1         # Blur amount
OUTPUT_FORMAT="webp" # Output format (webp for better compression)

# Get script directory for relative paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_BASE_DIR="$SCRIPT_DIR/outputs/lqip"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    print_error "ImageMagick is not installed. Please install it first."
    exit 1
fi

# Use 'magick' command if available (ImageMagick 7+), otherwise 'convert' (ImageMagick 6)
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
else
    CONVERT_CMD="convert"
fi

# Check if image path/URL is provided
if [ -z "$1" ]; then
    print_error "Usage: $0 <image_path_or_url> [output_folder]"
    echo "Example: $0 /path/to/image.jpg"
    echo "         $0 https://example.com/image.jpg products"
    exit 1
fi

INPUT_IMAGE="$1"
CUSTOM_FOLDER="$2"

# Check if input is a URL or local file
IS_URL=false
TEMP_FILE=""

if [[ "$INPUT_IMAGE" =~ ^https?:// ]]; then
    IS_URL=true

    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install it to download images from URLs."
        exit 1
    fi

    print_info "Downloading image from URL..."

    # Extract filename from URL
    URL_FILENAME=$(basename "$INPUT_IMAGE" | sed 's/[?#].*//')

    # If no extension, default to jpg
    if [[ ! "$URL_FILENAME" =~ \. ]]; then
        URL_FILENAME="${URL_FILENAME}.jpg"
    fi

    # Create temp file
    TEMP_FILE="/tmp/lqip_${RANDOM}_${URL_FILENAME}"

    # Download the image (with -k to skip SSL certificate verification)
    if ! curl -sS -L -k -o "$TEMP_FILE" "$INPUT_IMAGE"; then
        print_error "Failed to download image from URL: $INPUT_IMAGE"
        [ -f "$TEMP_FILE" ] && rm "$TEMP_FILE"
        exit 1
    fi

    # Update INPUT_IMAGE to point to temp file
    ORIGINAL_URL="$INPUT_IMAGE"
    INPUT_IMAGE="$TEMP_FILE"
    INPUT_FILENAME="$URL_FILENAME"

    print_success "Downloaded successfully"
else
    # Check if local file exists
    if [ ! -f "$INPUT_IMAGE" ]; then
        print_error "File not found: $INPUT_IMAGE"
        exit 1
    fi
fi

# Parse the input path
if [ -z "$INPUT_FILENAME" ]; then
    INPUT_FILENAME=$(basename "$INPUT_IMAGE")
fi
INPUT_EXTENSION="${INPUT_FILENAME##*.}"
INPUT_BASENAME="${INPUT_FILENAME%.*}"

# Determine output directory
OUTPUT_DIR="$OUTPUT_BASE_DIR"

if [ -n "$CUSTOM_FOLDER" ]; then
    # Use custom folder if provided
    OUTPUT_DIR="$OUTPUT_BASE_DIR/$CUSTOM_FOLDER"
elif [ "$IS_URL" = false ]; then
    # For local files, preserve up to 1 depth subfolder structure
    INPUT_DIR=$(dirname "$INPUT_IMAGE")
    RELATIVE_PATH=""

    if [[ "$INPUT_DIR" != "." ]]; then
        # Extract up to 1 depth subfolder
        IFS='/' read -ra PATH_PARTS <<< "$INPUT_DIR"
        if [ ${#PATH_PARTS[@]} -ge 1 ]; then
            RELATIVE_PATH="${PATH_PARTS[0]}"
            if [ ${#PATH_PARTS[@]} -ge 2 ]; then
                RELATIVE_PATH="${RELATIVE_PATH}/${PATH_PARTS[1]}"
            fi
        fi
    fi

    if [ -n "$RELATIVE_PATH" ]; then
        OUTPUT_DIR="$OUTPUT_BASE_DIR/$RELATIVE_PATH"
    fi
fi

mkdir -p "$OUTPUT_DIR"

# Generate output filename with -lqip suffix
OUTPUT_FILENAME="${INPUT_BASENAME}-lqip.${OUTPUT_FORMAT}"
OUTPUT_IMAGE="$OUTPUT_DIR/$OUTPUT_FILENAME"

print_info "Generating LQIP..."
print_info "Input:  $INPUT_IMAGE"
print_info "Output: $OUTPUT_IMAGE"

# Generate LQIP using ImageMagick
# Steps:
# 1. Resize to very small width (maintains aspect ratio)
# 2. Apply slight blur
# 3. Reduce quality
# 4. Strip metadata to reduce file size
$CONVERT_CMD "$INPUT_IMAGE" \
    -resize "${LQIP_WIDTH}x" \
    -blur "0x${BLUR_SIGMA}" \
    -quality "$LQIP_QUALITY" \
    -strip \
    "$OUTPUT_IMAGE"

# Check if generation was successful
if [ -f "$OUTPUT_IMAGE" ]; then
    # Get file sizes
    INPUT_SIZE=$(du -h "$INPUT_IMAGE" | cut -f1)
    OUTPUT_SIZE=$(du -h "$OUTPUT_IMAGE" | cut -f1)

    print_success "LQIP generated successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Original: $INPUT_SIZE"
    echo "  LQIP:     $OUTPUT_SIZE"
    echo "  Saved to: $OUTPUT_IMAGE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Output the path for batch processing (machine-readable)
    echo "OUTPUT_PATH=$OUTPUT_IMAGE"
else
    print_error "Failed to generate LQIP"

    # Cleanup temp file if URL download
    if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
        rm "$TEMP_FILE"
    fi

    exit 1
fi

# Cleanup temp file if URL download
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

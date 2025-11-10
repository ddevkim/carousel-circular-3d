#!/bin/bash

# LQIP Batch Generator with API-like Interface
# Generates LQIP for multiple images and creates metadata.json
#
# Usage:
#   1. Directory mode: ./generate-lqip-batch.sh <directory_path>
#   2. API mode: ./generate-lqip-batch.sh --folder <folder_name> --urls <url1> <url2> ...
#   3. Stdin mode: echo "url1\nurl2" | ./generate-lqip-batch.sh --folder <folder_name> --stdin

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to convert image to base64
image_to_base64() {
    local image_path="$1"
    base64 -i "$image_path" | tr -d '\n'
}

# Function to show usage
show_usage() {
    echo "Usage:"
    echo "  Directory mode:"
    echo "    $0 <directory_path>"
    echo ""
    echo "  API mode with URLs:"
    echo "    $0 --folder <folder_name> --urls <url1> <url2> ..."
    echo ""
    echo "  API mode with stdin:"
    echo "    echo -e \"url1\\nurl2\" | $0 --folder <folder_name> --stdin"
    echo ""
    echo "Examples:"
    echo "  $0 ./images"
    echo "  $0 --folder products --urls https://example.com/1.jpg https://example.com/2.jpg"
    echo "  cat urls.txt | $0 --folder products --stdin"
}

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LQIP_SCRIPT="$SCRIPT_DIR/generate-lqip.sh"
OUTPUT_BASE_DIR="$SCRIPT_DIR/outputs/lqip"

# Check if generate-lqip.sh exists
if [ ! -f "$LQIP_SCRIPT" ]; then
    print_error "generate-lqip.sh not found at: $LQIP_SCRIPT"
    exit 1
fi

# Parse arguments
MODE="directory"
FOLDER_NAME=""
URLS=()
INPUT_DIR=""

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --folder)
            MODE="api"
            FOLDER_NAME="$2"
            shift 2
            ;;
        --urls)
            shift
            while [[ $# -gt 0 ]] && [[ ! "$1" =~ ^-- ]]; do
                URLS+=("$1")
                shift
            done
            ;;
        --stdin)
            MODE="stdin"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            # Assume it's a directory path
            INPUT_DIR="$1"
            shift
            ;;
    esac
done

# Validate arguments based on mode
if [ "$MODE" = "api" ] || [ "$MODE" = "stdin" ]; then
    if [ -z "$FOLDER_NAME" ]; then
        print_error "Folder name is required in API mode"
        show_usage
        exit 1
    fi

    if [ "$MODE" = "api" ] && [ ${#URLS[@]} -eq 0 ]; then
        print_error "At least one URL is required with --urls"
        show_usage
        exit 1
    fi

    if [ "$MODE" = "stdin" ]; then
        # Read URLs from stdin
        while IFS= read -r line; do
            # Skip empty lines
            [[ -z "$line" ]] && continue
            URLS+=("$line")
        done
    fi

    if [ ${#URLS[@]} -eq 0 ]; then
        print_error "No URLs provided"
        exit 1
    fi
elif [ "$MODE" = "directory" ]; then
    if [ -z "$INPUT_DIR" ]; then
        print_error "Directory path is required"
        show_usage
        exit 1
    fi

    if [ ! -d "$INPUT_DIR" ]; then
        print_error "Directory not found: $INPUT_DIR"
        exit 1
    fi
fi

print_header "LQIP Batch Generator"

# Prepare image list
IMAGE_FILES=()

if [ "$MODE" = "directory" ]; then
    print_info "Searching for images in: $INPUT_DIR"

    # Find all image files (jpg, jpeg, png, webp)
    # Exclude already generated LQIP files
    while IFS= read -r file; do
        IMAGE_FILES+=("$file")
    done < <(find "$INPUT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) ! -name "*.lqip.*" | sort)
else
    print_info "Processing URLs with folder: $FOLDER_NAME"
    IMAGE_FILES=("${URLS[@]}")
fi

# Count images
IMAGE_COUNT=${#IMAGE_FILES[@]}

if [ "$IMAGE_COUNT" -eq 0 ]; then
    print_info "No images found"
    exit 0
fi

print_info "Found $IMAGE_COUNT image(s)"
echo ""

# Process each image
PROCESSED=0
FAILED=0
METADATA_KEYS=()
METADATA_BASE64=()
METADATA_WIDTHS=()
METADATA_HEIGHTS=()

for image in "${IMAGE_FILES[@]}"; do
    echo ""
    print_info "Processing [$((PROCESSED + FAILED + 1))/$IMAGE_COUNT]: $image"

    # Prepare command
    if [ "$MODE" = "directory" ]; then
        CMD="$LQIP_SCRIPT \"$image\""
    else
        CMD="$LQIP_SCRIPT \"$image\" \"$FOLDER_NAME\""
    fi

    # Execute and capture output
    if OUTPUT=$(eval "$CMD" 2>&1); then
        ((PROCESSED++))

        # Extract output path from the script output
        OUTPUT_PATH=$(echo "$OUTPUT" | grep "^OUTPUT_PATH=" | cut -d'=' -f2)

        if [ -n "$OUTPUT_PATH" ] && [ -f "$OUTPUT_PATH" ]; then
            # Generate base64
            BASE64_DATA=$(image_to_base64 "$OUTPUT_PATH")

            # Get image dimensions using ImageMagick
            DIMENSIONS=$($CONVERT_CMD identify -format "%w %h" "$OUTPUT_PATH")
            WIDTH=$(echo "$DIMENSIONS" | cut -d' ' -f1)
            HEIGHT=$(echo "$DIMENSIONS" | cut -d' ' -f2)

            # Determine the key for metadata
            # Extract relative path from OUTPUT_BASE_DIR
            METADATA_KEY="${OUTPUT_PATH#$OUTPUT_BASE_DIR/}"

            # Store in metadata arrays
            METADATA_KEYS+=("$METADATA_KEY")
            METADATA_BASE64+=("data:image/webp;base64,$BASE64_DATA")
            METADATA_WIDTHS+=("$WIDTH")
            METADATA_HEIGHTS+=("$HEIGHT")

            print_success "Added to metadata: $METADATA_KEY (${WIDTH}x${HEIGHT})"
        fi
    else
        ((FAILED++))
        print_error "Failed to process: $image"
    fi
done

echo ""
print_header "Generating metadata.json"

# Determine metadata output path
if [ "$MODE" = "directory" ]; then
    METADATA_FILE="$OUTPUT_BASE_DIR/metadata.json"
else
    METADATA_FILE="$OUTPUT_BASE_DIR/$FOLDER_NAME/metadata.json"
fi

# Create metadata directory if needed
mkdir -p "$(dirname "$METADATA_FILE")"

# Generate JSON with structured metadata
echo "{" > "$METADATA_FILE"

for i in "${!METADATA_KEYS[@]}"; do
    key="${METADATA_KEYS[$i]}"
    base64="${METADATA_BASE64[$i]}"
    width="${METADATA_WIDTHS[$i]}"
    height="${METADATA_HEIGHTS[$i]}"

    # Add comma if not first item
    if [ "$i" -gt 0 ]; then
        echo "," >> "$METADATA_FILE"
    fi

    # Properly escape the key and value for JSON
    ESCAPED_KEY=$(echo "$key" | sed 's/\\/\\\\/g; s/"/\\"/g')
    ESCAPED_BASE64=$(echo "$base64" | sed 's/\\/\\\\/g; s/"/\\"/g')

    # Write structured JSON object
    echo -n "  \"$ESCAPED_KEY\": {" >> "$METADATA_FILE"
    echo -n "\"base64\": \"$ESCAPED_BASE64\", " >> "$METADATA_FILE"
    echo -n "\"width\": $width, " >> "$METADATA_FILE"
    echo -n "\"height\": $height" >> "$METADATA_FILE"
    echo -n "}" >> "$METADATA_FILE"
done

echo "" >> "$METADATA_FILE"
echo "}" >> "$METADATA_FILE"

print_success "Metadata saved to: $METADATA_FILE"

# Pretty print with jq if available
if command -v jq &> /dev/null; then
    print_info "Formatting JSON with jq..."
    jq '.' "$METADATA_FILE" > "${METADATA_FILE}.tmp" && mv "${METADATA_FILE}.tmp" "$METADATA_FILE"
    print_success "JSON formatted"
fi

echo ""
print_header "Summary"
echo "  Total:     $IMAGE_COUNT"
echo "  Processed: $PROCESSED"
echo "  Failed:    $FAILED"
echo "  Metadata:  $METADATA_FILE"
echo ""

if [ "$FAILED" -eq 0 ]; then
    print_success "All images processed successfully!"
else
    print_error "$FAILED image(s) failed to process"
    exit 1
fi

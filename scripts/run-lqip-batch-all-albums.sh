#!/bin/bash

# Batch process LQIP for all albums in parallel
# Each album processes 20 images (indices 1-20)

set -e

# Configuration
HOST="https://pub-7f7abe14948a4c78825b386f9eb1e70b.r2.dev"
ALBUMS=("bali" "barbados" "borabora" "cadiz" "cannes" "hawaii" "ibiza" "mallorca" "santorini")
IMAGE_INDICES=($(seq 1 20))

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LQIP_BATCH_SCRIPT="$SCRIPT_DIR/generate-lqip-batch.sh"

# Verify script exists
if [ ! -f "$LQIP_BATCH_SCRIPT" ]; then
    print_error "generate-lqip-batch.sh not found at: $LQIP_BATCH_SCRIPT"
    exit 1
fi

print_header "LQIP Batch Processing - All Albums"
echo ""
print_info "HOST: $HOST"
print_info "Albums: ${#ALBUMS[@]}"
print_info "Images per album: ${#IMAGE_INDICES[@]}"
print_info "Execution mode: PARALLEL"
echo ""

# Function to process an album
process_album() {
    local album="$1"
    local urls=()

    # Generate URLs for this album (indices 1-20)
    for index in "${IMAGE_INDICES[@]}"; do
        urls+=("${HOST}/${album}/${index}.webp")
    done

    print_header "Processing Album: $album"
    echo "Executing: $LQIP_BATCH_SCRIPT --folder $album --urls [${#urls[@]} URLs]"
    echo ""

    # Execute with bash to pass array properly (no quotes around array expansion)
    bash "$LQIP_BATCH_SCRIPT" --folder "$album" --urls ${urls[@]}

    print_success "Album '$album' processing completed"
    echo ""
}

# Export function for parallel execution
export -f process_album
export -f print_header
export -f print_info
export -f print_success
export -f print_error
export HOST LQIP_BATCH_SCRIPT IMAGE_INDICES

# Process all albums in parallel
declare -a PIDS
for album in "${ALBUMS[@]}"; do
    print_info "Starting background job for album: $album"
    process_album "$album" &
    PIDS+=($!)
done

print_header "Waiting for all albums to complete..."
echo ""

# Wait for all background processes and track status
FAILED=0
for i in "${!PIDS[@]}"; do
    pid=${PIDS[$i]}
    album=${ALBUMS[$i]}
    if wait "$pid"; then
        print_success "Album '$album' (PID: $pid) completed successfully"
    else
        print_error "Album '$album' (PID: $pid) failed"
        ((FAILED++))
    fi
done

echo ""
print_header "Summary"
echo "Total albums: ${#ALBUMS[@]}"
echo "Completed: $((${#ALBUMS[@]} - FAILED))"
echo "Failed: $FAILED"
echo ""

if [ "$FAILED" -eq 0 ]; then
    print_success "All albums processed successfully!"
    exit 0
else
    print_error "Some albums failed to process"
    exit 1
fi


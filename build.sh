#!/bin/bash

# Exit on error
set -e

#source ~/.bashrc
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
echo "node version: $(node -v)"
echo "npm version: $(npm -v)"

# Define paths
TARGET_DIR="/mydata/nginx/html"
LOCAL_TARGET_DIR="/opt/homebrew/var/www/photo-gallary"
CURRENT_DIR=$(pwd)
BUILD_REQUIRED=1
DEPLOY_ENV="server"

# Check if build is required (parameter 1)
if [ -n "$1" ]; then
  if [ "$1" = "0" ]; then
    BUILD_REQUIRED=0
  elif [ "$1" = "1" ]; then
    BUILD_REQUIRED=1
  else
    echo "Error: First parameter must be 0 (no build) or 1 (build)"
    exit 1
  fi
fi

# Check environment mode (parameter 2)
if [ -n "$2" ]; then
  if [ "$2" = "local" ]; then
    DEPLOY_ENV="local"
  elif [ "$2" = "server" ]; then
    DEPLOY_ENV="server"
  else
    echo "Error: Second parameter must be 'local' or 'server'"
    exit 1
  fi
fi

# Function to display usage information
show_usage() {
  echo "Usage: $0 [build_flag] [environment]"
  echo "Parameters:"
  echo "  build_flag - 0 (no build) or 1 (build) - Default: 1"
  echo "  environment - 'local' or 'server' - Default: server"
  echo "Examples:"
  echo "  $0 1 local - Build and deploy to local environment"
  echo "  $0 0 server - Skip build and deploy to server environment"
}


# Function to build photo-gallary project
build_photo_gallary() {
  echo "step1 build"
  local project_name="photo-gallary"
  if [ -d "$CURRENT_DIR/$project_name" ]; then
    if [ "$BUILD_REQUIRED" = "1" ]; then
      echo "Building $project_name project..."
      cd "$CURRENT_DIR/$project_name"
      pnpm install
      # Clean the .next directory before building
      rm -rf .next

      # For local deployment, create a temporary .env.local file to set API connection to localhost:3001
      if [ "$DEPLOY_ENV" = "local" ]; then
        echo "Configuring for local deployment with API at localhost:3001..."
        echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
        echo "API_URL=http://localhost:3001" >> .env.local
      fi

      # Use npm run build to ensure proper standalone output generation
      pnpm run build

      # Remove temporary .env.local file if it was created
      if [ "$DEPLOY_ENV" = "local" ] && [ -f .env.local ]; then
        rm .env.local
      fi

      # Create a directory for static assets (frontend)
#      mkdir -p out
#      # Copy static assets to out directory for nginx
#      cp -r .next/static out/
#      # Copy public files to out directory
#      cp -r public/* out/
    else
      echo "Skipping build for $project_name as per BUILD_REQUIRED=0..."
      cd "$CURRENT_DIR/$project_name"
    fi
    PHOTO_GALLARY_BUILT=true
  else
    echo "Error: $project_name project folder does not exist."
    exit 1
  fi
}

# Function to copy static files to the appropriate location
copy_static_files() {
  echo "step2 copy asset"
  local project_name="photo-gallary"
  local source_dir="$CURRENT_DIR/$project_name/.next/static"
  local target_dir=""

  # Determine target directory based on environment mode
  if [ "$DEPLOY_ENV" = "local" ]; then
    target_dir="$LOCAL_TARGET_DIR"
  else
    target_dir="$TARGET_DIR"
  fi

  # Check if source directory exists
  if [ -d "$source_dir" ]; then
    echo "Copying static files from $source_dir to $target_dir..."

    # Delete destination folder before copying
    if [ -d "$target_dir" ]; then
      echo "Removing existing directory: $target_dir"
      rm -rf "$target_dir"
    fi

    # Create target directory
    mkdir -p "$target_dir"

    # Copy static files (contents of the directory)
    cp -r "$source_dir/"* "$target_dir/"

    echo "Static files copied successfully to $target_dir"
  else
    echo "Warning: Source directory $source_dir does not exist. Skipping copy operation."
    echo "Note: The static directory is typically created during the build process."
    echo "If you skipped the build (BUILD_REQUIRED=0), make sure the static directory exists."
  fi
}
# Check if help is requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_usage
  exit 0
fi

# Initialize build flag
PHOTO_GALLARY_BUILT=false

# Build the photo-gallary project
build_photo_gallary
PHOTO_GALLARY_BUILT=true

# Copy static files to the appropriate location
copy_static_files

echo "Build process completed successfully!"

# Display deployment information
if [ "$DEPLOY_ENV" = "local" ]; then
  echo ""
  echo "=== LOCAL DEPLOYMENT INFORMATION ==="
  echo "Static files have been copied to: $LOCAL_TARGET_DIR"
  echo ""
  echo "The API will be available at: http://localhost:3001"
else
  echo ""
  echo "=== SERVER DEPLOYMENT INFORMATION ==="
  echo "Static files have been copied to: $TARGET_DIR"
fi

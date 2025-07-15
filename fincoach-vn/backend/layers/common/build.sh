#!/bin/bash

# Build Lambda Layer for common dependencies

# Clean previous builds
rm -rf python
rm -f layer.zip

# Install dependencies
pip install -r requirements.txt -t python/

# Create zip file
zip -r layer.zip python/

echo "Lambda layer built successfully!"
#!/bin/bash

## This script builds a `jumperlab.zip` file, to be embedded in a `jlctl` build

set -euo pipefail

# Change to project root
cd $(dirname $0)/..

# Detect some git status
commit="$(git rev-parse --short HEAD)"
if git status --porcelain | grep -q '^M'; then
    dirty_tag="-dirty"
else
    dirty_tag=""
fi

# Install dependencies
npm install

## Set build variables
# root URL of jumperlab. Must equal the path where `jlctl` serves the bundle.
export PUBLIC_URL=/jumperlab
# tell jumperlab to access the jlctl API from `/`
export REACT_APP_JLCTL_URL=/
# Build info is displayed inside the app
export REACT_APP_BUILD_INFO="${commit}${dirty_tag}"

# Run build
npm run build

# Pack all files from `./build` into ZIP file
cd build
zip -r jumperlab.zip *
cd ..


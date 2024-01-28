#!/bin/bash

## This script builds a `jumperlab.zip` file, to be embedded in a `jlctl` build

set -euo pipefail

# Change to project root
cd $(dirname $0)/..

# Install dependencies
npm install

## Set build variables
# root URL of jumperlab. Must equal the path where `jlctl` serves the bundle.
export PUBLIC_URL=/jumperlab
# tell jumperlab to access the jlctl API from `/`
export REACT_APP_JLCTL_URL=/

# Run build
npm run build

# Pack all files from `./build` into ZIP file
cd build
zip -r jumperlab.zip *
cd ..


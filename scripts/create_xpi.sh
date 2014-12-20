#!/bin/sh

set -e

cd ../extension
rm -fv ../firebinder.xpi
zip -r ../firebinder.xpi *
cd ../scripts

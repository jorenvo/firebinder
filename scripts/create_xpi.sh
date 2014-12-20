#!/bin/sh

set -e

cd ../extension
rm -fv /tmp/firebinder.xpi
zip -r /tmp/firebinder.xpi *
cd ../scripts

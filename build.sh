#!/bin/bash
set -e

wget -O zola.tar.gz "https://github.com/getzola/zola/releases/download/v0.19.2/zola-v0.19.2-x86_64-unknown-linux-gnu.tar.gz"

tar -xzf zola.tar.gz

rm zola.tar.gz

./zola --version

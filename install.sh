#!/bin/bash

arch=$(uname -m)
platform=$(uname -s | tr '[:upper:]' '[:lower:]')
base_url="https://github.com/asg017/sqlite-vss/releases/download/v0.1.2"

if [ "$arch" == "arm64" ] && [ "$platform" == "darwin" ]; then
  vector_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-aarch64.vector0.dylib"
  vss_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-aarch64.vss0.dylib"
elif [ "$arch" == "x86_64" ] && [ "$platform" == "darwin" ]; then
  vector_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-x86_64.vector0.dylib"
  vss_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-x86_64.vss0.dylib"
elif [ "$arch" == "x86_64" ] && [ "$platform" == "linux" ]; then
  vector_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-linux-x86_64.vector0.so"
  vss_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-linux-x86_64.vss0.so"
else
  echo "Unsupported architecture or platform: $arch on $platform"
  exit 1
fi

# Downloading the files using wget
wget -O "vector0.dylib" $vector_extension_url
wget -O "vss0.dylib" $vss_extension_url

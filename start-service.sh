#!/bin/bash
# Auto-generated start script for ff-plat-6600

cd "$(dirname "$0")"

# Force webpack for compatibility if Next.js 16
if grep -q '"next": ".*16\.' package.json; then
    echo "Starting ff-plat-6600 with webpack (Next.js 16)..."
    npm run dev -- --webpack
else
    echo "Starting ff-plat-6600..."
    npm run dev
fi

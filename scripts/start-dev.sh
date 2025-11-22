#!/bin/bash
set -euo pipefail

# Unified development startup script
# Checks if frontend is built, builds if needed, then starts backend watch mode

echo "🚀 Starting unified development server..."

# Check if frontend build exists
if [ ! -f "dist/public/index.html" ]; then
  echo "📦 Frontend not found in dist/public/, building..."
  if ! npm run build:frontend; then
    echo "❌ Frontend build failed! Fix errors and rerun: npm run dev"
    exit 1
  fi
  if ! npm run copy:frontend; then
    echo "❌ Frontend copy failed! Fix errors and rerun: npm run dev"
    exit 1
  fi
  echo "✅ Frontend build complete"
else
  echo "✅ Frontend already built, skipping..."
fi

# Start backend in watch mode
echo "🔄 Starting backend watch mode..."
NODE_ENV=development PORT=5000 nest start --watch

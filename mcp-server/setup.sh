#!/bin/bash

# MCP Server Build & Test Script
echo "🚀 Setting up PDF SaaS MCP Server..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the mcp-server directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Create .env file with your API key:"
echo "   cp .env.example .env"
echo "   # Edit .env and add your API key"
echo ""
echo "2. Add to Claude Desktop config:"
echo "   macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "   Windows: %APPDATA%\\Claude\\claude_desktop_config.json"
echo ""
echo "   Add this configuration:"
echo '   {'
echo '     "mcpServers": {'
echo '       "pdf-saas": {'
echo '         "command": "node",'
echo "         \"args\": [\"$(pwd)/dist/index.js\"],"
echo '         "env": {'
echo '           "PDF_API_BASE_URL": "http://localhost:3000",'
echo '           "PDF_API_KEY": "your-api-key-here"'
echo '         }'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "🎉 Ready to use PDF tools in Claude!"

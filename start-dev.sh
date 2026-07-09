#!/bin/bash

# Start development servers for CI/CD pipeline project

echo "🚀 Starting CI/CD Pipeline Development Environment"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
fi

echo "🔧 Starting WebSocket server on port 3001..."
# Start WebSocket server in background
npm run server &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

echo "🌐 Starting frontend development server on port 5173..."
# Start frontend development server
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "📊 Frontend: http://localhost:5173"
echo "🔌 WebSocket Server: http://localhost:3001"
echo "📈 Real-time Dashboard: http://localhost:5173/dashboard"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait

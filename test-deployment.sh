#!/bin/bash

echo "🧪 Testing CI/CD Real-time Integration"
echo ""

# Test the deployment API endpoint
echo "📤 Triggering test deployment..."
curl -X POST http://localhost:3001/api/deploy \
  -H "Content-Type: application/json" \
  -d '{"branch": "main"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Test deployment triggered!"
echo "🔍 Check the frontend at http://localhost:8080 to see real-time updates"
echo "📊 Also check the real-time dashboard at http://localhost:8080/dashboard"

#!/bin/bash

echo "🚀 Setting up Local Service Provider Project..."

# Step 1: Backend Setup
echo "🔧 Installing backend dependencies..."
cd api
yarn

# Step 2: Setup backend .env
if [ ! -f .env ]; then
  echo "📄 Creating .env file for backend..."
  cat <<EOT >> .env
JWT_KEY = your_key
DB_NAME=your_db
DB_USER=your_user
DB_PASS=uour_password
DB_HOST=localhost
STRIPE = your_private_key
EOT
else
  echo "✅ .env file already exists in backend, skipping..."
fi
cd ..

# Step 3: Frontend Setup
echo "🎨 Installing frontend dependencies..."
cd client
yarn
cd ..

# Final Message
echo ""
echo "✅ Local Service Provider Project setup complete!"
echo "👉 Next steps:"
echo "  1. Review and update credentials in server/.env"
echo "  2. Start backend: cd server && npm start"
echo "  3. Start frontend: cd client && npm start"

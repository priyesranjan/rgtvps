#!/bin/bash
# Royal Gold Traders — Database Initialization Script
# Run this once after the backend container first starts in Coolify

set -e

echo "🔧 Initializing RGT database..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run generate

# Apply database schema
echo "📊 Pushing Prisma schema to database..."
npx prisma db push --skip-generate

# Seed demo data
echo "🌱 Seeding database with demo data..."
npm run db:seed

echo "✅ Database initialization complete!"
echo ""
echo "Login credentials (change these after first deployment):"
echo "  Tech Team  → tech@rgt.in          / techteam@123"
echo "  Admin      → admin@rgt.in         / admin@123"
echo "  Manager    → manager@rgt.in       / manager@123"
echo "  Employee   → sanjay@rgt.in        / employee@123"
echo "  Investor   → +919876543210        / investor@123"

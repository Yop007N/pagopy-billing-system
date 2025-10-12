#!/bin/bash

# PagoPy - Initial Setup Script
# This script sets up the development environment for the first time

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}!${NC} ${1}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║         PagoPy Setup Script                   ║"
echo "║     Initial Development Environment Setup     ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Check prerequisites
print_step "Step 1/7: Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 20 LTS or higher."
    exit 1
fi
print_success "Node.js $(node --version) is installed"

if ! command_exists pnpm; then
    print_warning "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed successfully"
else
    print_success "pnpm $(pnpm --version) is installed"
fi

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker Desktop."
    exit 1
fi
print_success "Docker $(docker --version | cut -d ' ' -f3) is installed"

if ! docker compose version >/dev/null 2>&1; then
    print_error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi
print_success "Docker Compose is installed"

# Step 2: Install dependencies
print_step "Step 2/7: Installing project dependencies..."
pnpm install
print_success "Dependencies installed successfully"

# Step 3: Setup environment files
print_step "Step 3/7: Setting up environment files..."

# Backend .env
if [ ! -f "apps/backend/.env" ]; then
    if [ -f "apps/backend/.env.example" ]; then
        cp apps/backend/.env.example apps/backend/.env
        print_success "Backend .env file created from .env.example"
        print_warning "Please update apps/backend/.env with your actual credentials"
    else
        print_warning "apps/backend/.env.example not found, skipping backend .env setup"
    fi
else
    print_warning "Backend .env already exists, skipping"
fi

# Web .env (if needed)
if [ ! -f "apps/web/.env" ]; then
    if [ -f "apps/web/.env.example" ]; then
        cp apps/web/.env.example apps/web/.env
        print_success "Web .env file created from .env.example"
    else
        # Create a basic web .env if it doesn't exist
        echo "VITE_API_URL=http://localhost:3000" > apps/web/.env
        print_success "Web .env file created with default values"
    fi
else
    print_warning "Web .env already exists, skipping"
fi

# Step 4: Start Docker services
print_step "Step 4/7: Starting Docker services (PostgreSQL + Redis)..."

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

pnpm docker:up
print_success "Docker services started successfully"

# Wait for services to be healthy
print_step "Waiting for services to be ready..."
sleep 5

# Check if PostgreSQL is ready
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec pago-py-postgres pg_isready -U pagopy >/dev/null 2>&1; then
        print_success "PostgreSQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    print_error "PostgreSQL failed to start within timeout"
    exit 1
fi

# Check if Redis is ready
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec pago-py-redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Redis failed to start within timeout"
    exit 1
fi

# Step 5: Generate Prisma Client
print_step "Step 5/7: Generating Prisma client..."
pnpm prisma:generate
print_success "Prisma client generated successfully"

# Step 6: Run database migrations
print_step "Step 6/7: Running database migrations..."
pnpm prisma:migrate
print_success "Database migrations completed successfully"

# Step 7: Seed database (optional)
print_step "Step 7/7: Seeding database (optional)..."
read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if pnpm prisma:seed 2>/dev/null; then
        print_success "Database seeded successfully"
    else
        print_warning "Seed script not found or failed. You can seed the database manually later."
    fi
else
    print_warning "Skipping database seeding"
fi

# Final success message
echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║         Setup Completed Successfully!         ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo "  1. Update apps/backend/.env with your actual credentials"
echo "  2. Run ${GREEN}pnpm dev${NC} to start all applications"
echo "  3. Or run applications individually:"
echo "     - ${GREEN}pnpm dev:backend${NC} - API at http://localhost:3000"
echo "     - ${GREEN}pnpm dev:web${NC}     - Web at http://localhost:4200"
echo "     - ${GREEN}pnpm dev:mobile${NC}  - Mobile at http://localhost:8100"
echo ""
echo "  For health checks, run: ${GREEN}./scripts/health-check.sh${NC}"
echo ""
echo -e "${YELLOW}Happy coding! 🚀${NC}\n"

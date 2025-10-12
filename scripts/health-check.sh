#!/bin/bash

# PagoPy - Health Check Script
# Verifies that all services are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}${1}${NC}"
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

check_service() {
    local service_name=$1
    local check_command=$2
    local error_message=$3

    if eval "$check_command" >/dev/null 2>&1; then
        print_success "$service_name is running"
        return 0
    else
        print_error "$service_name is not running"
        [ -n "$error_message" ] && echo "   $error_message"
        return 1
    fi
}

check_http_service() {
    local service_name=$1
    local url=$2
    local timeout=${3:-5}

    if command -v curl >/dev/null 2>&1; then
        if curl -s -f -m "$timeout" "$url" >/dev/null 2>&1; then
            print_success "$service_name is responding at $url"
            return 0
        else
            print_error "$service_name is not responding at $url"
            return 1
        fi
    elif command -v wget >/dev/null 2>&1; then
        if wget -q --spider --timeout="$timeout" "$url" 2>/dev/null; then
            print_success "$service_name is responding at $url"
            return 0
        else
            print_error "$service_name is not responding at $url"
            return 1
        fi
    else
        print_warning "Neither curl nor wget is available. Cannot check HTTP services."
        return 1
    fi
}

# Main health check
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║         PagoPy Health Check                   ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}\n"

exit_code=0

# Check 1: Docker Service
print_header "1. Checking Docker..."
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running"
    echo "   → Start Docker Desktop and try again"
    exit_code=1
else
    print_success "Docker daemon is running"
fi
echo ""

# Check 2: PostgreSQL Container
print_header "2. Checking PostgreSQL..."
if ! check_service "PostgreSQL container" "docker ps | grep -q pago-py-postgres" "Run: pnpm docker:up"; then
    exit_code=1
elif ! check_service "PostgreSQL connection" "docker exec pago-py-postgres pg_isready -U pagopy" "PostgreSQL is not ready"; then
    exit_code=1
else
    # Check if we can connect from host
    if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD=pagopy_dev_password psql -h localhost -U pagopy -d pago_py_dev -c "SELECT 1" >/dev/null 2>&1; then
            print_success "PostgreSQL is accessible from host"
        else
            print_warning "PostgreSQL container is running but not accessible from host"
            echo "   → Check DATABASE_URL in apps/backend/.env"
        fi
    fi
fi
echo ""

# Check 3: Redis Container
print_header "3. Checking Redis..."
if ! check_service "Redis container" "docker ps | grep -q pago-py-redis" "Run: pnpm docker:up"; then
    exit_code=1
elif ! check_service "Redis connection" "docker exec pago-py-redis redis-cli ping" "Redis is not responding"; then
    exit_code=1
else
    # Check if we can connect from host
    if command -v redis-cli >/dev/null 2>&1; then
        if redis-cli -h localhost -p 6379 ping >/dev/null 2>&1; then
            print_success "Redis is accessible from host"
        else
            print_warning "Redis container is running but not accessible from host"
        fi
    fi
fi
echo ""

# Check 4: Backend API
print_header "4. Checking Backend API..."
if check_http_service "Backend API" "http://localhost:3000" 5; then
    # Try to check health endpoint if it exists
    if command -v curl >/dev/null 2>&1; then
        api_response=$(curl -s -w "\n%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
        http_code=$(echo "$api_response" | tail -n1)

        if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
            print_success "Backend API is responding (HTTP $http_code)"
        else
            print_warning "Backend API returned HTTP $http_code"
        fi
    fi
else
    print_warning "Backend is not running"
    echo "   → Run: pnpm dev:backend"
    exit_code=1
fi
echo ""

# Check 5: Web Application
print_header "5. Checking Web Application..."
if ! check_http_service "Web application" "http://localhost:4200" 5; then
    print_warning "Web application is not running"
    echo "   → Run: pnpm dev:web"
    exit_code=1
fi
echo ""

# Check 6: Mobile Application
print_header "6. Checking Mobile Application..."
if ! check_http_service "Mobile application" "http://localhost:8100" 5; then
    print_warning "Mobile application is not running"
    echo "   → Run: pnpm dev:mobile"
    exit_code=1
fi
echo ""

# Check 7: Environment Files
print_header "7. Checking Environment Files..."
if [ -f "apps/backend/.env" ]; then
    print_success "Backend .env exists"

    # Check if DATABASE_URL is set
    if grep -q "^DATABASE_URL=" apps/backend/.env 2>/dev/null; then
        print_success "DATABASE_URL is configured"
    else
        print_warning "DATABASE_URL is not set in apps/backend/.env"
    fi
else
    print_error "Backend .env file is missing"
    echo "   → Copy from: cp apps/backend/.env.example apps/backend/.env"
    exit_code=1
fi

if [ -f "apps/web/.env" ]; then
    print_success "Web .env exists"
else
    print_warning "Web .env file is missing (may not be required)"
fi
echo ""

# Check 8: Node Modules
print_header "8. Checking Dependencies..."
if [ -d "node_modules" ] && [ -d "apps/backend/node_modules" ]; then
    print_success "Dependencies are installed"
else
    print_error "Dependencies are missing"
    echo "   → Run: pnpm install"
    exit_code=1
fi
echo ""

# Check 9: Prisma Client
print_header "9. Checking Prisma..."
if [ -d "apps/backend/node_modules/.prisma" ]; then
    print_success "Prisma client is generated"
else
    print_warning "Prisma client may not be generated"
    echo "   → Run: pnpm prisma:generate"
fi
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! System is healthy.${NC}"
    echo ""
    echo -e "${BLUE}Service URLs:${NC}"
    echo "  • Backend API:    ${GREEN}http://localhost:3000${NC}"
    echo "  • Web App:        ${GREEN}http://localhost:4200${NC}"
    echo "  • Mobile App:     ${GREEN}http://localhost:8100${NC}"
    echo "  • Prisma Studio:  ${GREEN}pnpm prisma:studio${NC}"
    echo ""
    echo -e "${BLUE}Database Info:${NC}"
    echo "  • PostgreSQL:     ${GREEN}localhost:5432${NC}"
    echo "  • Database:       ${GREEN}pago_py_dev${NC}"
    echo "  • User:           ${GREEN}pagopy${NC}"
    echo ""
    echo -e "${BLUE}Cache:${NC}"
    echo "  • Redis:          ${GREEN}localhost:6379${NC}"
else
    echo -e "${YELLOW}⚠ Some checks failed. Please review the errors above.${NC}"
    echo ""
    echo -e "${BLUE}Quick fixes:${NC}"
    echo "  • Start Docker:         ${GREEN}pnpm docker:up${NC}"
    echo "  • Install dependencies: ${GREEN}pnpm install${NC}"
    echo "  • Setup environment:    ${GREEN}./scripts/setup.sh${NC}"
    echo "  • Start all services:   ${GREEN}./scripts/start-all.sh${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════${NC}\n"

exit $exit_code

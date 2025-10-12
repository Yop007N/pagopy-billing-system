#!/bin/bash

# ============================================
# PagoPy - Script de Inicio Completo
# ============================================
# Este script inicia todo el stack de desarrollo:
# - Docker (PostgreSQL + Redis)
# - Prisma (generación y migración)
# - Backend NestJS
# - Frontend Angular
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  ${1}${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Run this script from the project root."
    exit 1
fi

print_header "🚀 PagoPy - Iniciando Stack Completo"

# ============================================
# Step 1: Check Docker
# ============================================
print_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi
print_success "Docker está disponible"

# ============================================
# Step 2: Start Docker Services
# ============================================
print_header "🐳 Iniciando Servicios Docker"

# Check if containers are already running
if docker ps | grep -q "pago-py-postgres" && docker ps | grep -q "pago-py-redis"; then
    print_success "Servicios Docker ya están corriendo"
else
    print_info "Levantando PostgreSQL y Redis..."

    # Stop and remove existing containers if they exist
    docker-compose down 2>/dev/null || true

    # Start services
    docker-compose up -d

    print_info "Esperando a que los servicios estén listos..."
    sleep 5
fi

# Check if containers are running
if docker ps | grep -q "pago-py-postgres"; then
    print_success "PostgreSQL está corriendo"
else
    print_error "PostgreSQL no se inició correctamente"
    exit 1
fi

if docker ps | grep -q "pago-py-redis"; then
    print_success "Redis está corriendo"
else
    print_error "Redis no se inició correctamente"
    exit 1
fi

# ============================================
# Step 3: Install Dependencies (if needed)
# ============================================
print_header "📦 Verificando Dependencias"

if [ ! -d "node_modules" ]; then
    print_info "Instalando dependencias..."
    pnpm install
    print_success "Dependencias instaladas"
else
    print_success "Dependencias ya instaladas"
fi

# ============================================
# Step 4: Setup Prisma
# ============================================
print_header "🗄️  Configurando Base de Datos"

print_info "Generando Prisma Client..."
pnpm exec nx run backend:prisma-generate
print_success "Prisma Client generado"

print_info "Sincronizando schema con base de datos..."
cd apps/backend
npx prisma db push --skip-generate
cd ../..
print_success "Schema sincronizado"

# Optional: Seed database
if [ -f "apps/backend/prisma/seed.ts" ]; then
    read -p "¿Deseas poblar la base de datos con datos de prueba? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Poblando base de datos..."
        if pnpm exec nx run backend:prisma-seed 2>/dev/null; then
            print_success "Base de datos poblada"
        else
            print_warning "Seed no configurado (no es crítico, continúa...)"
        fi
    fi
fi

# ============================================
# Step 5: Check Environment Files
# ============================================
print_header "⚙️  Verificando Archivos de Configuración"

if [ ! -f "apps/backend/.env" ]; then
    print_warning "No se encontró apps/backend/.env"
    print_info "Copiando desde .env.example..."
    cp apps/backend/.env.example apps/backend/.env
    print_warning "IMPORTANTE: Edita apps/backend/.env con tus configuraciones"
fi

if [ ! -f "apps/web/.env" ]; then
    print_warning "No se encontró apps/web/.env"
    print_info "Copiando desde .env.example..."
    cp apps/web/.env.example apps/web/.env
fi

print_success "Archivos de configuración verificados"

# ============================================
# Step 6: Start Services
# ============================================
print_header "🎯 Iniciando Aplicaciones"

# Create logs directory
mkdir -p logs

print_info "Iniciando Backend NestJS..."
print_info "Logs: logs/backend.log"
nohup npx nest start --watch > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > logs/backend.pid
print_success "Backend iniciado (PID: $BACKEND_PID)"

print_info "Esperando a que el backend inicie..."
sleep 10

# Check if backend is running
if curl -s http://localhost:3000/api > /dev/null 2>&1; then
    print_success "Backend está respondiendo"
else
    print_warning "Backend aún no responde, puede necesitar más tiempo..."
fi

print_info "Iniciando Frontend Angular..."
print_info "Logs: logs/frontend.log"
nohup pnpm dev:web > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > logs/frontend.pid
print_success "Frontend iniciado (PID: $FRONTEND_PID)"

# ============================================
# Final Summary
# ============================================
print_header "✅ Stack Iniciado Exitosamente"

echo -e "${GREEN}🎉 Todos los servicios están corriendo!${NC}"
echo ""
echo -e "${BLUE}Servicios Disponibles:${NC}"
echo -e "  ${GREEN}•${NC} PostgreSQL:     localhost:5432"
echo -e "  ${GREEN}•${NC} Redis:          localhost:6381"
echo -e "  ${GREEN}•${NC} Backend API:    ${BLUE}http://localhost:3000/api${NC}"
echo -e "  ${GREEN}•${NC} API Docs:       ${BLUE}http://localhost:3000/api/docs${NC}"
echo -e "  ${GREEN}•${NC} Frontend Web:   ${BLUE}http://localhost:4200${NC}"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  • Backend:  tail -f logs/backend.log"
echo -e "  • Frontend: tail -f logs/frontend.log"
echo -e "  • Docker:   docker-compose logs -f"
echo ""
echo -e "${YELLOW}Para detener todos los servicios:${NC}"
echo -e "  ./scripts/stop-dev.sh"
echo ""

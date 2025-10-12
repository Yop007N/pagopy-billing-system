#!/bin/bash

# ============================================
# PagoPy - Script de Detención
# ============================================
# Este script detiene todos los servicios
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_header() {
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ${1}${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
}

print_header "🛑 PagoPy - Deteniendo Servicios"

# Stop Backend
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    print_info "Deteniendo Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || print_warning "Backend ya estaba detenido"
    rm logs/backend.pid
    print_success "Backend detenido"
else
    print_warning "No se encontró PID del backend"
fi

# Stop Frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    print_info "Deteniendo Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || print_warning "Frontend ya estaba detenido"
    rm logs/frontend.pid
    print_success "Frontend detenido"
else
    print_warning "No se encontró PID del frontend"
fi

# Stop any remaining node/nest processes
print_info "Limpiando procesos residuales..."
pkill -f "nest start" 2>/dev/null || true
pkill -f "nx serve" 2>/dev/null || true

# Stop Docker services
read -p "¿Deseas detener también Docker (PostgreSQL y Redis)? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deteniendo servicios Docker..."
    docker-compose down
    print_success "Docker detenido"
else
    print_info "Docker seguirá corriendo"
fi

print_header "✅ Servicios Detenidos"
echo -e "${GREEN}Todos los servicios han sido detenidos correctamente${NC}"
echo ""

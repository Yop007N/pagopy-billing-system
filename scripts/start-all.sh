#!/bin/bash

# PagoPy - Start All Applications Script
# Starts backend, web, and mobile applications concurrently

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║         PagoPy Development Server             ║"
echo "║      Starting All Applications...             ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker services are running
print_step "Checking Docker services..."

if ! docker ps | grep -q "pago-py-postgres"; then
    print_warning "PostgreSQL container is not running. Starting Docker services..."
    pnpm docker:up
    sleep 5
    print_success "Docker services started"
else
    print_success "Docker services are running"
fi

# Check if tmux is available
if command_exists tmux; then
    print_step "Starting applications using tmux..."

    # Kill existing session if it exists
    tmux has-session -t pagopy 2>/dev/null && tmux kill-session -t pagopy

    # Create new tmux session
    tmux new-session -d -s pagopy -n backend
    tmux send-keys -t pagopy:backend "cd $(pwd) && pnpm dev:backend" C-m

    # Create window for web
    tmux new-window -t pagopy -n web
    tmux send-keys -t pagopy:web "cd $(pwd) && pnpm dev:web" C-m

    # Create window for mobile
    tmux new-window -t pagopy -n mobile
    tmux send-keys -t pagopy:mobile "cd $(pwd) && pnpm dev:mobile" C-m

    print_success "Applications started in tmux session 'pagopy'"
    echo ""
    echo -e "${BLUE}Application URLs:${NC}"
    echo "  • Backend API:  ${GREEN}http://localhost:3000${NC}"
    echo "  • Web App:      ${GREEN}http://localhost:4200${NC}"
    echo "  • Mobile App:   ${GREEN}http://localhost:8100${NC}"
    echo ""
    echo -e "${BLUE}Tmux Commands:${NC}"
    echo "  • Attach to session:     ${GREEN}tmux attach -t pagopy${NC}"
    echo "  • Switch windows:        ${GREEN}Ctrl+b then 0/1/2${NC} or ${GREEN}Ctrl+b n${NC} (next)"
    echo "  • Detach from session:   ${GREEN}Ctrl+b d${NC}"
    echo "  • Kill session:          ${GREEN}tmux kill-session -t pagopy${NC}"
    echo "  • List windows:          ${GREEN}Ctrl+b w${NC}"
    echo ""
    echo -e "${YELLOW}Press Enter to attach to the tmux session...${NC}"
    read -r
    tmux attach -t pagopy

elif command_exists concurrently; then
    print_step "Starting applications using concurrently..."

    npx concurrently \
        --names "BACKEND,WEB,MOBILE" \
        --prefix-colors "blue,green,yellow" \
        --kill-others \
        "pnpm dev:backend" \
        "pnpm dev:web" \
        "pnpm dev:mobile"

else
    print_warning "Neither tmux nor concurrently is installed."
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo "  1. Install tmux (recommended):      ${GREEN}sudo apt install tmux${NC} (Linux) or ${GREEN}brew install tmux${NC} (Mac)"
    echo "  2. Install concurrently:            ${GREEN}pnpm add -g concurrently${NC}"
    echo "  3. Run applications manually:       ${GREEN}pnpm dev${NC} (runs backend + web)"
    echo "     Then in separate terminal:       ${GREEN}pnpm dev:mobile${NC}"
    echo ""

    read -p "Would you like to install concurrently now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Installing concurrently..."
        pnpm add -g concurrently
        print_success "concurrently installed"

        print_step "Starting applications..."
        npx concurrently \
            --names "BACKEND,WEB,MOBILE" \
            --prefix-colors "blue,green,yellow" \
            --kill-others \
            "pnpm dev:backend" \
            "pnpm dev:web" \
            "pnpm dev:mobile"
    else
        print_warning "Using default pnpm dev command (backend + web only)"
        print_warning "Run 'pnpm dev:mobile' in a separate terminal for the mobile app"
        echo ""
        pnpm dev
    fi
fi

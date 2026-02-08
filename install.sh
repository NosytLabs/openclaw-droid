#!/bin/bash
#
# OpenClaw Droid Installer
# One-liner: curl -fsSL https://raw.githubusercontent.com/NosytLabs/openclaw-droid/main/install.sh | bash
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "-------------------------------------------"
echo "      OpenClaw Droid Installer v1.0.0"
echo "-------------------------------------------"
echo -e "${NC}"

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ] && [ -z "$TERMUX_VERSION" ]; then
    echo -e "${YELLOW}Warning:${NC} Not running in Termux - some features may not work"
fi

# Update and install packages
echo -e "\n${BLUE}[1/3]${NC} Installing required packages..."

# Update Termux repositories
echo -e "  ${BLUE}•${NC} Updating Termux repositories..."
pkg update -y || true
pkg upgrade -y || true

echo -e "  ${BLUE}•${NC} Installing dependencies..."
pkg install -y nodejs-lts git proot-distro android-tools termux-api

echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"
echo -e "  ${GREEN}✓${NC} npm $(npm --version)"
echo -e "  ${GREEN}✓${NC} git installed"
echo -e "  ${GREEN}✓${NC} proot-distro installed"
echo -e "  ${GREEN}✓${NC} adb $(adb version | head -n 1)"
echo -e "  ${GREEN}✓${NC} termux-api installed"

# Install openclaw-droid from npm
echo -e "\n${BLUE}[2/3]${NC} Installing OpenClaw Droid..."
npm install -g openclaw-droid

echo -e "\n${BLUE}[3/3]${NC} Verifying Android tools..."
adb start-server >/dev/null 2>&1 || true
adb devices || true

echo -e "\n${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Installation complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run setup:      openclaw setup"
echo "  2. Run onboarding: openclaw onboarding"
echo "     → Select 'Loopback (127.0.0.1)' when asked!"
echo "  3. Start gateway:  openclaw start"
echo ""
echo -e "Dashboard: ${BLUE}http://127.0.0.1:18789${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} Disable battery optimization for Termux in Android settings"
echo -e "${YELLOW}Tip:${NC} Install Termux:API app from F-Droid for camera, wakelock, and sensors"
echo ""

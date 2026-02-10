#!/bin/bash
# OpenClaw Droid Installer - Following Sagar Tamang's Guide Exactly
# https://sagartamang.com/blog/openclaw-on-android-termux

set -e

# Function to handle Termux package errors
fix_termux() {
    echo "⚠️  Detected package manager issues. Attempting to repair..."
    dpkg --configure -a || true
    apt --fix-broken install -y || true
    echo "✅ Repair attempt complete."
}

# 1. Environment Setup - Termux
echo "🔄 Updating Termux packages..."

# Run repair first if previous state was bad
if [ -f /var/lib/dpkg/lock ] || [ -f /var/lib/dpkg/lock-frontend ]; then
    echo "🔒 Removing stale lock files..."
    rm -f /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend
fi
dpkg --configure -a || true

# Try update/upgrade with fallback to repair
pkg update -y || { fix_termux; pkg update -y; }
pkg upgrade -y -o Dpkg::Options::="--force-confnew" || { fix_termux; pkg upgrade -y -o Dpkg::Options::="--force-confnew"; }

pkg install proot-distro -y

# Install & Login to Ubuntu
proot-distro install ubuntu
proot-distro login ubuntu << 'EOF'
#!/bin/bash
set -e

# 2. Install Dependencies
apt update && apt upgrade -y
apt install curl git build-essential -y

# Install Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Install OpenClaw globally
npm install -g openclaw@latest

# 3. The "Bionic Bypass" (Crucial)
cat << 'JS' > /root/hijack.js
const os = require('os');
os.networkInterfaces = () => ({});
JS

# Make it permanent for all OpenClaw commands
echo 'export NODE_OPTIONS="-r /root/hijack.js"' >> ~/.bashrc
source ~/.bashrc

# Export for current session
export NODE_OPTIONS="-r /root/hijack.js"
EOF

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║        INSTALLATION COMPLETE!             ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "Next Steps:"
echo "1. The system will now log you into Ubuntu automatically."
echo "2. Inside Ubuntu, run: openclaw config"
echo "   (Setup Gateway, Models, and Telegram/WhatsApp)"
echo "3. Start the Gateway: openclaw gateway --verbose"
echo ""
echo "Launching Ubuntu..."
sleep 2

# Check if we are running in a terminal and try to attach
if [ -t 0 ]; then
    exec proot-distro login ubuntu
else
    # If run via pipe (curl | bash), try to force TTY
    if [ -e /dev/tty ]; then
        exec proot-distro login ubuntu < /dev/tty
    else
        echo "⚠️  Cannot launch interactive shell (no TTY detected)."
        echo "Please run: proot-distro login ubuntu"
    fi
fi
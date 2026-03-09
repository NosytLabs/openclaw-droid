#!/bin/bash

# Test script for fix_termux in install.sh

# Source the install script
source ./install.sh

# Variables to track mock calls
DPKG_CALLED=0
APT_CALLED=0

# Mock dpkg command
dpkg() {
    DPKG_CALLED=1
    if [[ "$1" == "--configure" && "$2" == "-a" ]]; then
        echo "Mocked: dpkg --configure -a"
        return 1 # Simulate failure to test `|| true`
    fi
    echo "Unexpected dpkg arguments: $@"
    return 1
}

# Mock apt command
apt() {
    APT_CALLED=1
    if [[ "$1" == "--fix-broken" && "$2" == "install" && "$3" == "-y" ]]; then
        echo "Mocked: apt --fix-broken install -y"
        return 1 # Simulate failure to test `|| true`
    fi
    echo "Unexpected apt arguments: $@"
    return 1
}

# Run the function
echo "Running fix_termux..."
fix_termux

# Assertions
if [[ $DPKG_CALLED -eq 1 && $APT_CALLED -eq 1 ]]; then
    echo "✅ TESTS PASSED: fix_termux called both dpkg and apt with expected arguments and handled errors properly."
    exit 0
else
    echo "❌ TESTS FAILED: Commands were not called as expected."
    echo "DPKG_CALLED=$DPKG_CALLED"
    echo "APT_CALLED=$APT_CALLED"
    exit 1
fi

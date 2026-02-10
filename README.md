# OpenClaw Droid v5.2

> **The Simplified Installer** based on [Sagar Tamang's Guide](https://sagartamang.com/blog/openclaw-on-android-termux).

This installer automates the exact steps from the "Bionic Bypass" guide to run OpenClaw on Android using Termux and Ubuntu.

### 📺 Watch the Setup
[![OpenClaw Droid Setup](https://img.youtube.com/vi/g5WMbLM1DYg/0.jpg)](https://www.youtube.com/watch?v=g5WMbLM1DYg)

## Features

- **Strict Adherence**: Follows the blog guide exactly (no extra wrappers or complex logic).
- **Automated Setup**: Installs Node 22, OpenClaw, and the Bionic Bypass automatically.
- **Zero Root**: Runs in Termux + proot-distro.

## Keywords

clawphone, moltbot android, clawdbot, ai agent phone

## Installation

Run this single command in Termux:

```bash
curl -fsSL https://raw.githubusercontent.com/NosytLabs/openclaw-droid/main/install.sh | bash
```

## Manual Steps (What the script does)

1. Updates Termux and installs `proot-distro`.
2. Installs `ubuntu` container.
3. Logs into Ubuntu and installs:
   - `curl`, `git`, `build-essential`
   - `Node.js 22`
   - `openclaw` (global)
4. Creates the **Bionic Bypass** (`/root/hijack.js`):
   ```js
   const os = require('os');
   os.networkInterfaces = () => ({});
   ```
5. Adds `export NODE_OPTIONS="-r /root/hijack.js"` to `.bashrc`.

## Usage

After installation, you will be automatically logged into the Ubuntu environment.

**1. Setup & Configuration:**
Run the configuration wizard to set up your Gateway, LLM Models, and Social Channels (Telegram/WhatsApp):
```bash
openclaw config
```
*   **Gateway Bind**: MUST be `127.0.0.1` (Loopback).
*   **Telegram Pairing**: Select "Telegram" in the menu. You will be prompted to enter your Bot Token and then given a pairing code/link to verify in your Telegram app.

**2. Start Gateway:**
```bash
openclaw gateway --verbose
```

## Resources

- [Sagar Tamang's Original Guide](https://sagartamang.com/blog/openclaw-on-android-termux)
- [OpenClaw Documentation](https://github.com/openclaw/openclaw)
- [Termux Wiki](https://wiki.termux.com/wiki/Main_Page)
- [Node.js on Android](https://nodejs.org/en/docs/guides/nodejs-on-android/)

## Termux Controls & Tips

- **Backing Out / Exit**:
  - To kill a running process (like the gateway): Press `CTRL` + `C`.
  - To exit the Ubuntu shell (back to Termux): Press `CTRL` + `D` (or `CAPS LOCK` + `CTRL` + `D`) or type `exit`.
- **Keyboard Shortcuts**:
  - On touch keyboards, `Volume Down` often acts as `CTRL`.
  - `Volume Up` + `Q` can toggle extra keys row.

## Troubleshooting

- **DPKG/APT Errors**: If installation fails with `dpkg error processing package` or `sub-process returned an error code (1)`:
  - Run `dpkg --configure -a` manually in Termux.
  - Run `apt --fix-broken install`.
  - Re-run the installer.
- **System Error 13**: Ensure `NODE_OPTIONS` is set (`echo $NODE_OPTIONS`). If not, run `source ~/.bashrc`.
- **Gateway Bind Crash**: You MUST select Loopback (127.0.0.1) during onboarding.

## License

MIT
# GitHub Setup for Work Computer

**Purpose:** Quick setup guide to configure GitHub authentication for the `jsince` account on your work computer.

**Account Details:**
- **GitHub Username:** jsince
- **Email:** jeremy@tillerdigital.ca
- **Repository:** https://github.com/jsince/brandmap

---

## Quick Setup (Choose ONE Method)

### Method 1: Personal Access Token (Recommended - Easiest)

#### Step 1: Generate a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Work Computer - BrandMap Deployment`
4. Set expiration: **No expiration** (or your preference)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (if using GitHub Actions)
6. Click **"Generate token"**
7. **COPY THE TOKEN IMMEDIATELY** - you won't see it again!

#### Step 2: Configure Git on Work Computer

Open your terminal and run:

```bash
# Configure git with your GitHub account
git config --global user.name "jsince"
git config --global user.email "jeremy@tillerdigital.ca"

# Set credential helper to store your token
git config --global credential.helper store
```

#### Step 3: Clone the Repository

```bash
cd /path/to/your/projects/folder
git clone https://github.com/jsince/brandmap.git
cd brandmap
```

When prompted for credentials:
- **Username:** `jsince`
- **Password:** `[paste your personal access token here]`

The credentials will be saved automatically, so you won't need to enter them again!

#### Step 4: Verify Setup

```bash
# Test that you can fetch from GitHub
git fetch origin

# If successful, you're all set!
```

---

### Method 2: SSH Key (More Secure, Slightly More Setup)

#### Step 1: Generate SSH Key

```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "jeremy@tillerdigital.ca" -f ~/.ssh/id_ed25519_jsince

# When prompted:
# - Enter file name: ~/.ssh/id_ed25519_jsince (already specified above)
# - Enter passphrase: (press Enter for no passphrase, or create one)
# - Confirm passphrase: (press Enter again, or confirm)
```

#### Step 2: Add SSH Key to SSH Agent

```bash
# Start the ssh-agent
eval "$(ssh-agent -s)"

# Add your SSH private key
ssh-add ~/.ssh/id_ed25519_jsince
```

#### Step 3: Copy Public Key to GitHub

```bash
# Display your public key
cat ~/.ssh/id_ed25519_jsince.pub

# Copy the entire output (starts with ssh-ed25519...)
```

Then:
1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `Work Computer - BrandMap`
4. Key type: `Authentication Key`
5. Paste the public key into the "Key" field
6. Click **"Add SSH key"**

#### Step 4: Configure SSH

Create or edit `~/.ssh/config`:

```bash
# Edit SSH config
nano ~/.ssh/config
```

Add this content:

```
Host github.com-jsince
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_jsince
    IdentitiesOnly yes
```

Save and exit (Ctrl+X, then Y, then Enter).

#### Step 5: Configure Git

```bash
# Set your git identity
git config --global user.name "jsince"
git config --global user.email "jeremy@tillerdigital.ca"
```

#### Step 6: Clone the Repository

```bash
cd /path/to/your/projects/folder
git clone git@github.com-jsince:jsince/brandmap.git
cd brandmap
```

#### Step 7: Verify Setup

```bash
# Test SSH connection
ssh -T git@github.com-jsince

# You should see: "Hi jsince! You've successfully authenticated..."
```

---

## After Setup - Deploy to GitHub Pages

Once authentication is configured, deploying is simple:

```bash
cd /path/to/brandmap

# Install dependencies (first time only)
npm install

# Deploy to GitHub Pages
npm run deploy
```

That's it! The `npm run deploy` command will:
1. Build the production version
2. Push to the `gh-pages` branch
3. Update the live site at https://jsince.github.io/brandmap/

---

## Troubleshooting

### "Permission denied (publickey)" Error

**Solution 1 (Token Method):**
```bash
# Re-enter your credentials
git config --global --unset credential.helper
git config --global credential.helper store
git pull origin main
# Enter username: jsince
# Enter password: [your personal access token]
```

**Solution 2 (SSH Method):**
```bash
# Check if SSH key is loaded
ssh-add -l

# If not loaded, add it:
ssh-add ~/.ssh/id_ed25519_jsince

# Test connection
ssh -T git@github.com-jsince
```

### "Authentication failed" Error

**For Token Method:**
- Your token may have expired
- Generate a new token at https://github.com/settings/tokens
- Update credentials:
  ```bash
  git pull origin main
  # Enter username: jsince
  # Enter password: [new token]
  ```

**For SSH Method:**
- Check that SSH key is added to GitHub: https://github.com/settings/keys
- Verify SSH config in `~/.ssh/config`

### Can't Push to GitHub

```bash
# Verify you're authenticated
git remote -v

# Should show either:
# - https://github.com/jsince/brandmap.git (for token method)
# - git@github.com-jsince:jsince/brandmap.git (for SSH method)

# If wrong, update remote:
# For token method:
git remote set-url origin https://github.com/jsince/brandmap.git

# For SSH method:
git remote set-url origin git@github.com-jsince:jsince/brandmap.git
```

---

## Quick Reference

### Daily Workflow at Work

```bash
# Navigate to project
cd /path/to/brandmap

# Pull latest changes
git pull origin main

# Make your changes
# ... edit files ...

# Test locally
npm run dev
# Visit: http://localhost:5173/brandmap/

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Deploy to live site
npm run deploy
```

### Useful Commands

```bash
# Check current git user
git config user.name
git config user.email

# Check authentication status (token method)
cat ~/.git-credentials

# Check SSH keys (SSH method)
ssh-add -l

# Test GitHub connection
git ls-remote origin
```

---

## What Gets Installed

This setup guide only configures **authentication** for GitHub. You'll also need:

### Required Software (Install if not present)

1. **Git**
   ```bash
   git --version
   # If not installed: sudo apt install git (Linux) or download from git-scm.com
   ```

2. **Node.js & npm**
   ```bash
   node --version
   npm --version
   # If not installed: download from nodejs.org (v18 or higher recommended)
   ```

3. **WSL (if on Windows)**
   - Already installed if you're using Ubuntu on Windows
   - Otherwise, install from Microsoft Store

---

## Summary

**For fastest setup at work, use Method 1 (Personal Access Token):**

1. Generate token: https://github.com/settings/tokens
2. Configure git:
   ```bash
   git config --global user.name "jsince"
   git config --global user.email "jeremy@tillerdigital.ca"
   git config --global credential.helper store
   ```
3. Clone repo: `git clone https://github.com/jsince/brandmap.git`
4. Enter token when prompted
5. Deploy: `npm run deploy`

**Done! You'll be able to deploy from your work computer with no issues.**

---

## Notes

- This setup is **per-computer** - you'll need to do this on each machine
- Personal Access Tokens are **account-wide** - one token works for all repos
- SSH keys are **computer-specific** - each machine needs its own key
- Your credentials are stored securely in your home directory
- The `npm run deploy` command will work identically on both computers once authenticated



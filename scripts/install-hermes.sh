#!/bin/bash

# ============================================================

# Install Felo Skills for Hermes Agent

# ============================================================

# Hermes organizes skills into categories under ~/.hermes/skills/

# These Felo skills all share the same FELO_API_KEY dependency,

# so they're grouped under a single "felo" category.

#

# Usage:

#   git clone https://github.com/Felo-Inc/felo-skills.git

#   bash felo-skills/install-hermes.sh

# ============================================================



set -euo pipefail



SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REPO_DIR="${1:-$SCRIPT_DIR}"

HERMES_SKILLS_DIR="$HOME/.hermes/skills"

FELO_CATEGORY_DIR="$HERMES_SKILLS_DIR/felo"



GREEN='\033[0;32m'

YELLOW='\033[1;33m'

RED='\033[0;31m'

NC='\033[0m'



echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"

echo -e "${GREEN}║   Felo Skills Installer for Hermes Agent ║${NC}"

echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"

echo ""



# Step 0: Validate source directory

if [ ! -f "$REPO_DIR/felo-search/SKILL.md" ]; then

    echo -e "${RED}Error: Cannot find Felo skills at '$REPO_DIR'.${NC}"

    echo "Please provide the path to the felo-skills repository:"

    echo "  bash install-hermes.sh /path/to/felo-skills"

    exit 1

fi



# Step 1: Ensure ~/.hermes/skills/ exists

mkdir -p "$HERMES_SKILLS_DIR"



# Step 2: Create the 'felo' category directory

if [ -d "$FELO_CATEGORY_DIR" ]; then

    echo -e "${YELLOW}Warning: $FELO_CATEGORY_DIR already exists.${NC}"

    echo -e "${YELLOW}  Existing skills will be overwritten.${NC}"

    read -p "  Continue? (y/N) " -n 1 -r

    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then

        echo "Aborted."

        exit 0

    fi

fi



mkdir -p "$FELO_CATEGORY_DIR"



# Step 3: List of skills to install

SKILLS=(

    "felo-search"

    "felo-slides"

    "felo-web-fetch"

    "felo-youtube-subtitling"

    "felo-x-search"

    "felo-livedoc"

    "felo-twitter-writer"

    "felo-superAgent"

    "felo-content-to-slides"

    "felo-mindmap"

    "apple-buy-advisor"

    "doc-image-agent"

)



# Step 4: Copy each skill into the felo category

INSTALLED=0

SKIPPED=0



for skill in "${SKILLS[@]}"; do

    src="$REPO_DIR/$skill"

    dst="$FELO_CATEGORY_DIR/$skill"



    if [ ! -d "$src" ]; then

        echo -e "  ${RED}✗${NC} $skill — source not found, skipping"

        SKIPPED=$((SKIPPED + 1))

        continue

    fi



    cp -r "$src" "$dst"

    echo -e "  ${GREEN}✓${NC} $skill → $dst"

    INSTALLED=$((INSTALLED + 1))

done



echo ""



# Step 5: Make scripts executable

find "$FELO_CATEGORY_DIR" -name "*.sh" -exec chmod +x {} \;

find "$FELO_CATEGORY_DIR" -name "*.mjs" -exec chmod +x {} \;

find "$FELO_CATEGORY_DIR" -name "*.py" -exec chmod +x {} \;



# Step 6.5: Create symlinks at ~/.agents/skills/ so hardcoded

# script paths in SKILL.md (e.g., ~/.agents/skills/felo-search/scripts/...)

# work correctly. This bridges Codex paths to the Hermes install location.

AGENTS_SKILLS_DIR="$HOME/.agents/skills"

mkdir -p "$AGENTS_SKILLS_DIR"

echo -e "\n${YELLOW}Creating symlinks for script path compatibility:${NC}"

for skill in "${SKILLS[@]}"; do

    link="$AGENTS_SKILLS_DIR/$skill"

    target="$FELO_CATEGORY_DIR/$skill"

    ln -sfn "$target" "$link"

    echo -e "  ${GREEN}↗${NC} $link → $target"

done



# Summary

echo ""

echo -e "${GREEN}Done!${NC} Installed $INSTALLED skill(s), skipped $SKIPPED."

echo -e "Skills location: ${GREEN}$FELO_CATEGORY_DIR${NC}"

echo -e "Symlinks location: ${GREEN}$AGENTS_SKILLS_DIR${NC}"

echo ""

echo -e "${YELLOW}Reminder:${NC} Make sure FELO_API_KEY is set in your environment."

echo "  export FELO_API_KEY=\"your-key-here\""
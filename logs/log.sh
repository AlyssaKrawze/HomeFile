#!/bin/bash

LOG_DIR="$(dirname "$0")"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
FILE="$LOG_DIR/$DATE.txt"

# Create the file with a header if it doesn't exist
if [ ! -f "$FILE" ]; then
  echo "$DATE Session Notes" > "$FILE"
  echo "" >> "$FILE"
fi

# If a note was passed as an argument, append it
if [ -n "$1" ]; then
  echo "[$TIME] $*" >> "$FILE"
  echo "Logged: $*"
else
  # No argument — open the file in the default editor
  ${EDITOR:-nano} "$FILE"
fi

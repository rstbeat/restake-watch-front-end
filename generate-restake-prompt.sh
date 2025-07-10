#!/bin/bash
# Generate comprehensive LLM prompt from Restake Watch Frontend project

# Get current date for filename
DATE=$(date +%Y%m%d-%H%M)

# Output filename with timestamp
OUTPUT_FILE="restake-watch-frontend-prompt-${DATE}.txt"

# Generate comprehensive prompt with all essential files for LLM feedback
code2prompt . -O "$OUTPUT_FILE" \
  --include "README.md" \
  --include "package.json" \
  --include "next.config.mjs" \
  --include "tsconfig.json" \
  --include "src/tsconfig.json" \
  --include "tailwind.config.ts" \
  --include "postcss.config.mjs" \
  --include "components.json" \
  --include "src/app/**/*.tsx" \
  --include "src/app/**/*.ts" \
  --include "src/app/globals.css" \
  --include "src/components/**/*.tsx" \
  --include "src/components/**/*.ts" \
  --include "src/hooks/**/*.ts" \
  --include "src/lib/**/*.ts" \
  --include "src/app/interface/**/*.ts" \
  --exclude "node_modules/**" \
  --exclude ".next/**" \
  --exclude "package-lock.json" \
  --exclude "bun.lockb" \
  --exclude "public/**" \
  --exclude ".git/**" \
  --exclude "*.log" \
  --exclude "coverage/**" \
  --exclude "build/**" \
  --exclude "dist/**" \
  --exclude "out/**" \
  --exclude "tmp/**" \
  --exclude "*.DS_Store" \
  --exclude "*.sw?" \
  --exclude "*.pem" \
  --exclude ".vscode/**" \
  --exclude "next-env.d.ts"

echo "Comprehensive Restake Watch Frontend prompt generated: $OUTPUT_FILE"
echo "This includes:"
echo "  ✓ Core Next.js source code (src/app/, src/components/)"
echo "  ✓ Configuration files (next.config.mjs, tsconfig.json, tailwind.config.ts)"
echo "  ✓ TypeScript interfaces and types"
echo "  ✓ Custom hooks and utilities"
echo "  ✓ Documentation (README.md)"
echo "  ✓ UI components (shadcn/ui components)"
echo "  ✓ Styling configuration (globals.css, tailwind, postcss)"
echo "  ✓ Package dependencies (package.json)"
echo ""
echo "File size: $(wc -c < "$OUTPUT_FILE" | numfmt --to=iec)"
echo "Ready for LLM analysis and improvement suggestions!" 
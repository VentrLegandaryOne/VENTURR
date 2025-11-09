#!/bin/bash

echo "=== VENTURR PRODUCTION - FULL-STACK VALIDATION ==="
echo ""

# Database Tables
echo "📊 DATABASE TABLES:"
grep "export const" /home/ubuntu/venturr-production/drizzle/schema.ts | grep "mysqlTable" | awk '{print "  -", $3}' | sort

echo ""

# Routers
echo "🔌 API ROUTERS:"
ls -1 /home/ubuntu/venturr-production/server/routers/*.ts 2>/dev/null | xargs -I {} basename {} .ts | awk '{print "  -", $1}' | sort

echo ""

# Pages
echo "🎨 UI PAGES:"
ls -1 /home/ubuntu/venturr-production/client/src/pages/*.tsx 2>/dev/null | xargs -I {} basename {} .tsx | awk '{print "  -", $1}' | sort

echo ""

# Routes in App.tsx
echo "🛣️  REGISTERED ROUTES:"
grep "Route path" /home/ubuntu/venturr-production/client/src/App.tsx | grep -v "^//" | sed 's/.*path={"//;s/"}.*//' | awk '{print "  -", $1}' | sort

echo ""
echo "=== VALIDATION COMPLETE ==="

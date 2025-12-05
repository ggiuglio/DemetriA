#!/bin/bash

# Script to delete old functions and redeploy with new runtime

set -e

echo "🔄 Redeploying Cloud Functions with Node.js 20"
echo "=============================================="
echo ""

echo "Step 1: Deleting old functions..."
firebase functions:delete geminiChat --region europe-west1 --force || echo "⚠️  geminiChat might not exist"
firebase functions:delete geminiModels --region europe-west1 --force || echo "⚠️  geminiModels might not exist"

echo ""
echo "Step 2: Deploying new functions..."
firebase deploy --only functions

echo ""
echo "✅ Functions redeployed successfully!"

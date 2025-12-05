#!/bin/bash

# Script to make Cloud Functions publicly accessible

echo "Making Cloud Functions publicly accessible..."
echo ""

# You need to run these commands manually in the Firebase Console or with gcloud CLI:
echo "Option 1: Using Firebase Console"
echo "1. Go to: https://console.cloud.google.com/functions/list?project=demetria-b7ee8"
echo "2. Click on 'geminiChatV2'"
echo "3. Go to 'PERMISSIONS' tab"
echo "4. Click 'ADD PRINCIPAL'"
echo "5. Enter 'allUsers' as the principal"
echo "6. Select role 'Cloud Functions Invoker'"
echo "7. Click 'Save'"
echo "8. Repeat for 'geminiModelsV2'"
echo ""

echo "Option 2: Using gcloud CLI (if installed)"
echo "Run these commands:"
echo ""
echo "gcloud functions add-iam-policy-binding geminiChatV2 \\"
echo "  --region=europe-west1 \\"
echo "  --member=allUsers \\"
echo "  --role=roles/cloudfunctions.invoker \\"
echo "  --project=demetria-b7ee8"
echo ""
echo "gcloud functions add-iam-policy-binding geminiModelsV2 \\"
echo "  --region=europe-west1 \\"
echo "  --member=allUsers \\"
echo "  --role=roles/cloudfunctions.invoker \\"
echo "  --project=demetria-b7ee8"
echo ""

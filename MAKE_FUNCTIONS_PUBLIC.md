# Make Cloud Functions Publicly Accessible

Your Cloud Functions are currently returning 403 Forbidden because they're not publicly accessible.

## Quick Fix - Using Google Cloud Console

1. Go to: https://console.cloud.google.com/functions/list?project=demetria-b7ee8

2. For **geminiChatV2**:
   - Click on the function name
   - Go to the **PERMISSIONS** tab
   - Click **GRANT ACCESS** or **ADD PRINCIPAL**
   - In "New principals", enter: `allUsers`
   - In "Select a role", choose: **Cloud Functions Invoker**
   - Click **SAVE**

3. Repeat step 2 for **geminiModelsV2**

## Alternative - Using gcloud CLI

If you have gcloud CLI installed, run:

```bash
gcloud functions add-iam-policy-binding geminiChatV2 \
  --region=europe-west1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=demetria-b7ee8

gcloud functions add-iam-policy-binding geminiModelsV2 \
  --region=europe-west1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=demetria-b7ee8
```

## Test After Making Public

Test the function with:

```bash
curl -X POST https://europe-west1-demetria-b7ee8.cloudfunctions.net/geminiChatV2 \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, test message"}'
```

You should get a JSON response instead of a 403 error.

## Security Note

Making functions public with `allUsers` means anyone can call them. This is fine for your use case since:
- The Gemini API key is stored securely in Firebase config
- The functions have CORS enabled for your domain
- There's no sensitive data being exposed

If you want to add rate limiting or authentication later, you can implement that in the function code.

# Sample Files and Expected Outputs

This directory contains sample files and expected analysis results for testing the vulnerability scanner.

## Sample Files

### test.pdf
A simple PDF file with basic content. Expected to show low risk with minimal signals.

### macro.docm
A Word document with macro indicators (synthetic). Expected to trigger macro detection signals and raise risk score to ≥60.

### suspicious.js
A JavaScript file with obfuscated code patterns. Expected to trigger obfuscation signals.

### test.exe
A small executable file (synthetic). Expected to trigger executable detection signals.

## Sample URLs

### https://example.com
A legitimate website. Expected classification: "LIKELY_GENUINE" with confidence ≥70.

### http://secure-paypal.com.verify-login.co/index.html
A crafted suspicious URL. Expected classification: "SUSPICIOUS" with confidence ≥80 due to:
- Look-alike domain patterns
- Missing SSL
- Suspicious keywords

## Expected Outputs

Each sample has a corresponding JSON file showing the expected analysis result structure.

## Testing

Use these samples to verify the scanner is working correctly:

```bash
# Test file analysis
curl -X POST -F "file=@samples/test.pdf" http://localhost:8000/api/files/scan

# Test URL analysis
curl -X POST -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  http://localhost:8000/api/urls/check
```

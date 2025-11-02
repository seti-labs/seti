# Package Updates for Frame Support

## Dependencies to Add

Run these commands manually:

```bash
cd /Users/mac/Works/SetLabs/seti

# Required for Frame API
npm install --save-dev @vercel/node @vercel/og

# Optional: For Base wallet support (install when ready)
npm install viem wagmi @rainbow-me/rainbowkit
```

## Updated package.json

Add to your `devDependencies`:

```json
{
  "devDependencies": {
    "@vercel/node": "^3.0.0",
    "@vercel/og": "^0.6.0"
  }
}
```

Optional (for Base wallet support):

```json
{
  "dependencies": {
    "viem": "^2.9.0",
    "wagmi": "^2.5.0",
    "@rainbow-me/rainbowkit": "^2.0.0"
  }
}
```

## Install Command

```bash
npm install --save-dev @vercel/node @vercel/og
```


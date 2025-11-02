# Production RPC Configuration

## Current Setup

The application is configured for production use with optimized RPC endpoints and performance settings.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Production: Your Alchemy API key (recommended for best performance)
VITE_ALCHEMY_API_KEY=your_actual_api_key_here

# Production RPC endpoints
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_FALLBACK_RPC=https://base-sepolia.public.blastapi.io
```

### RPC Priority

1. **Alchemy API** (if `VITE_ALCHEMY_API_KEY` is set)
2. **Custom RPC** (if `VITE_BASE_SEPOLIA_RPC` is set)
3. **Fallback RPC** (if `VITE_FALLBACK_RPC` is set)
4. **Default Production RPC** (`https://sepolia.base.org`)

### Production RPC Endpoints

- `https://sepolia.base.org` (Official Base Sepolia RPC)
- `https://base-sepolia.public.blastapi.io` (BlastAPI production endpoint)
- `https://base-sepolia.drpc.org` (DRPC production endpoint)

### Production Performance Settings

- **Optimized polling**: Balance checks every 30 seconds to 2 minutes
- **Production caching**: Balance data cached for 15 seconds to 1 minute
- **Batch requests**: Up to 50 calls batched together
- **Production retries**: 3 retry attempts with 1-second delays
- **Error handling**: Graceful fallbacks with user-friendly messages

### Getting Production Alchemy API Key

1. Go to [Alchemy](https://www.alchemy.com/)
2. Create a production account
3. Create a new app for Base Sepolia
4. Copy the API key
5. Add it to your `.env.local` file as `VITE_ALCHEMY_API_KEY=your_actual_key`

### Production Deployment

For production deployment, ensure you have:
- Valid Alchemy API key for optimal performance
- Production RPC endpoints configured
- Environment variables properly set
- Error monitoring in place

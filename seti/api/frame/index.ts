/**
 * Farcaster Frame API Endpoints
 * Deploy this as serverless functions (Vercel/Netlify) or run with Express
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
};

const FRAME_URL = process.env.VITE_FRAME_URL || "https://seti-mvp.vercel.app";

interface FrameRequest {
  untrustedData: {
    fid: number;
    buttonIndex: number;
    inputText?: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: FrameRequest = req.body;
    const { buttonIndex } = body.untrustedData;

    // Route based on button clicked
    switch (buttonIndex) {
      case 1:
        // View Markets
        return res.status(200).send(
          getFrameHtml({
            image: `${FRAME_URL}/api/og/markets`,
            buttons: [
              { label: "← Back" },
              { label: "Market 1" },
              { label: "Market 2" },
              { label: "Next →" },
            ],
            postUrl: `${FRAME_URL}/api/frame/markets`,
          })
        );

      case 2:
        // Portfolio
        return res.status(200).send(
          getFrameHtml({
            image: `${FRAME_URL}/api/og/portfolio?fid=${body.untrustedData.fid}`,
            buttons: [
              { label: "← Back" },
              { label: "Refresh" },
              { label: "Markets" },
            ],
            postUrl: `${FRAME_URL}/api/frame`,
          })
        );

      case 3:
        // About
        return res.status(200).send(
          getFrameHtml({
            image: `${FRAME_URL}/api/og/about`,
            buttons: [
              { label: "← Back" },
              { label: "Markets" },
            ],
            postUrl: `${FRAME_URL}/api/frame`,
          })
        );

      default:
        // Home screen
        return res.status(200).send(
          getFrameHtml({
            image: `${FRAME_URL}/api/og`,
            buttons: [
              { label: "📊 Markets" },
              { label: "💼 Portfolio" },
              { label: "ℹ️ About" },
            ],
            postUrl: `${FRAME_URL}/api/frame`,
          })
        );
    }
  } catch (error) {
    console.error('Frame error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getFrameHtml(options: {
  image: string;
  buttons: { label: string }[];
  postUrl: string;
  input?: string;
}): string {
  const { image, buttons, postUrl, input } = options;

  const buttonTags = buttons
    .map((btn, idx) => `    <meta property="fc:frame:button:${idx + 1}" content="${btn.label}" />`)
    .join('\n');

  const inputTag = input
    ? `    <meta property="fc:frame:input:text" content="${input}" />`
    : '';

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${image}" />
    <meta property="fc:frame:post_url" content="${postUrl}" />
${buttonTags}
${inputTag}
    <meta property="og:image" content="${image}" />
    <meta property="og:title" content="Seti - Prediction Markets on Base" />
  </head>
  <body>
    <h1>Seti Frame</h1>
  </body>
</html>
  `;
}


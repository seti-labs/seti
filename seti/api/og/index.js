/**
 * Open Graph Image Generation for Farcaster Frames
 * Uses @vercel/og to generate dynamic images
 */

const { ImageResponse } = require('@vercel/og');

// Configure runtime for Vercel
exports.config = {
  runtime: 'nodejs',
};

module.exports = async function handler(req, res) {
  try {
    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 40,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 80,
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: 20,
                      },
                      children: '🔮 Seti',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 40,
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: 40,
                      },
                      children: 'Prediction Markets on Base',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        gap: 40,
                        marginTop: 40,
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              padding: 30,
                              width: 200,
                            },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { fontSize: 60 },
                                  children: '📊',
                                },
                              },
                              {
                                type: 'div',
                                props: {
                                  style: {
                                    fontSize: 24,
                                    color: 'white',
                                    marginTop: 15,
                                  },
                                  children: 'Browse Markets',
                                },
                              },
                            ],
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              padding: 30,
                              width: 200,
                            },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { fontSize: 60 },
                                  children: '🎯',
                                },
                              },
                              {
                                type: 'div',
                                props: {
                                  style: {
                                    fontSize: 24,
                                    color: 'white',
                                    marginTop: 15,
                                  },
                                  children: 'Place Bets',
                                },
                              },
                            ],
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              padding: 30,
                              width: 200,
                            },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { fontSize: 60 },
                                  children: '💰',
                                },
                              },
                              {
                                type: 'div',
                                props: {
                                  style: {
                                    fontSize: 24,
                                    color: 'white',
                                    marginTop: 15,
                                  },
                                  children: 'Win Rewards',
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: 24,
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginTop: 60,
                      },
                      children: 'Built on Base ⛓️ | Powered by Farcaster 🟪',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG image error:', error);
    return res.status(500).json({ error: 'Error generating image' });
  }
};

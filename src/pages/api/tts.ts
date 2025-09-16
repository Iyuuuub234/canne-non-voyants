import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, lang } = req.body;

        // Utiliser un service TTS comme Azure, Google Cloud, ou Amazon Polly
        // Voici un exemple avec un service gratuit (à remplacer par votre solution)
        const response = await fetch(`https://api.voicerss.org/?key=${process.env.TTS_API_KEY}&hl=${lang}&src=${encodeURIComponent(text)}`);

        if (!response.ok) throw new Error('TTS service error');

        const audioBuffer = await response.arrayBuffer();

        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('TTS API error:', error);
        res.status(500).json({ error: 'TTS conversion failed' });
    }
}
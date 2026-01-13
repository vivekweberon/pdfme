const express = require('express');
const cors = require('cors');
const path = require('path');
const { generate } = require('@pdfme/generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Serve static files from the playground build
const playgroundPath = path.join(__dirname, '../playground/dist');
app.use(express.static(playgroundPath));

// API Endpoint for PDF Generation
app.post('/api/generate', async (req, res) => {
    try {
        const { template, inputs } = req.body;

        if (!template || !inputs) {
            return res.status(400).json({ error: 'Missing template or inputs' });
        }

        const pdf = await generate({ template, inputs });

        // Use Buffer.from for node environment if generate returns Uint8Array
        const pdfBuffer = Buffer.from(pdf.buffer || pdf);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Catch-all route for SPA client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(playgroundPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

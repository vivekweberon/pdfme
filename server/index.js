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

// Helper function to parse CSV string
const parseCsv = (csvText) => {
    // Remove BOM if present
    const cleanText = csvText.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));

        const record = {};
        headers.forEach((header, index) => {
            record[header] = values[index] !== undefined ? values[index] : '';
        });
        records.push(record);
    }
    return records;
};

// Helper function to map CSV records to PDFme inputs
const mapRecordsToInputs = (template, records) => {
    return records.map((record) => {
        const input = {};
        template.schemas.forEach((page) => {
            Object.entries(page).forEach(([key, schema]) => {
                const schemaName = schema.name || key;
                const type = (schema.type || '').toLowerCase();
                const isMultiVariable = type === 'multivariabletext' || type === 'multi-variable text';
                const isQR = type === 'qrcode' || type === 'qr' || type.includes('qrcode') || type.includes('qr');

                if (isMultiVariable && schema.variables) {
                    const variableMap = {};
                    schema.variables.forEach((variable) => {
                        const val = record[variable] !== undefined ? record[variable] :
                            Object.entries(record).find(([k]) => k.toLowerCase() === variable.toLowerCase())?.[1];
                        variableMap[variable] = (val !== undefined && val.trim() !== '') ? val : ' ';
                    });
                    input[schemaName] = JSON.stringify(variableMap);
                } else {
                    let recordValue = record[schemaName] !== undefined ? record[schemaName] :
                        Object.entries(record).find(([k]) => k.toLowerCase() === schemaName.toLowerCase())?.[1];

                    if (isQR && recordValue === undefined) {
                        recordValue = record['qrcode'] || record['qr'] ||
                            Object.entries(record).find(([k]) => k.toLowerCase() === 'qrcode' || k.toLowerCase() === 'qr')?.[1];
                    }

                    input[schemaName] = recordValue !== undefined ? recordValue : (schema.content || '');
                }
            });
        });
        return input;
    });
};

// API Endpoint for PDF Generation
app.post('/api/generate', async (req, res) => {
    try {
        let { template, inputs, csv } = req.body;

        if (!template) {
            return res.status(400).json({
                error: 'Missing "template". Please provide the template JSON object.'
            });
        }

        // If CSV is provided, parse it and map to inputs
        if (csv) {
            try {
                const records = parseCsv(csv);
                if (records.length === 0) {
                    return res.status(400).json({ error: 'CSV provided but no valid records found.' });
                }
                inputs = mapRecordsToInputs(template, records);
            } catch (err) {
                return res.status(400).json({ error: `Failed to parse CSV: ${err.message}` });
            }
        }

        if (!inputs || inputs.length === 0) {
            return res.status(400).json({
                error: 'Missing inputs. Please provide either "inputs" array or "csv" string.'
            });
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

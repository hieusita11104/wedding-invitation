const { getWeddingSayings } = require('../services/google/sheetsService');
const { getAIGeneratedRecommendation } = require('../services/ai/aiService');

// Test endpoint to check Google Sheets connection
async function testGoogleSheets(req, res) {
    try {
        const data = await getWeddingSayings();
        if (data && data.length > 0) {
            res.json({
                success: true,
                message: 'Successfully connected to Google Sheets',
                dataCount: data.length,
                sampleData: data
            });
            console.log(data);
        } else {
            res.json({
                success: false,
                message: 'Connected to Google Sheets but no data found'
            });
        }
    } catch (error) {
        console.error('Error testing Google Sheets connection:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect to Google Sheets',
            error: error.message
        });
    }
}

// Test endpoint for Google AI
async function testGoogleAI(req, res) {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a prompt in the request body'
        });
    }

    try {
        const googleSheetData = await getWeddingSayings();
        const recommendation = await getAIGeneratedRecommendation(prompt, googleSheetData);
        
        res.json({
            success: true,
            message: 'Successfully connected to Google AI',
            prompt: prompt,
            response: recommendation,
            debug: {
                totalData: googleSheetData.length,
                sampleData: googleSheetData.slice(0, 3),
                filteredData: googleSheetData.filter(item => 
                    item.category.toLowerCase().includes(prompt.toLowerCase())
                )
            }
        });
    } catch (error) {
        console.error('Error testing Google AI connection:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to connect to Google AI',
            error: error.message
        });
    }
}

// Recommend wedding saying endpoint
async function recommendWeddingSaying(req, res) {
    const { categoryPrompt } = req.body;

    if (!categoryPrompt) {
        return res.status(400).json({ error: 'Missing category prompt' });
    }

    try {
        const googleSheetData = await getWeddingSayings();
        const recommendation = await getAIGeneratedRecommendation(categoryPrompt, googleSheetData);
        res.json({ recommendation });
    } catch (error) {
        console.error('Error in recommend-wedding-saying API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    testGoogleSheets,
    testGoogleAI,
    recommendWeddingSaying
}; 
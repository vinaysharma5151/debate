const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Add these environment variables
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://yourusername.github.io';

// Update CORS configuration
app.use(cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Add this near the top of server.js, after the imports
const DEBATE_TOPICS = {
    Technology: [
        { id: "tech1", name: "Artificial Intelligence Ethics" },
        { id: "tech2", name: "Cybersecurity vs Privacy" },
        { id: "tech3", name: "Social Media Regulation" },
        { id: "tech4", name: "Automation and Employment" }
    ],
    Environment: [
        { id: "env1", name: "Climate Change Solutions" },
        { id: "env2", name: "Renewable Energy" },
        { id: "env3", name: "Wildlife Conservation" },
        { id: "env4", name: "Sustainable Cities" }
    ],
    Society: [
        { id: "soc1", name: "Universal Basic Income" },
        { id: "soc2", name: "Education Reform" },
        { id: "soc3", name: "Healthcare Systems" },
        { id: "soc4", name: "Immigration Policy" }
    ],
    Politics: [
        { id: "pol1", name: "Electoral System Reform" },
        { id: "pol2", name: "Global Governance" },
        { id: "pol3", name: "Freedom of Speech" },
        { id: "pol4", name: "Media Regulation" }
    ]
};

// Fact checking endpoint using a simpler approach with free model
app.post('/api/fact-check', async (req, res) => {
    try {
        const { statement, topic } = req.body;

        // Using HuggingFace's free inference API
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            {
                headers: {
                    "Authorization": "Bearer hf_abcd1234..." // Replace with your actual token
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: statement,
                    parameters: {
                        candidate_labels: ["true", "false", "uncertain"]
                    }
                }),
            }
        );

        const result = await response.json();

        // Process the result
        const isFactual = result.labels[0] === "true";
        let explanation = "Based on analysis of the statement";
        
        // Create a more detailed explanation based on the confidence scores
        if (result.scores[0] > 0.7) {
            explanation += " with high confidence";
        } else if (result.scores[0] > 0.5) {
            explanation += " with moderate confidence";
        } else {
            explanation += " with low confidence";
        }

        const factCheckResult = {
            isFactual: isFactual,
            explanation: explanation,
            sources: "Analysis performed using natural language processing"
        };

        res.json(factCheckResult);

    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ 
            error: 'Error checking fact', 
            details: error.message
        });
    }
});

// Add this new endpoint before app.listen()
app.get('/api/topics', (req, res) => {
    res.json(DEBATE_TOPICS);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
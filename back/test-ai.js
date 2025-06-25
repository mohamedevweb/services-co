import fetch from 'node-fetch';

const testPrompt = `
Je suis Jean Dupont, développeur full-stack avec 5 ans d'expérience basé à Paris. 
Je maîtrise React, Node.js, TypeScript et Python. 
J'ai un Master en informatique (Bac+5) et j'ai travaillé chez Google et Microsoft. 
Je parle français, anglais et espagnol. 
Mon TJM est de 600€.
`;

async function testAIRoute() {
    try {
        const response = await fetch('http://localhost:3001/ai/presta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: testPrompt
            })
        });

        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error testing AI route:', error);
    }
}

testAIRoute(); 
const language = require('@google-cloud/language');
const { spawn } = require('child_process');

async function getSentiment(str) {
    // Creates a client
    const client = new language.LanguageServiceClient();

    // Prepares a document, representing the provided text
    const document = {
    content: str,
    type: 'PLAIN_TEXT',
    };

    // Detects the sentiment of the document
    const [result] = await client.analyzeSentiment({document});

    const sentiment = result.documentSentiment;

    const sentences = result.sentences;

    return sentiment.score
}

async function getSummary(str) {
    var exe = spawn(process.env.SUMMARIZER_PATH);

    exe.stdin.write(str);
    exe.stdin.end();

    exe.on('exit', (code) => {
        console.log(`Summary finished with code ${code}`);
    });

    return new Promise((resolve, reject) => {
        exe.stdout.on("data", (data) => {
            resolve(data.toString());
        });
    });
}

module.exports = { getSentiment, getSummary }
const { YoutubeTranscript } = require('youtube-transcript');

const test = async () => {
    try {
        const url = 'https://www.youtube.com/watch?v=M7lc1UVf-VE'; // Developer Keynote (usually has captions)
        console.log(`Testing fetch for: ${url}`);
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        console.log('Success! Transcript length:', transcript.length);
        console.log('First line:', transcript[0].text);
    } catch (err) {
        console.error('Failed:', err.message);
        if (err.message.includes('Consult the documentation')) {
            console.log('This usually means captions are disabled or blocking requests.');
        }
    }
};

test();

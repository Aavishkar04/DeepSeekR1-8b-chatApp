import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 3001;


app.use(cors());
app.use(express.json());


app.post('/ask-ollama', async (req, res) => {
  try {
    const { prompt } = req.body;

    
    const response = await axios.post(
      'http://127.0.0.1:11435/api/generate',
      {
        model: 'deepseek-r1:8b', 
        prompt: prompt,
      },
      {
        responseType: 'stream', 
      }
    );
    console.log(response);

    let fullResponse = '';

    // Handle streamed data
    response.data.on('data', (chunk) => {
      const json = JSON.parse(chunk.toString()); 
      fullResponse += json.response; 
    });

    // Handle stream end
    response.data.on('end', () => {
      console.log(fullResponse); 
      res.json({ response: fullResponse });
    });

    // Handle errors
    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Error processing Ollama response' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error communicating with Ollama' });
  }
});


app.get('/', (req, res) => {
  res.send('Hello from the server!');
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
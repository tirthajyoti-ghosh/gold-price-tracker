import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const port = 3000;

app.get('/', async (req, res) => {
  const start = req.query.start as string;
  const end = req.query.end as string;

  if (!start || !end) {
    return res.status(400).send('Please provide start and end date');
  }

  const formattedStart = start.slice(0, 10);
  const formattedEnd = end.slice(0, 10);

  try {
    const response = await axios.get(`https://api.nbp.pl/api/cenyzlota/${formattedStart}/${formattedEnd}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res.send(response.data);
  } catch (error) {
    console.log(error);
    
    res.status(500).send('Something went wrong');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

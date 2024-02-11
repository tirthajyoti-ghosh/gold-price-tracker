import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const port = 3000;

function splitDates(start: Date, end: Date): Array<{start: Date, end: Date}> {
  const oneDay = 1000 * 60 * 60 * 24;
  const oneYear = oneDay * 365;
  let currentStart = start;
  let currentEnd = new Date(currentStart.getTime() + oneYear);
  const dateRanges = [];

  while (currentEnd < end) {
    dateRanges.push({ start: currentStart, end: currentEnd });
    currentStart = new Date(currentEnd.getTime() + oneDay);
    currentEnd = new Date(currentStart.getTime() + oneYear);
  }

  if (currentStart <= end) {
    dateRanges.push({ start: currentStart, end: currentEnd > end ? end : currentEnd });
  }

  return dateRanges;
}

app.get('/', async (req, res) => {
  const start = req.query.start as string;
  const end = req.query.end as string;

  if (!start || !end) {
    return res.status(400).send('Please provide start and end date');
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  
  if (diffYears > 5) {
    return res.status(400).send('The difference between start and end date should not exceed 5 years');
  }
  
  const dateRanges = splitDates(startDate, endDate);

  try {
    const responses = await Promise.all(dateRanges.map(range => {
      const formattedStart = range.start.toISOString().slice(0, 10);
      const formattedEnd = range.end.toISOString().slice(0, 10);
      return axios.get(`https://api.nbp.pl/api/cenyzlota/${formattedStart}/${formattedEnd}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }));

    const data = responses.flatMap(response => response.data);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Read JSON file
const readFile = () => {
  const rawData = fs.readFileSync('./database/radiostation.json');
  return JSON.parse(rawData);
};

// Write to JSON file
const writeFile = (data) => {
  fs.writeFileSync('./database/radiostation.json', JSON.stringify(data, null, 2));
};

// Get all stations
app.get('/radio', (req, res) => {
  const stations = readFile().stations;
  res.json(stations);
});

// Get station by id
app.get('/radio/:id', (req, res) => {
  const stations = readFile().stations;
  const station = stations.find((s) => s.id === parseInt(req.params.id));
  if (!station) return res.status(404).json({ message: 'Station not found' });
  res.json(station);
});

// Create new station
app.post('/radio', (req, res) => {
  const { name, stream_url } = req.body;
  if (!name || !stream_url) {
    return res.status(400).json({ message: 'Please provide name and stream_url' });
  }

  const stations = readFile();
  const newStation = {
    id: stations.stations.length + 1,
    name,
    stream_url
  };

  stations.stations.push(newStation);
  writeFile(stations);
  res.status(201).json(newStation);
});

// Update station
app.put('/radio/:id', (req, res) => {
  const { name, stream_url } = req.body;
  if (!name || !stream_url) {
    return res.status(400).json({ message: 'Please provide name and stream_url' });
  }

  const stations = readFile();
  const index = stations.stations.findIndex((s) => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Station not found' });

  stations.stations[index] = { id: parseInt(req.params.id), name, stream_url };
  writeFile(stations);
  res.json(stations.stations[index]);
});

// Delete station
app.delete('/radio/:id', (req, res) => {
    const stations = readFile();
    const index = stations.stations.findIndex((s) => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Station not found' });
  
    stations.stations.splice(index, 1);
    
    // Renumber IDs
    stations.stations.forEach((station, i) => {
      station.id = i + 1;
    });
  
    writeFile(stations);
    res.json({ message: 'Station deleted successfully' });
  });
  
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Next update rest api on swegger
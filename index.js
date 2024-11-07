const express = require('express');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('ytsr');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

// Serve the HTML page at the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/formats', async (req, res) => {
  const url = req.query.url;

  if (!ytdl.validateID(url) && !url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    res.json(info.formats);
  } catch (error) {
    res.status(500).send('Error retrieving formats');
  }
});

app.get('/download', async (req, res) => {
  const url = req.query.url;
  const itag = req.query.itag;

  if (!ytdl.validateID(url) && !url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
    return res.status(400).send('Invalid URL');
  }

  if (!itag) {
    return res.status(400).send('Format (itag) is required');
  }

  try {
    const info = await ytdl.getInfo(url);
    const formatInfo = ytdl.chooseFormat(info.formats, { quality: itag });
    if (!formatInfo.url) {
      return res.status(500).send('Unable to retrieve download link');
    }
    res.redirect(formatInfo.url);
  } catch (error) {
    res.status(500).send('Error processing download');
  }
});

app.get('/playlist', async (req, res) => {
  const url = req.query.url;

  if (!ytpl.validateID(url)) {
    return res.status(400).send('Invalid Playlist URL');
  }

  try {
    const playlist = await ytpl(url);
    res.json(playlist.items.map(item => ({
      title: item.title,
      url: item.shortUrl
    })));
  } catch (error) {
    res.status(500).send('Error retrieving playlist');
  }
});

app.get('/thumbnail', async (req, res) => {
  const url = req.query.url;

  if (!ytdl.validateID(url) && !ytpl.validateID(url) && !url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    res.json({ thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url });
  } catch (error) {
    res.status(500).send('Error retrieving thumbnail');
  }
});

app.get('/metadata', async (req, res) => {
  const url = req.query.url;

  if (!ytdl.validateID(url) && !ytpl.validateID(url) && !url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    res.json({
      title: info.videoDetails.title,
      length: info.videoDetails.lengthSeconds,
      description: info.videoDetails.description
    });
  } catch (error) {
    res.status(500).send('Error retrieving metadata');
  }
});

app.get('/search', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).send('Search query is required');
  }

  try {
    const searchResults = await ytsr(query, { limit: 10 });
    res.json(searchResults.items
      .filter(item => item.type === 'video')
      .map(video => ({
        title: video.title,
        url: video.url,
        thumbnail: video.bestThumbnail.url
      }))
    );
  } catch (error) {
    res.status(500).send('Error retrieving search results');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

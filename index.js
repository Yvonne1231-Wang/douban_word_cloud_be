const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const { getReviews } = require('./clawer');


const app = express();
app.use(cors());
const port = 3000;

app.get('/getMovieId', async (req, res) => {
    const movieName = req.query.movieName;
    try {
        const response = await axios.get(`https://search.douban.com/movie/subject_search?search_text=${encodeURI(movieName)}`);
        const $ = cheerio.load(response.data);
        const movieId = $('.item-root').first().attr('data-id'); // 这里的选择器基于豆瓣的页面结构，可能需要更新
        res.json({ movieId });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/getWordCloudData', async (req, res) => {
    const movieId = req.query.movieId;
    try {
        let wordCloudData = await getReviews(movieId)
        res.json({ wordCloudData });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
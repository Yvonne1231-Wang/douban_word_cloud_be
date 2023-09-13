
const movieId = '35672437';


const pageNum = 10;

const axios = require('axios');
const cheerio = require('cheerio');
const nodejieba = require("nodejieba");
const fs = require('fs');



const fetchMovieShortReviews = async (movieId, start = 0) => {
    const url = `https://movie.douban.com/subject/${movieId}/comments?start=${start}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const reviews = [];

        $('.comment-item').each((index, element) => {
            const user = $(element).find('.comment-info a').text().trim();
            const content = $(element).find('.comment .short').text().trim();

            reviews.push({ user, content });
        });

        return reviews;
    } catch (error) {
        console.error(error);
    }
}

const fetchMultiplePagesReviews = async (movieId, pages) => {
    let allReviews = [];

    for (let i = 0; i < pages; i++) {
        const reviews = await fetchMovieShortReviews(movieId, i * 20);
        allReviews = allReviews.concat(reviews);
        // 为防止请求频率过高，每次请求间隔 1 秒
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return allReviews;
}


const getReviews = async (movieId) => {
    const reviews = [];

    let reviewArray = await fetchMultiplePagesReviews(movieId, pageNum);
    reviewArray.forEach(item => {
        reviews.push(item.content);
    });
    const reviewsLen = reviews.length;

    let wordFrequency = {};
    let stopWords = new Set(["的", "和", "是"]); // 填充你的停用词列表
    reviews.forEach(review => {
        const extract = nodejieba.cut(review);

        extract.forEach(word => {
            if (!stopWords.has(word) && word.length > 2) { // 只处理非停用词且长度大于2的词
                if (word in wordFrequency) {
                    wordFrequency[word]++;
                } else {
                    wordFrequency[word] = 1;
                }
            }
        });
    });


    // 转化为词云库需要的格式
    let wordCloudData = [];
    for (let word in wordFrequency) {
        wordCloudData.push([word, wordFrequency[word]]);
    }
    return wordCloudData;

    // fs.writeFile('wordCloudData.txt', JSON.stringify(wordCloudData), (err) => {
    //     if (err) throw err;
    //     console.log('数据已被写入wordCloudData文件，共', reviewsLen, '条数据');
    // });
}

module.exports = {
    getReviews,
};
// getReviews(movieId);


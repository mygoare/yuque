const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let weeklies = [],
    articles = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/articles.json')).toString()),
    oldWeeklies = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/weeklies.json')).toString());

const weeklyUrl = 'https://www.yuque.com/wanyanshaoxue/qx05nt';
const headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
};



request({
    uri: weeklyUrl,
    headers,
})
.then(async body => {

    const re = /window.appData = (.*)\;/;
    const appData = eval(body.match(re)[1]);

    // console.log(appData)

    const { id: bookId, toc, slug: bookSlug } = appData.book;

    /*
        读取 weeklies，对比之后仅增量 抓取，获得 data
        读取 articles.json，push data into，去重，按 field id倒叙排序
        最后写入 articles.json 和 weeklies.json
    */
    weeklies = _.map(toc, (value, key)=> {
        let {id, title, url: weeklySlug} = value;
        return {id,title, slug: weeklySlug}
    });
    let weekilesSlugs = _.map(weeklies, 'slug');
    let oldWeekliesSlugs = _.map(oldWeeklies, 'slug');

    const diffWeekliesSlugs = _.difference(weekilesSlugs, oldWeekliesSlugs);

    for (let k = 0; k < diffWeekliesSlugs.length;  k++) {
        let weeklySlug = diffWeekliesSlugs[k];

        // https://www.yuque.com/api/docs/yzbe5z?book_id=168046
        let uri = `https://www.yuque.com/api/docs/${weeklySlug}?book_id=${bookId}`;

        let article = await grabArticles(uri);
        // todo: articles 的去重
        // 每期更新的第一期在前
        articles = article.concat(articles);
        // console.log(articles)
    }

    // 返回增量的 articles
    async function grabArticles(uri) {
        return await request({
            uri,
            headers,
        })
            .then(res => {
                let data = [];
                // return json string
                let j = JSON.parse(res);

                let { title, content, slug: weeklySlug, id } = j.data;

                console.log(title, weeklySlug);

                const $ = cheerio.load(content);

                const anchors = $('h3').filter((i, el) => {
                    return $(el).attr('id').length && $(el).text().trim()
                });
                // console.log(anchors)

                anchors.each((i, el)=> {

                    const articleAnchorId = $(el).attr('id');
                    const articleTitle = $(el).text();
                    const articleUrl = `https://www.yuque.com/wanyanshaoxue/${bookSlug}/${weeklySlug}#${articleAnchorId}`;

                    console.log(articleTitle, articleUrl);

                    data.push({
                        title: articleTitle,
                        link: articleUrl,
                        weekly_slug: weeklySlug,
                        catalog: i
                    })
                });

                return data

                // 文章链接
                // book => weekly => article
                // https://www.yuque.com/wanyanshaoxue/qx05nt/pgl8rl#pHm3j
                // https://www.yuque.com/wanyanshaoxue/qx05nt/yzbe5z#8af1aabb
            })
    }


    console.log('weekiles: ', weeklies);
    console.log('articles: ', articles);

    fs.writeFileSync(path.resolve(__dirname, 'data/weeklies.json'), JSON.stringify(weeklies, null, 2), 'utf-8');
    fs.writeFileSync(path.resolve(__dirname, 'data/articles.json'), JSON.stringify(articles, null, 2), 'utf-8');
});

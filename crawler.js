const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

let weeklies = [], 
    articles = []

const weeklyUrl = 'https://www.yuque.com/wanyanshaoxue/qx05nt';
const headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
}

request({
    uri: weeklyUrl,
    headers,
})
.then(async body => {

    const re = /window.appData = (.*)\;/
    const appData = eval(body.match(re)[1])

    // console.log(appData)

    const { id: bookId, toc, slug: bookSlug } = appData.book

    for (let k = 0; k < toc.length;  k++) 
    {
        let el = toc[k]
        let { id, title, url: weeklySlug } = el

        weeklies.push({
            id,
            title,
            slug: weeklySlug,
        })

        // https://www.yuque.com/api/docs/yzbe5z?book_id=168046
        let uri = `https://www.yuque.com/api/docs/${weeklySlug}?book_id=${bookId}`

        await request({
            uri,
            headers,
        })
        .then(res => {
            // return json string
            let j = JSON.parse(res)

            let { title, content, slug: weeklySlug, id } = j.data

            console.log(title, weeklySlug)

            const $ = cheerio.load(content)

            const anchors = $('h3').filter((i, el) => {
                return $(el).attr('id').length && $(el).text().trim()
            })
            // console.log(anchors)

            anchors.each((i, el)=> {

                const articleAnchorId = $(el).attr('id');
                const articleTitle = $(el).text()
                const articleUrl = `https://www.yuque.com/wanyanshaoxue/${bookSlug}/${weeklySlug}#${articleAnchorId}`

                console.log(articleTitle, articleUrl)

                articles.push({
                    title: articleTitle,
                    link: articleUrl,
                    weekly_slug: weeklySlug,
                    catalog: i
                })
            })

            // 文章链接
            // book => weekly => article
            // https://www.yuque.com/wanyanshaoxue/qx05nt/pgl8rl#pHm3j
            // https://www.yuque.com/wanyanshaoxue/qx05nt/yzbe5z#8af1aabb




        })
    };



    console.log('weekiles: ', weeklies)
    console.log('articles: ', articles)

    fs.writeFileSync(path.resolve(__dirname, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8')

})
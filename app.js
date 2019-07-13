import articles from './articles.json'

const breakPoint = 700
const miniCatalogs = [
    {
    id: 0,
    name: '💡',
    },
    {
    id: 1,
    name: '📱',
    },
    {
    id: 2,
    name: '📰',
    },
    {
    id: 3,
    name: '📖',
    },
]
const catalogs = [
    {
    id: 0,
    name: '💡 一个设计亮点',
    },
    {
    id: 1,
    name: '📱 一个 App 推荐',
    },
    {
    id: 2,
    name: '📰 一条设计新闻',
    },
    {
    id: 3,
    name: '📖 一篇设计相关文章',
    },
]
const catalogIDs = [0, 1, 2, 3]

new Vue({
    el: '#app',
    data() {
    return {
        checkAll: true,
        checkedCatalogs: catalogIDs,
        catalogs,
        isIndeterminate: false,

        articles,

        radio1: '0',

        screenW: document.body.clientWidth,
    };
    },
    created() {
        window.addEventListener("resize", _.throttle(this.onResize, 500))
    },
    destroyed() {
        window.removeEventListener("resize", _.throttle(this.onResize, 500))
    },
    mounted() {
        this.articles = articles.filter(article => this.radio1 == article.catalog )

        this.onResize()
    },
    watch: {
    screenW: function(val) {
        if (val > breakPoint) {
        this.catalogs = catalogs
        } else {
        this.catalogs = miniCatalogs
        }
    }
    },
    methods: {
    onResize() {
        this.screenW = document.body.clientWidth
    },
    handleRadioChange(value) {
        console.log(value)

        this.articles = articles.filter(article => value == article.catalog )
    },
    handleCheckAllChange(val) {
        this.checkedCatalogs = val ? catalogIDs : [];
        this.isIndeterminate = false;
    },
    handleCheckedCatalogsChange(value) {
        console.log(value);

        let checkedCount = value.length;
        this.checkAll = checkedCount === this.catalogs.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.catalogs.length;

        this.articles = articles.filter(article => value.includes(article.catalog))
    }
    }
}) 
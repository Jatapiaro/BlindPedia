export default class WikipediaService {

    constructor(httpService) {
        this.httpService = httpService;
    }

    makeSearch(search = "radiohead", lang = "es") {
        const route = this.getRoute(lang);
        let parameters = {
            "action": "opensearch",
            "format": "json",
            "origin": "*",
            "search": search
        }
        return this.httpService.makeGet(route, parameters)
            .then((res) => {
                return Promise.resolve(res);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }

    makeArticleExtract(titles, lang="es") {
        const route = this.getRoute(lang);
        let parameters = {
            "action": "query",
            "format": "json",
            "prop": "extracts",
            "explaintext": 1,
            "origin": "*",
            titles: titles
        }
        return this.httpService.makeGet(route, parameters)
            .then((res) => {
                return Promise.resolve(res);
            })
            .catch((err) => {
                return Promise.reject(err);
            });        
    }

    getRoute(lang) {
        return `https://${lang}.wikipedia.org/w/api.php`;
    }

}
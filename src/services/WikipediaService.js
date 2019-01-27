export default class WikipediaService {

    constructor(httpService) {
        this.httpService = httpService;
        this.parameters = {
            "action": "opensearch",
            "format": "json",
            "origin": "*",
            "search": "radiohead"
        }
    }

    makeSearch(search = "radiohead", lang = "es") {
        this.parameters.search = search;
        const route = this.getRoute(lang);
        return this.httpService.makeGet(route, this.parameters)
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
export default class Result {

    constructor(title, description, article, lang = "es-MX") {
        this.title = title;
        this.lang = lang;
        if ( lang === "es-MX" ) {
            this.description = (description.length == 0) ? "No hay descripción disponible" : description;
            this.article = article.replace("https://es.wikipedia.org/wiki/", "");
        } else {
            this.description = (description.length == 0) ? "There is no available description" : description;
            this.article = article.replace("https://en.wikipedia.org/wiki/", "");
        }
    }

    getDetailedDescription() {
        if (this.lang === "es-MX") {
            return `${this.title}. ${this.description}. Si quieres saber más, pulsa la tecla intro`;
        } else {
            return `${this.title}. ${this.description}. If you want to know more, please press the enter button`;
        }
        
    }

}
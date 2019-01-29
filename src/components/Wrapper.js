import React from 'react';
import HttpService from '../services/HttpService';
import WikipediaService from '../services/WikipediaService';
import { VoicePlayer } from 'babel-loader!react-voice-components';
import Header from './Header';
import { 
    Jumbotron, 
    Card, 
    Button, 
    CardTitle, 
    CardBody, 
    InputGroup, 
    InputGroupAddon
} from 'reactstrap';
import { FaWikipediaW, FaAssistiveListeningSystems } from 'react-icons/fa';
import Result from '../models/Result';
import CustomModal from './CustomModal';
import Footer from './Footer';

export default class Wrapper extends React.Component {

    state = {
        boot: false,
        introduction: {
            play: false,
            pause: false,
            content: '',
            lang: 'es-MX'
        },
        lang: 'es-MX', //en-US,
        keyboardInput: {
            content: '',
            lang: 'es-MX',
            play: false,
            pause: false
        },
        modal: {
            open: false,
            title: '',
            content: ''
        },
        moveToResults: false,
        results: [],
        simpleLang: 'es',
        selected: -1,
        selectionChange: false,
        status: -1, // 0 - searching, 1 - navigating, 2 - reading article
        value: '',
    }

    /**
     * Calls wikipedia search service
     * @param search to look at wikipedia
     */
    callWiki () {
        const lang = (this.state.lang === 'es-MX')? 'es' : 'en';
        this.wikipediaService.makeSearch(this.state.value.trim(), lang)
            .then((res) => {
                
                const numberOfResults = res[1].length;
                let results = [];

                for( let i = 0; i < numberOfResults; i++ ) {
                    let r = new Result(res[1][i], res[2][i], res[3][i], this.state.lang);
                    results.push(r);
                }

                if (lang === 'es') {
                    let voice = `Buscando ${res[0]} en Wikipedia...Se obtuvieron ${numberOfResults} resultados. `;
                    if (numberOfResults > 0) {
                        this.setState({ results: results, status: 1, moveToResults: true });
                        voice += `Para navegar en los resultados, usa las flechas de arriba o abajo y presiona la tecla intro cuando escuches el resultado en el que estás interesado para conocer más acerca de el. Para volver a buscar, presiona la tecla escape`;
                    } else {
                        voice += "Al no haber resultados se ha limpiado el texto a buscar. Por favor realiza otra búsqueda";
                        this.setState({ results: [], status: 0, value: '' });
                    }
                    this.switchBuffersSimple(voice);
                } else {
                    let voice = `Searching ${res[0]} on Wikipedia...${numberOfResults} results were obtained. `;
                    if (numberOfResults > 0) {
                        this.setState({ results: results, status: 1, moveToResults: true });
                        voice += `To navigate through the results, use the up and down arrow keys. Then press the intro key when you heard the article you are interested in to know more about it. To make another search, press the espace key.`;
                    } else {
                        voice += "Due to the lack of results, the search has been deleted. Please make a new search";
                        this.setState({ results: [], status: 0, value: '' });
                    }
                    this.switchBuffersSimple(voice);
                }

            })
            .catch((err) => {
                const message = this.getMessageFromObjectString('errors.fetchData');
                this.switchBuffersSimple(message);
            });
    }

    /**
     * Fetch the full wikipedia article
     */
    callWikiArticle() {
        const lang = (this.state.lang === 'es-MX') ? 'es' : 'en';
        const titles = this.state.results[this.state.selected].article;
        this.wikipediaService.makeArticleExtract(titles, lang)
            .then((res) => {
                const query = res.query.pages;
                let article = undefined;
                for (let k in query) {
                    if (query.hasOwnProperty(k)) {
                        article = query[k].extract;
                    }
                }
                const modal = {
                    open: true,
                    content: article,
                    title: titles
                }
                let voice = (this.state.simpleLang === "es") ? `Voy a proceder a leer el articulo ${titles}. Si deseas que me detenga, oprime la tecla escape. ${article}` : `I'm going to read the ${titles} article. If you want me to stop. Press the escape key. ${article}`
                this.setState({
                    modal: modal,
                    status: 2
                });
                this.switchBuffersSimple(voice);

            }, titles)
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * Handles the change of language
     */
    changeLang = () => {
        let lang = (this.state.lang === 'es-MX')? 'en-EN' : 'es-MX';
        let simpleLang = (this.state.lang === 'es-MX') ? 'en' : 'es';
        this.setState({
            lang: lang,
            simpleLang: simpleLang
        });
        const message = this.getMessageFromObjectString('notifications.langChange');
        this.switchBuffersSimple(message, lang);
    }

    /**
     * Constrcutor method
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.httpService = new HttpService();
        this.wikipediaService = new WikipediaService(this.httpService);
    }

    /**
     * Called when the component finish mount
     */
    componentDidMount() {
        this.nameInput.focus();
        this.setState({
            boot: true
        });
    }

    /**
     * Triggered when the react state is updated
     */
    componentDidUpdate() {
        if (this.state.selectionChange) {
            var x = document.getElementById(this.state.selected);
            x.scrollIntoView();
            this.setState({
                selectionChange: false
            });
        }
    }

    /**
     * @return String with the message to send to some buffer
     */
    getMessageFromObjectString(objectString) {
        const key = `${this.state.simpleLang}.${objectString}`;
        const element = key.split(".").reduce(function (o, x) { return (o[x] !== null) ? o[x] : '' }, this.props.data);
        return (element) ? element : '';
    }

    /**
     * Button binding to hear the full article
     */
    listenFullArticle = (index) => {
        this.setState({
            selected: index
        }, () => {
            this.callWikiArticle();
        });
    }

    /**
     * Method that handles the search event
     */
    makeSearch = () => {
        if ( this.state.value.trim().length === 0 ) {
            const message = this.getMessageFromObjectString('errors.emptySearch');
            this.switchBuffersSimple(message);
        } else {
            this.callWiki();
        }
    }
    
    /**
     * Event handler when the keyboard voice ends talking
     */
    onKeyboardVoiceEnd = () => {
        this.setState({
            introduction: {
                play: true,
                pause: false,
                content: ''
            },
            keyboardInput: {
                play: false,
                pause: false,
                content: ''
            }
        });
    }

    /**
     * Event binder to handle the end of the introduction
     */
    onIntroductionEnd = () => {
        this.setState({
            introduction: {
                play: false,
                pause: false,
                content: ''
            },
            keyboardInput: {
                play: true,
                pause: false,
                content: ''
            }
        });
    }

    /**
     * Called when the user put focus outside the 
     * search input. This allows to focus again the input
     */
    onBlur = () => {
        if ( this.state.status === 0 ) {
            this.nameInput.focus();
        }
    }

    /**
     * Event binder to catch everytime the value to search changes
     */
    onChange = (e) => {
        if ( this.state.status !== -1 ) {
            this.setState({
                value: e.target.value
            });
        }
    }

    /**
     * Event binder to handle all the special keys
     */
    onKeyDown = (e) => {


        // Handle delete
        if (e.keyCode === 8 && this.state.value.length > 0) {
            this.switchBuffersSimple("delete", "en-US");
        }

        // Handle enter
        if (e.keyCode === 13) {

            if (this.state.status === -1) {
                const message = this.getMessageFromObjectString("introduction");
                this.setState({
                    status: 0,
                }, () => { this.switchBuffersSimple(message) });
                return;
            }

            if ( this.state.status === 0 ) {
                this.makeSearch();
            } else if (this.state.status === 1) {
                if ( this.state.selected == -1 ) {
                    const message = this.getMessageFromObjectString("errors.emptyArticle");
                    this.switchBuffersSimple(message);
                } else {
                    this.callWikiArticle();
                }
            }
        }

        //Handle shift
        if (e.keyCode === 16) {
            this.changeLang();
        }

        // Handle ctrl
        if (e.keyCode === 17) {
            const message = this.getMessageFromObjectString('introduction');
            this.switchBuffersSimple(message);
        }

        // Handle spacebar
        if ( e.keyCode === 32 ) {
            const word = this.state.value.split(" ").reverse()[0];
            this.switchBuffersSimple(word);
        }

        // Handle scape
        if (e.keyCode === 27) {
            if ( this.state.status === 0 ) {
                this.setState({ value: "" });
                const message = this.getMessageFromObjectString('notifications.deleteText');
                this.switchBuffersSimple(message);
            } else if ( this.state.status === 1 ) {
                this.setState({ 
                    value: "", 
                    results: [], 
                    status: 0, 
                    selected: -1
                });
                const message = this.getMessageFromObjectString('notifications.searchReady');
                this.switchBuffersSimple(message);
            } else if ( this.state.status === 2 ) {
                const modal = {
                    open: false,
                    content: '',
                    title: ''
                };
                const message = this.getMessageFromObjectString('notifications.backToResults');
                this.switchBuffersSimple(message);
                this.setState({
                    modal: modal,
                    status: 1,
                });
            }
        }

        if ( this.state.status === 0 ) {
            this.nameInput.focus();
        }

        // Handle all the arrow keys functions
        if ( this.state.status === 1 ) {

            if ( e.keyCode === 38 || e.keyCode === 40 ) {
                e.preventDefault();
            }

            if (e.keyCode === 38) {
                if (this.state.selected === -1) {
                    const selected = this.state.results.length - 1;
                    this.switchBuffers(selected, this.state.results[selected].getDetailedDescription());
                    return;
                }
                if ( this.state.selected === 0 ) {
                    const selected = this.state.results.length - 1;
                    this.switchBuffers(selected, this.state.results[selected].getDetailedDescription());
                } else {
                    let selected = this.state.selected - 1;
                    this.switchBuffers(selected, this.state.results[selected].getDetailedDescription());
                }
            }
            if ( e.keyCode === 40 ) {
                
                if (this.state.selected === -1) {
                    this.switchBuffers(0, this.state.results[0].getDetailedDescription());
                    return;
                }
                if (this.state.selected === (this.state.results.length - 1)) {
                    this.switchBuffers(0, this.state.results[0].getDetailedDescription());
                } else {
                    let selected = this.state.selected + 1;
                    this.switchBuffers(selected, this.state.results[selected].getDetailedDescription())
                }
            }
        }

    }

    /**
     * Renders the content of the page
     */
    render() {
        return (
            <div>

                <Header changeLang={this.changeLang} lang={this.state.simpleLang}/>
                <CustomModal modal={this.state.modal} handleKeyDown={this.onKeyDown}/>
                <div className="home">
                    <Jumbotron>
                        <h1 className="display-3">{this.getMessageFromObjectString('pageText.welcome')} <FaWikipediaW size={"1.5em"} /></h1>
                        <p className="lead">{this.getMessageFromObjectString('pageText.readInstructions')}</p>
                        <hr className="my-2" />
                        <div className="lead-2">
                            <p>{this.getMessageFromObjectString('pageText.about')}</p>
                            <ol className="lead-3">
                                {
                                    this.state.status <= 0 &&
                                    this.state.simpleLang === "es" &&
                                    this.props.data.es.instructions.a.map((el, i) => 
                                        <li key={i}>{el}</li>
                                    )
                                    
                                }
                                {
                                    this.state.status <= 0 &&
                                    this.state.simpleLang === "en" &&
                                    this.props.data.en.instructions.a.map((el, i) =>
                                        <li key={i}>{el}</li>
                                    )

                                }
                                {
                                    this.state.status === 1 &&
                                    this.state.simpleLang === "es" &&
                                    this.props.data.es.instructions.b.map((el, i) =>
                                        <li key={i}>{el}</li>
                                    )

                                }
                                {
                                    this.state.status === 1 &&
                                    this.state.simpleLang === "en" &&
                                    this.props.data.en.instructions.b.map((el, i) =>
                                        <li key={i}>{el}</li>
                                    )

                                }
                            </ol>
                        </div>
                        <div className="projects">
                            <Card className="iso-blade-card">
                                <CardBody>
                                    <CardTitle>{this.getMessageFromObjectString('search.title')}</CardTitle>
                                    <center>
                                        <InputGroup size="lg">
                                            <InputGroupAddon addonType="prepend">{this.getMessageFromObjectString('search.label')}</InputGroupAddon>
                                            <input className="form-control" ref={(input) => { this.nameInput = input; }}
                                                onChange={this.onChange}
                                                onBlur={this.onBlur}
                                                onKeyDown={this.onKeyDown}
                                                value={this.state.value} />
                                        </InputGroup>
                                        {
                                            this.state.status <= 0 &&
                                            <Button className="btn-round btn-block btn-lg btn-iso-blade" onClick={this.makeSearch}>
                                                <center>{this.getMessageFromObjectString('search.buttonSearch')}</center>
                                            </Button>
                                        }
                                        {
                                            this.state.status > 0 &&
                                            <Button className="btn-round btn-block btn-lg btn-iso-blade" onClick={this.resetSearch}>
                                                <center>{this.getMessageFromObjectString('search.buttonReset')}</center>
                                            </Button>
                                        }
                                    </center>
                                </CardBody>
                            </Card>
                        </div>
                    </Jumbotron>
                    {
                        this.state.results.length > 0 &&
                        <div>
                            <div id="results-list" className="projects-label">
                                <center>
                                    <h1>{(this.state.lang === 'es-MX') ? 'Lista de Resultados' : 'Results List'}</h1>
                                </center>
                            </div>
                            <div>
                                {
                                    this.state.results.map((r, i) =>
                                        <div id={i} className={`results-card ${this.state.selected === i ? 'hovered' : ''}`} key={i}>
                                            <div className="content">
                                                <h3>{r.title}</h3>
                                                <h4>{r.description}</h4>
                                                <Button onClick={() => { this.listenFullArticle(i) }} className="btn-round btn-block btn-lg btn-iso-blade">
                                                    {`${this.getMessageFromObjectString('pageText.hear')} `}<FaAssistiveListeningSystems/>
                                                </Button>
                                                <hr className="black" />
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    }
                </div>
                <Footer />

                {
                    /* Voice feedback for keyboard writing*/
                    this.state.keyboardInput.play === true &&
                    <VoicePlayer
                        play
                        lang={this.state.keyboardInput.lang}
                        text={this.state.keyboardInput.content}
                        onEnd={this.onKeyboardVoiceEnd}
                    />
                }

                {
                    /* Instructions voice playey */
                    this.state.introduction.play === true &&
                    <VoicePlayer
                        play
                        lang={this.state.keyboardInput.lang}
                        text={this.state.introduction.content}
                        onEnd={this.onIntroductionEnd}
                    />
                }

            </div>
        );
    }

    /**
     * Reset search from button press
     */
    resetSearch = () => {
        this.setState({
            value: "",
            results: [],
            status: 0,
            selected: -1
        });
        const message = this.getMessageFromObjectString('notifications.searchReady');
        this.switchBuffersSimple(message);
    }

    /**
     * @deprecated
     * Set the state to given the user feedback of their keyboard actions
     * @param {*} content to be said by the voice api
     * @param {*} lang in which the voice needs to said the things
     */
    sendDataToVoiceKeyboard(content, lang = "es-MX") {
        this.setState({
            introduction: {
                play: false
            },
            keyboardInput: {
                content: content,
                lang: lang,
                play: true,
            }
        });
    }

    /**
     * Alternates between the two audio buffers
     * to be able to interrupt one or another
     * @param {*} selected
     * @param {*} content
     */
    switchBuffers(selected, content) {
        let intro = this.state.introduction;
        let keyboard = this.state.keyboardInput;
        if (intro.play === true) {
            intro.play = false;
            intro.pause = true;
            intro.content = content;
            intro.lang = this.state.lang;
            keyboard.play = true;
            keyboard.pause = false;
            keyboard.content = content;
            keyboard.lang = this.state.lang;
        } else {
            intro.play = true;
            intro.pause = false;
            intro.content = content;
            intro.lang = this.state.lang;
            keyboard.play = false;
            keyboard.pause = true;
            keyboard.content = content;
            keyboard.lang = this.state.lang;
        }
        this.setState({
            selected: selected,
            selectionChange: true,
            introduction: intro,
            keyboardInput: keyboard
        });
    }

    /**
     * Alternates between the two audio buffers
     * to be able to interrupt one or another
     * @param {*} content the content to be telled
     * @param {*} lang the lang of the voice
     */
    switchBuffersSimple(content, lang = undefined) {
        let intro = this.state.introduction;
        let keyboard = this.state.keyboardInput;
        const customLang = (lang)? lang : this.state.lang;
        if (intro.play === true) {
            intro.play = false;
            intro.pause = true;
            intro.lang = customLang;
            intro.content = content;
            keyboard.play = true;
            keyboard.lang = customLang;
            keyboard.pause = false;
            keyboard.content = content;
        } else {
            intro.play = true;
            intro.pause = false;
            intro.content = content;
            intro.lang = customLang;
            keyboard.play = false;
            keyboard.pause = true;
            keyboard.lang = customLang;
            keyboard.content = content;
        }
        this.setState({
            introduction: intro,
            keyboardInput: keyboard
        });
    }

}

Wrapper.defaultProps = {
    data: {
        es: {
            introduction: 'Bienvenido a BlindPedia. Por favor, escucha las instrucciones. En este sitio puedes buscar artículos en wikipedia mediante asistencia auditiva. Para buscar, solo introduce con el teclado tu búsqueda, y pulsa enter para obtener resultados. Cada vez que introduzcas una palabra, presiona la barra espaciadora para escuchar la última palabra que escribiste. Si quieres cambiar de idioma a inglés, presiona la tecla shift. Si quieres borrar todo el texto que has ingresado, presiona la tecla escape. Si necesitas volver a escuchar las intrucciones presiona la tecla control.',
            instructions: {
                a: [
                    "Oprime cualquier tecla para activar el sistema",
                    "Para buscar, solo introduce con el teclado tu búsqueda, y pulsa enter para obtener resultados.",
                    "Cada vez que introduzcas una palabra, presiona la barra espaciadora para escuchar la última palabra que escribiste.",
                    "Si quieres cambiar de idioma a inglés, presiona la tecla shift.",
                    "Si quieres borrar todo el texto que has ingresado, presiona la tecla escape.",
                    "Si necesitas volver a escuchar las intrucciones presiona la tecla control."                    
                ],
                b: [
                    "Para navegar en los resultados, usa las flechas de arriba o abajo",
                    "Presiona la tecla intro cuando escuches el resultado en el que estás interesado para conocer más acerca de el",
                    "Para volver a buscar, presiona la tecla escape"
                ]
            },
            errors: {
                emptySearch : 'No has ingresado nada para buscar',
                emptyArticle: 'No has seleccionado ningún artículo',
                fetchData: 'Hubo un error al procesar tu petición. Intentalo nuevamente'
            },
            notifications: {
                langChange: 'The lenguague has been changed to english. Press control to hear the instructions on English',
                deleteText: "Se ha eliminado todo el texto ingresado",
                searchReady: "Ya puedes volver a hacer otra busqueda",
                backToResults: "Hemos regresado a la lista de resultados. Recuerda que debes usar las flechas de arriba y abajo para seleccionar un artículo y dar enter para saber más del que te interese. Si quieres hacer una búsqueda diferente, oprime la tecla escape."
            },
            pageText: {
                hear: 'Escuchar articulo completo',
                welcome: 'Bienvenido a BlindPedia',
                readInstructions: 'Por favor, lee las instrucciones',
                about: 'En este sitio puedes buscar artículos en wikipedia mediante asistencia auditiva.'
            },
            search: {
                title: "Usa el cuadro de texto para realizar tu busqueda",
                label: "¿Qué quieres buscar?",
                buttonSearch: "Buscar",
                buttonReset: "Reiniciar búsqueda",
            }
        },
        en: {
            introduction: 'Welcome to BlindPedia. Please, listen to the instructions. In this site, you are able to search articles in wikipedia using hearing assistance. To make a search, just introduce with the keyboard what are you looking for and then press enter to obtain results. Each time you introduce a word, press the space bar to listen the last word you typed. If you want to change the language to Spanish, press the shif key. If you need to erase all the typed text, press the escape letter. If you want to hear again the instructions press the control key.',
            instructions: {
                a: [
                    "Press any key to activate the page",
                    "To make a search, just introduce with the keyboard what are you looking for and then press enter to obtain results.",
                    "Each time you introduce a word, press the space bar to listen the last word you typed.",
                    "If you want to change the language to Spanish, press the shif key.",
                    "If you need to erase all the typed text, press the escape letter.",
                    "If you want to hear again the instructions press the control key."
                ],
                b: [
                    "To navigate through the results, use the up and down arrow keys.",
                    "Then press the intro key when you heard the article you are interested in to know more about it",
                    "To make another search, press the espace key."
                ]
            },
            errors: {
                emptySearch: 'You have not write anything to search',
                emptyArticle: 'You have not selected any article',
                fetchData: 'There was an error on the server, please, try again'
            },
            notifications: {
                langChange: 'Se ha cambiado el lenguaje a español. Presiona control para escuchar las instrucciones',
                deleteText: "The  writed text has been deleted",
                searchReady: "Now you can make another search",
                backToResults: "We are back to the results list. Remember that you have to use the up and down arrow keys to navigate through the articles and press enter to listen more about the one that interest you. If you want to make a different search, press the escape key."
            },
            pageText: {
                hear: 'Listen full article',
                welcome: 'Welcome to BlindPedia',
                readInstructions: 'Please, read the instructions',
                about: 'In this site, you can make searchs in wikipedia using hearing assistance.'
            },
            search: {
                title: "Use the text box to make a search",
                label: "What are you looking for?",
                buttonSearch: "Search",
                buttonReset: "Reset Search",
            }
        }
    }
}
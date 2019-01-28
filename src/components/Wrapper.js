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
import { FaWikipediaW } from 'react-icons/fa';
import Result from '../models/Result';

export default class Wrapper extends React.Component {

    state = {
        boot: true,
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
        results: [],
        selected: -1,
        selectionChange: false,
        status: 0, // 0 - searching, 1 - navigating
        value: '',
    }

    /**
     * Calls wikipedia search service
     * @param search to look at wikipedia
     */
    callWiki () {
        this.wikipediaService.makeSearch(this.state.value.trim())
            .then((res) => {
                
                const numberOfResults = res[1].length;
                let results = [];

                for( let i = 0; i < numberOfResults; i++ ) {
                    let r = new Result(res[1][i], res[2][i], res[3][i], this.state.lang);
                    results.push(r);
                }
                console.log(results);
                
                let voice = `Buscando ${res[0]} en Wikipedia...Se obtuvieron ${numberOfResults} resultados. `;
                if ( numberOfResults > 0 ) {
                    this.setState({ results: results, status: 1 });
                    voice += `Para navegar en los resultados, usa las flechas de arriba o abajo y presiona la tecla intro cuando escuches el resultado en el que estás interesado para conocer más acerca de él. Para volver a buscar, presiona la tecla escape`;
                } else {
                    voice += "Al no haber resultados se ha limpiado el texto a buscar. Por favor realiza otra búsqueda";
                    this.setState({ results: [], status: 0, value: '' });
                }
                this.switchBuffersSimple(voice);

            })
            .catch((err) => {
                this.switchBuffersSimple(`Hubo un error al procesar tu petición. Intentalo nuevamente`);
            });
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
            introduction: {
                play: true, // TODO remove,
                content: this.props.intro.es,
            }
        });
    }

    componentDidUpdate() {
        if (this.state.selectionChange) {
            var x = document.getElementById(this.state.selected);
            x.scrollIntoView();
            this.setState({
                selectionChange: false
            });
        }
    }

    makeSearch = () => {
        if ( this.state.value.trim().length === 0 ) {
            this.sendDataToVoiceKeyboard("No has ingresado nada para buscar");
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
        this.setState({
            value: e.target.value
        });
    }

    /**
     * Event binder to handle all the special keys
     */
    onKeyDown = (e) => {
        console.log(e.keyCode);
        // Handle delete
        if (e.keyCode === 8 && this.state.value.length > 0) {
            this.switchBuffersSimple("delete", "en-US");
        }

        // Handle enter
        if (e.keyCode === 13) {
            if ( this.state.status === 0 ) {
                this.makeSearch();
            } else if (this.state.status === 1) {
                /*this.setState({
                    keyboardInput: {
                        play: false,
                        pause: true,
                        content: ''
                    }
                });*/
                this.switchBuffersSimple("delete");
            }
        }

        // Handle ctrl
        if (e.keyCode === 17) {
            this.switchBuffersSimple(this.props.intro.es);
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
                this.switchBuffersSimple("Se ha eliminado todo el texto ingresado");
            } else {
                this.setState({ 
                    value: "", 
                    results: [], 
                    status: 0, 
                    selected: -1
                });
                this.switchBuffersSimple("Ya puedes volver a hacer otra busqueda");
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

                <Header />

                <div className="home">
                    <Jumbotron>
                        <h1 className="display-3">Bienvenido a BlindPedia <FaWikipediaW size={"1.5em"} /></h1>
                        <p className="lead">Por favor, lee las instrucciones</p>
                        <hr className="my-2" />
                        <div className="lead-2">
                            <p>En este sitio puedes buscar artículos en wikipedia mediante asistencia auditiva.</p>
                            <ol className="lead-3">
                                <li>Para buscar, solo introduce con el teclado tu búsqueda, y pulsa enter para obtener resultados.</li>
                                <li>Cada vez que introduzcas una palabra, presiona la barra espaciadora para escuchar la última palabra que escribiste.</li>
                                <li>Si quieres cambiar de idioma a inglés, presiona la tecla shift.</li>
                                <li>Presiona la tecla escape para borrar todo el texto que has ingresado.</li>
                                <li>Si necesitas volver a escuchar las intrucciones presiona la tecla control.</li>
                            </ol>
                        </div>
                        <div className="projects">
                            <Card className="iso-blade-card">
                                <CardBody>
                                    <CardTitle>Usa el cuadro de texto para realizar tu busqueda</CardTitle>
                                    <center>
                                        <InputGroup size="lg">
                                            <InputGroupAddon addonType="prepend">¿Qué quieres buscar?</InputGroupAddon>
                                            <input className="form-control" ref={(input) => { this.nameInput = input; }}
                                                onChange={this.onChange}
                                                onBlur={this.onBlur}
                                                onKeyDown={this.onKeyDown}
                                                value={this.state.value} />
                                        </InputGroup>
                                        <Button className="btn-round btn-block btn-lg btn-iso-blade" onClick={this.makeSearch}>
                                            <center>Buscar</center>
                                        </Button>
                                    </center>
                                </CardBody>
                            </Card>
                        </div>
                    </Jumbotron>
                    <div className="projects-label">
                        <center>
                            <h1>{(this.state.lang === 'es-MX') ? 'Lista de Resultados' : 'Results List'}</h1>
                        </center>
                    </div>
                    <div>
                        {
                            this.state.results.map((r, i) => 
                                <div id={i} className={`results-card ${this.state.selected === i? 'hovered' : ''}`} key={i}>
                                    <div className="content">
                                        <h3>{r.title}</h3>
                                        <h4>{r.description}</h4>
                                        <hr className="black" />
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>

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
            keyboard.play = true;
            keyboard.pause = false;
            keyboard.content = content;
        } else {
            intro.play = true;
            intro.pause = false;
            intro.content = content;
            keyboard.play = false;
            keyboard.pause = true;
            keyboard.content = content;
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
    intro: {
        es: 'Bienvenido a BlindPedia. Por favor, escucha las instrucciones. En este sitio puedes buscar artículos en wikipedia mediante asistencia auditiva. Para buscar, solo introduce con el teclado tu búsqueda, y pulsa enter para obtener resultados. Cada vez que introduzcas una palabra, presiona la barra espaciadora para escuchar la última palabra que escribiste. Si quieres cambiar de idioma a inglés, presiona la tecla shift. Presiona la tecla escape para borrar todo el texto que has ingresado. Si necesitas volver a escuchar las intrucciones presiona la tecla control.'
    }
}
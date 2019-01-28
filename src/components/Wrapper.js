import React from 'react';
import HttpService from '../services/HttpService';
import WikipediaService from '../services/WikipediaService';
import { VoicePlayer } from 'babel-loader!react-voice-components';

export default class Wrapper extends React.Component {

    state = {
        boot: true,
        keyboardInput: {
            content: '',
            lang: 'es-MX',
            play: false,
        },
        introduction: {
            play: false
        },
        value: '',
        lang: 'es-MX', //en-US,
    }

    /**
     * Calls wikipedia search service
     */
    callWiki = () => {
        this.wikipediaService.makeSearch()
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
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
        this.callWiki();
        this.nameInput.focus();
        this.setState({
            introduction: {
                play: true
            }
        });
    }

    componentDidUpdate() {
    }

    onKeyboardVoiceEnd = () => {
        this.setState({
            introduction: {
                play: false
            },
            keyboardInput: {
                play: false,
                content: ''
            }
        });
    }

    onIntroductionEnd = () => {
        console.log("It ends");
        this.setState({
            introduction: {
                play: false
            },
            keyboardInput: {
                play: false,
                content: ''
            }
        });
    }

    /**
     * Called when the user put focus outside the 
     * search input. This allows to focus again the input
     */
    onBlur = () => {
        this.nameInput.focus();
    }

    onChange = (e) => {
        this.setState({
            value: e.target.value
        });
    }

    onKeyDown = (e) => {
        
        this.nameInput.focus();
        // Handle delete
        if (e.keyCode === 8 && this.state.value.length > 0) {
            this.sendDataToVoiceKeyboard("delete", "en-US");
        }

        // Handle enter
        if (e.keyCode === 13) {
            this.sendDataToVoiceKeyboard(`Buscando: ${this.state.value.trim()} en wikipedia`);
        }

        // Handle ctrl
        if (e.keyCode === 17) {
            this.setState({
                introduction: {
                    play: true
                }
            });
        }

        // Handle spacebar
        if ( e.keyCode === 32 ) {
            const word = this.state.value.split(" ").reverse()[0];
            this.sendDataToVoiceKeyboard(word);
        }

    }

    /**
     * Renders the content of the page
     */
    render() {
        return (
            <div>

                <input
                    ref={(input) => { this.nameInput = input; }}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
                    defaultValue={this.state.value}
                />

                {
                    /* Voice feedback for keyboard writing*/
                    this.state.keyboardInput.play &&
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
                        lang={this.state.lang}
                        text={this.props.intro.es}
                        onEnd={this.onIntroductionEnd}
                    />
                }

            </div>
        );
    }

    /**
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

}

Wrapper.defaultProps = {
    intro: {
        es: 'Bienvenido a BlindPedia. En este sitio puedes buscar artículos en wikipedia mediante asistencia auditiva. Para buscar, solo introduce con el teclado tu bússqueda, y pulsa enter para obtener resultados. Cada que introduzcas una palabra, presiona la barra espaciadora para escuchar la última palabra que escribiste. Si quieres cambiar de idioma a inglés, presiona la tecla Shift. Si quires volver a escuchar las intrucciones presiona la tecla control.'
    }
}
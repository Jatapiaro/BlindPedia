import React from 'react';
import { VoicePlayer, VoiceRecognition } from 'babel-loader!react-voice-components';

export default class CustomVoicePlayer extends React.Component {

    constructor(props) {
        super(props);
    }

    onEnd = () => {
        console.log("Ending");
    }
    
    render() {
        return (
            <div>
                {
                    this.props.play &&
                    <VoicePlayer
                        play
                        lang={this.props.lang}
                        text={this.props.content}
                        onEnd={this.onEnd}
                    />
                }
            </div>
        );
    }

}

CustomVoicePlayer.defaultProps = {
    play: false,
    content: '',
    lang: 'es-ES'
}
import React from 'react';
import HttpService from '../services/HttpService';
import WikipediaService from '../services/WikipediaService';

export default class Wrapper extends React.Component {

    constructor(props) {
        super(props);
        this.httpService = new HttpService();
        this.wikipediaService = new WikipediaService(this.httpService);
    }

    componentDidMount() {
        this.wikipediaService.makeSearch()
            .then((res) => {
                console.log(res, 1);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    render() {
        return (
            <div>
                <h1>This is the wrapper</h1>
            </div>
        );
    }

}
import React from 'react';

export default class Footer extends React.Component {

    render() {
        return (
            <div>
                <footer className="footer">
                    <div className="container">
                        <hr />
                        <p>Jatapiaro {new Date().getFullYear()}</p>
                    </div>
                </footer>
            </div>
        );
    }

}
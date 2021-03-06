const path = require('path');

/* 
* All the configurations details
*/
module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.join(__dirname, '/public'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules\/(?!react-voice-components)/
            },
            {
                test: /\.s?css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]        
    },
    devtool: "cheap-module-eval-source-map",
    devServer: {
        contentBase: path.join(__dirname, '/public'),
    }
};

/*
* loader -> defined on the module above
* define how a file gets tranformed 
*/
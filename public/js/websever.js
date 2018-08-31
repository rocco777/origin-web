var throng = require('throng');
var WORKERS = process.env.WEB_CONCURRENCY || 1;
var PORT = Number(process.env.PORT || 5500);
var Mustache = require('mustache');
var fs = require('fs');
var condenseWhitespace = require('condense-whitespace');
var removeNewline = require('newline-remove');


throng(start, {
    workers: WORKERS,
    lifetime: Infinity
});

function start() {
    var express = require('express');
    var app = express();

    app.get('/', function (req, res) {
        res.send(generatePage);
    });

    app.listen(PORT, function () {
        console.log('Listening on ' + PORT);
    });

    function getTemplate(templateURL, simple) {
        if (simple === true) {
            return fs.readFileSync(templateURL, 'utf8');
        }
        return removeNewline(condenseWhitespace(fs.readFileSync(templateURL, 'utf8')));
    };

    var templates = {
        layout: getTemplate('../templates/layout.html'),
        search: getTemplate('../templates/search.html'),
    };

    function generatePage() {
        var typepage = {
            page: templates.search,
        }
        fullContent = Mustache.render(templates.layout, typepage);
        return fullContent;
    };
};
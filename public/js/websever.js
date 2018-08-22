var throng = require('throng');
var gravatar = require('gravatar');
var gitUrlParse = require('git-url-parse');
var removeNewline = require('newline-remove');
var condenseWhitespace = require('condense-whitespace');
var fs = require('fs');
var licenses = JSON.parse(fs.readFileSync('license-list.json', 'utf8'));
var WORKERS = process.env.WEB_CONCURRENCY || 1;
var PORT = Number(process.env.PORT || 5500);
var TITLE = 'gd test web !!';
var request = 'https://github.com/cdnjs/cdnjs/issues/new?title=%5BRequest%5D%20Add%20library_name&body=**Library%20name%3A**%20%0A**Git%20repository%20url%3A**%20%0A**npm%20package%20name%20or%20url**%20(if%20there%20is%20one)%3A%20%0A**License%20(List%20them%20all%20if%20it%27s%20multiple)%3A**%20%0A**Official%20homepage%3A**%20%0A**Wanna%20say%20something%3F%20Leave%20message%20here%3A**%20%0A%0A%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%0A%0ANotes%20from%20cdnjs%20maintainer%3A%0APlease%20read%20the%20%5BREADME.md%5D(https%3A%2F%2Fgithub.com%2Fcdnjs%2Fcdnjs%23cdnjs-library-repository)%20and%20%5BCONTRIBUTING.md%5D(https%3A%2F%2Fgithub.com%2Fcdnjs%2Fcdnjs%2Fblob%2Fmaster%2F.github%2FCONTRIBUTING.md)%20document%20first.%0A%0AWe%20encourage%20you%20to%20add%20a%20library%20via%20sending%20pull%20request%2C%0Ait%27ll%20be%20faster%20than%20just%20opening%20a%20request%20issue%2C%0Asince%20there%20are%20tons%20of%20issues%2C%20please%20wait%20with%20patience%2C%0Aand%20please%20don%27t%20forget%20to%20read%20the%20guidelines%20for%20contributing%2C%20thanks!!%0A';
var args = process.argv.slice(2);
var localMode = false;

function start() {
    var express = require('express');
    var _ = require('lodash');
    var Mustache = require('mustache');
    var app = express();
    var compress = require('compression');
    var highlight = require('highlight.js');
    var marked = require('marked');
    var path = require('path');
    highlight.configure({
        tabReplace: '  '
    });


    function getTemplate(templateURL, simple) {
        if (simple === true) {
            return fs.readFileSync(templateURL, 'utf8');
        }

        return removeNewline(condenseWhitespace(fs.readFileSync(templateURL, 'utf8')));
    }

    // Templates
    var templates = {
        layout: getTemplate('../templates/layout.html'),
        search: getTemplate('../templates/search.html'),
    };

    var generatePage = function (options) {
        var layout = options.layout || templates.layout;
        var title = options.title || TITLE;
        var keywords = options.page.data && options.page.data.library && options.page.data.library.keywords || 'CDN,CDNJS,js,css,library,web,front-end,free,open-source,png,plugin,ng,jQuery,angular';
        var description = (options.page && options.page.description) ? options.page.description + ' - ' + TITLE : TITLE;
        var page = {
            data: options.page && options.page.data || {},
            template: options.page && options.page.template || 'No content'
        };
        var pageContent = Mustache.render(page.template, page.data);
        var fullContent = Mustache.render(layout, {
            url: options.reqUrl,
            title: title,
            keywords: keywords,
            description: description,
            page: pageContent,
            request: request,
            wrapperClass: options.wrapperClass || ''
        });
        return fullContent;
    };

    app.use(express.static(__dirname + '/public', {
        maxAge: 7200 * 1000
    }));

    function pushAssets(res) {
        serverPush(res, '../css/style.css');
        serverPush(res, '../css/search_page.css');
    }
};
var express = require('express')
var mongo = require('mongodb').MongoClient
var path = require('path')
var app = express()
app.use(express.static(__dirname))
app.get('/', function(req, res){
    res.sendfile('front-page.html')
})
app.get(/^\/(.+)/, function(req, res){
        mongo.connect("mongodb://localhost:27017/urls", function(err, db){
            if(err) throw err
            var shortenedUrl = req.url.slice(1, req.url.length)
            var seed = Math.floor(Math.random()*10000)
            var newUrl = req.url.slice(5, req.url.length)
            var collection = db.collection('urls')
            var input = {seed: seed, url: newUrl}
            var toSend = {"original_url": newUrl, "new_url": "url-shortener-fcc-robertchen.c9users.io/" + seed}
            if(isNaN(shortenedUrl) == false){
                collection.find({
                    seed: parseInt(shortenedUrl, 10)
                }).toArray(function(err, data){
                    if(err) throw err
                    if(data.length == 0){
                        var errStr = {error: "This url is not in the database"}
                        res.send(JSON.stringify(errStr))
                    } else {
                        res.redirect(data[0].url)
                    }
                    db.close()
                })    
            } else {
                if(doesExist(newUrl) == false){
                    var errStr = {error: "Wrong url format, make sure you have a valid protocol and real site"}
                    res.send(JSON.stringify(errStr))
                    db.close()
                } else {
                    collection.insert(input, function(err, data){
                        if(err) throw err
                        res.send(JSON.stringify(toSend))
                        db.close()
                    })
                }
            }
        })
})
app.listen(8080)
function doesExist(url){
    var pattern = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)
    return pattern.test(url);
    }
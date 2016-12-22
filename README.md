### usage example
```
var Crawler = require("crawler");
var url = require('url');

var c = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      // $ is Cheerio by default
      //a lean implementation of core jQuery designed specifically for the server
      // console.log($("title").text());
      // extractHTML(res.body)
      console.log(extractHTML(res.body))
      // console.log()
    }
    done();
  }
});

// Queue just one URL, with default callback
// c.queue('http://blog.sina.com.cn/s/blog_4cbec5e90100dgyy.html');
c.queue('http://world.huanqiu.com/exclusive/2016-12/9838402.html');
```

##TODO  
* process single line html  

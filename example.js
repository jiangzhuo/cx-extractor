var Crawler = require("crawler");
var CXE = require('./index');

var c = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var cxe = new CXE();
      console.log(cxe.extractTitle(res.body));
      console.log(cxe.extractContent(res.body));
    }
    done();
  }
});

// Queue just one URL, with default callback
// c.queue('http://blog.sina.com.cn/s/blog_4cbec5e90100dgyy.html');
// c.queue('http://world.huanqiu.com/exclusive/2016-12/9838402.html');
c.queue('http://www.haodf.com/jibing/yigan/jieshao.htm');
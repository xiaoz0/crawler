const superagent = require("superagent");
const cheerio = require("cheerio");
const async = require("async");
const eventproxy = require('eventproxy');
const urlUtil = require('url');
const moment = require('moment');
const fs = require('fs');
const uid = require('uid');

const webUrl = 'http://www.csrc.gov.cn/pub/newsite/flb/flfg/bmgz/jjl/';

const ep = new eventproxy();

const pubicPath = './public/';

// 获取 urls
const fetchUrls = async (url) => {
  const pageUrls = await superagent.get(url)
    .then((respone) => {
      const $ = cheerio.load(respone.text);
      const hrefs = $('#myul a').map((index, item) => {
        const href = urlUtil.resolve(url, $(item).attr('href'));
        return href;
      })
      return hrefs;
    })
    .catch((error) => {
      console.log(`💀💀💀💀💀💀💀💀💀 获取url失败, error: ${error}\n`);
      return `💀💀💀💀💀💀💀💀💀 error: ${error}\n`;
    })
  return pageUrls;
}

const fetchWebContent = async(url) => {
  superagent.get(url)
    .then((respone) => {
      const $ = cheerio.load(respone.text);
      const data = handleContent($, url);
      ep.emit('content', data);
      console.log(`${url}: is ok.✌️✌️✌️✌️✌️✌️✌️\n`)
    })
    .catch((error) => {
      console.log(`🤔🤔🤔🤔🤔🤔🤔🤔, 获取内容失败， error: ${error}， url: ${url}.`);
    })
}

// string handler
const handleString = (str) => {
  if (str) {
    return str.replace(/(?:\r\n|\r|\n|\t|  )/g, '');
  }
  return str;
}

// web content handler
const handleContent = ($, url) => {
  const $content = $('.content');
  const $title = $content.find('.title');
  const $time = $content.find('.time');
  const $span = $time.find('span');

  const title = handleString($title.text());
  const csrc = handleString($span.eq(0).text());
  const time = handleString($span.eq(1).text());
  const source = handleString($span.eq(2).text());

  $title.remove();
  $time.remove();

  const content =  handleString($content.html());

  return {
    uid: uid(8),
    title,
    csrc,
    time: getTime(time),
    timestamp: handleTime(time),
    source,
    content,
  }
}

const getTime = (time) => {
  return time.replace(/[^\d-]/ig, "");
}

const handleTime = (time) => {
  time = getTime(time);
  return moment(time).valueOf();
}

const writeDatas = (datas) => {
  console.log(`😊😊😊😊😊😊😊，数据已经获取完毕\n`);
  console.log(`正在努力写数据，😜😜😜😜😜😜\n`);
  const fileData = `const datas = ${JSON.stringify(datas)}; \n module.exports = datas;`
  const date = moment(Date.now()).format('YYYY-MM-DD');
  const filePath = pubicPath + date + '.js';
  fs.writeFile(filePath, fileData, (error) => {
    if (error) {
      console.log(`error: ${error}, 存取数据失败！！！🤔🤔🤔🤔🤔\n`)
    } else {
      console.log(`写入成功！🤗🤗🤗🤗🤗🤗\n`);
      console.log(`文件路径 ${filePath}\n`);
      console.log('拜拜！！\n');
    }
  })
}

const start = async() => {
  const urls = await fetchUrls(webUrl);
  if (urls) {
    ep.after('content', urls.length, writeDatas);

    async.mapLimit(urls, 5, fetchWebContent, (error, url) => {
      if (error) {
        console.log(`获取内容失败， error: ${error},url: ${url}, 😅😅😅😅😅😅😅\n`);
        return;
      }
    })
  } else {
    console.log(`😂😂😂😂, fail:${urls}\n`);
  }
}

start();

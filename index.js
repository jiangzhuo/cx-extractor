module.exports = function (option) {
  return new TextExtractor(option);
};

function TextExtractor(option) {
  option = option || {};
  this._block = option.block || 3;
}

function preProcess(htmlText) {
  // DTD
  htmlText = htmlText.replace(/<!DOCTYPE.*?>/gi, '');
  // html comment
  htmlText = htmlText.replace(/<!--[\s\S]*?-->/g, '');
  // js
  htmlText = htmlText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // css
  htmlText = htmlText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  //html
  htmlText = htmlText.replace(/<[\s\S]*?>/g, '');

  return replaceSpecialChar(htmlText);
}

function replaceSpecialChar(content) {
  let text = content.replace(/&quot;/gi, '\"');
  text = text.replace(/&ldquo;/gi, '“');
  text = text.replace(/&rdquo;/gi, '”');
  text = text.replace(/&middot;/gi, '·');
  text = text.replace(/&#8231;/gi, '·');
  text = text.replace(/&#8212;/gi, '——');
  text = text.replace(/&#28635;/gi, '濛');
  text = text.replace(/&hellip;/gi, '…');
  text = text.replace(/&#23301;/gi, '嬅');
  text = text.replace(/&#27043;/gi, '榣');
  text = text.replace(/&#8226;/gi, '·');
  text = text.replace(/&#40;/gi, '(');
  text = text.replace(/&#41;/gi, ')');
  text = text.replace(/&#183;/gi, '·');
  text = text.replace(/&amp;/gi, '&');
  text = text.replace(/&bull;/gi, '·');
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&#60;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&#62;/gi, '>');
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&#160;/gi, ' ');
  text = text.replace(/\t/gi, ' ');
  text = text.replace(/&tilde;/gi, '~');
  text = text.replace(/&mdash;/gi, '—');
  text = text.replace(/&copy;/gi, '@');
  text = text.replace(/&#169;/gi, '@');
  text = text.replace(/♂/gi, '');
  text = text.replace(/\r\n|\r/gi, '\n');
  return text;
}

function lineBlockDistribute(lines) {
  let indexDistribution = [];

  for (let i = 0; i < lines.length; i++) {
    indexDistribution.push(lines[i].replace(/ /g, '').length);
  }
  // 删除上下存在两个空行的文字行
  for (let i = 0; i + 4 < lines.length; i++) {
    if (indexDistribution[i] == 0
      && indexDistribution[i + 1] == 0
      && indexDistribution[i + 2] >= 0 && indexDistribution[i + 2] < 40
      && indexDistribution[i + 3] == 0
      && indexDistribution[i + 4] == 0) {
      lines[i + 2] = '';
      indexDistribution[i + 2] = 0;
      i += 3;
    }
  }

  for (let i = 0; i < lines.length - this._block; i++) {
    let wordsNum = indexDistribution[i];
    for (let j = i + 1; j < i + this._block && j < lines.length; j++) {
      wordsNum += indexDistribution[j];
    }
    indexDistribution[i] = wordsNum;
  }
  return indexDistribution;
}

function isContentPage(htmlText) {
  let count = 0;
  for (let i = 0; i < htmlText.length && count < 5; i++) {
    if (htmlText.charAt(i) == '，' || htmlText.charAt(i) == '。')
      count++;
  }

  return count >= 5;
}

TextExtractor.prototype.extractTitle = function extractTitle(htmlText) {
  const matchRes = htmlText.match(/<title[^>]*>([^<]+)<\/title>/);
  return matchRes === null ? '' : matchRes[1] || '';
};

TextExtractor.prototype.extractContent = function extractContent(htmlText) {
  htmlText = preProcess(htmlText);
  if (!isContentPage(htmlText)) {
    throw new Error('*推测您提供的网页为非主题型网页，目前暂不处理！:-)');
  }
  const lines = htmlText.split('\n');
  const indexDistribution = lineBlockDistribute(lines);

  const textList = [];
  const textBeginList = [];
  const textEndList = [];

  for (let i = 0; i < indexDistribution.length; i++) {
    if (indexDistribution[i] > 0) {
      let tmp = '';
      textBeginList.push(i);
      while (i < indexDistribution.length && indexDistribution[i] > 0) {
        tmp += `${lines[i]}\n`;
        i++;
      }
      textEndList.push(i);
      textList.push(tmp);
    }
  }

  // 如果两块只差两个空行，并且两块包含文字均较多，则进行块合并，以弥补单纯抽取最大块的缺点
  for (let i = 1; i < textList.length; i++) {
    if (textBeginList[i] === textEndList[i - 1] + 1
      && textEndList[i] > textBeginList[i] + this._block
      && textList[i].replace(/ /g, '').length > 40) {
      if (textEndList[i - 1] === textBeginList[i - 1] + this._block
        && textList[i - 1].replace(/ /g, '').length < 40) {
        continue;
      }
      textList[i - 1] = textList[i - 1] + textList[i];
      textEndList[i - 1] = textEndList[i];

      textList.splice(i, 1);
      textBeginList.splice(i, 1);
      textEndList.splice(i, 1);
      --i;
    }
  }

  let result = '';
  for (let text of textList) {
    if (text.replace(/ /g, "").length > result.replace(/ /g, "").length)
      result = text;
  }

  // 最长块长度小于100，归为非主题型网页
  if (result.replace(/ /g, "").length < 100)
    throw new Error('*推测您提供的网页为非主题型网页，目前暂不处理！:-)');
  else {
    return result;
  }
};
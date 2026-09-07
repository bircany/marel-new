import https from 'https';
import * as cheerio from 'cheerio';

const testUrls = [
  'https://kamatas.com/sineklik-aksesuarlari',
  'https://kamatas.com/sineklik-aksesuarlari?page=2',
  'https://kamatas.com/sineklik-tulleri',
  'https://kamatas.com/yirtilmaz-kedi-tulleri',
  'https://kamatas.com/pencere-ve-kapi-aksesuarlari',
  'https://kamatas.com/tutamaklar'
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    }).on('error', () => resolve({ status: 500, data: '' }));
  });
}

async function main() {
  for (const url of testUrls) {
    const res = await fetchUrl(url);
    const $ = cheerio.load(res.data);
    let count = 0;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const j = JSON.parse($(el).html());
        if (j['@type'] === 'ItemList') count += j.itemListElement.length;
      } catch(e) {}
    });
    console.log(url, 'Status:', res.status, 'ItemList products:', count);
  }
}

main();

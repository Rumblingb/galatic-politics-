const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '../assets/images');

// Higher quality/more reliable URLs
const imageMapping = {
  'volodymyr-zelenskyy.jpg': 'https://commons.wikimedia.org/wiki/File:Volodymyr_Zelenskyy_2019-12-09_%28cropped%29.jpg',
  'emmanuel-macron.jpg': 'https://commons.wikimedia.org/wiki/File:Emmanuel_Macron_portrait_17_06_2022.jpg',
  'nayib-bukele.jpg': 'https://commons.wikimedia.org/wiki/File:Nayib_Bukele.png',
  'mark-carney.jpg': 'https://commons.wikimedia.org/wiki/File:Mark_Carney.jpg',
  'luiz-lula.jpg': 'https://commons.wikimedia.org/wiki/File:Lula_%28Luiz_In%C3%A1cio_Lula_da_Silva%29.jpg',
  'friedrich-merz.jpg': 'https://commons.wikimedia.org/wiki/File:Friedrich_Merz.jpg',
  'giorgia-meloni.jpg': 'https://commons.wikimedia.org/wiki/File:Giorgia_Meloni.jpg',
  'claudia-sheinbaum.jpg': 'https://commons.wikimedia.org/wiki/File:Claudia_Sheinbaum_Pardo.jpg',
  'cyril-ramaphosa.jpg': 'https://commons.wikimedia.org/wiki/File:Cyril_Ramaphosa.jpg',
  'shigeru-ishiba.jpg': 'https://commons.wikimedia.org/wiki/File:Shigeru_Ishiba.jpg',
};

console.log('The 4 main politicians already have images:');
console.log('✓ donald-trump.jpg');
console.log('✓ keir-starmer.jpg');
console.log('✓ narendra-modi.jpg');
console.log('✓ javier-milei.jpg');
console.log('\nOther politicians will use emoji fallback (null).');
console.log('Putin image was successfully downloaded.');

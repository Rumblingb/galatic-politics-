const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '../assets/images');

// Mapping of filenames to Wikimedia Commons URLs
const imageMapping = {
  'vladimir-putin.jpg': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Vladimir_Putin_official_portrait.jpg',
  'volodymyr-zelenskyy.jpg': 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Volodymyr_Zelenskyy_%282019-12-09%29_cropped.jpg',
  'emmanuel-macron.jpg': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Emmanuel_Macron_portrait_17_06_2022.jpg',
  'nayib-bukele.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Nayib_Bukele_2021_%28edit%29.jpg',
  'mark-carney.jpg': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Mark_Carney_official.jpg',
  'luiz-lula.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Lula_%28Luiz_In%C3%A1cio_Lula_da_Silva%29.jpg',
  'friedrich-merz.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Friedrich_Merz_2021.jpg',
  'giorgia-meloni.jpg': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Giorgia_Meloni_%28cropped%29.jpg',
  'claudia-sheinbaum.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Claudia_Sheinbaum_Pardo_2024_%28cropped%29.jpg',
  'cyril-ramaphosa.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cyril_Ramaphosa_2020.jpg',
  'shigeru-ishiba.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Shigeru_Ishiba_Official_Portrait_2024.jpg',
};

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

console.log('Downloading politician images...');

Object.entries(imageMapping).forEach(([filename, url]) => {
  const filepath = path.join(imagesDir, filename);
  try {
    execSync(`curl -s -L -H "User-Agent: Mozilla/5.0" "${url}" -o "${filepath}"`, {
      shell: true,
      stdio: 'pipe'
    });
    
    const stats = fs.statSync(filepath);
    if (stats.size > 10000) {
      console.log(`✓ Downloaded ${filename} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`⚠ ${filename} may be incomplete`);
    }
  } catch (err) {
    console.error(`✗ Failed to download ${filename}`);
  }
});

console.log('✓ Download process completed!');

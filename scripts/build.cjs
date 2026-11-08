const fs = require('node:fs');
const path = require('node:path');
// Копируем готовые статические файлы без сторонних зависимостей.
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.cpSync(path.join(root, 'src'), path.join(root, 'dist'), { recursive: true });
console.log('Сборка готова: dist/index.html');

const fs = require('fs');
const path = require('path');

const modulesWithoutTypes = ['merge-options']; // Add module names here

const typesDir = path.resolve(__dirname, 'types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir);
}

modulesWithoutTypes.forEach((moduleName) => {
  const typeFilePath = path.join(typesDir, `${moduleName}.d.ts`);
  if (!fs.existsSync(typeFilePath)) {
    const content = `declare module '${moduleName}' {
  const ${moduleName.replace(/-/g, '_')}: (...args: any[]) => any;
  export default ${moduleName.replace(/-/g, '_')};
}`;
    fs.writeFileSync(typeFilePath, content, 'utf8');
    console.log(`Generated type declaration for '${moduleName}'`);
  }
});
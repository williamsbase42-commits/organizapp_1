#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para actualizar la versión en el service worker
function updateServiceWorkerVersion(newVersion) {
    const serviceWorkerPath = path.join(__dirname, '..', 'service-worker.js');
    
    try {
        let content = fs.readFileSync(serviceWorkerPath, 'utf8');
        
        // Actualizar la versión en el service worker
        content = content.replace(
            /const CACHE_VERSION = '[^']*';/,
            `const CACHE_VERSION = '${newVersion}';`
        );
        
        fs.writeFileSync(serviceWorkerPath, content);
        console.log(`✅ Service Worker actualizado a versión ${newVersion}`);
        
    } catch (error) {
        console.error('❌ Error actualizando Service Worker:', error.message);
        process.exit(1);
    }
}

// Función para actualizar la versión en package.json
function updatePackageJsonVersion(newVersion) {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.version = newVersion;
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ package.json actualizado a versión ${newVersion}`);
        
    } catch (error) {
        console.error('❌ Error actualizando package.json:', error.message);
        process.exit(1);
    }
}

// Función para actualizar la versión en el manifest.json
function updateManifestVersion(newVersion) {
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.version = newVersion;
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
        console.log(`✅ manifest.json actualizado a versión ${newVersion}`);
        
    } catch (error) {
        console.error('❌ Error actualizando manifest.json:', error.message);
        process.exit(1);
    }
}

// Función para incrementar la versión
function incrementVersion(currentVersion, type) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            throw new Error('Tipo de versión no válido. Use: major, minor, o patch');
    }
}

// Función principal
function main() {
    const versionType = process.argv[2];
    
    if (!versionType || !['major', 'minor', 'patch'].includes(versionType)) {
        console.error('❌ Uso: node update-version.js [major|minor|patch]');
        process.exit(1);
    }
    
    try {
        // Leer la versión actual del package.json
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const currentVersion = packageJson.version;
        
        // Calcular la nueva versión
        const newVersion = incrementVersion(currentVersion, versionType);
        
        console.log(`🔄 Actualizando versión de ${currentVersion} a ${newVersion}...`);
        
        // Actualizar todos los archivos
        updatePackageJsonVersion(newVersion);
        updateServiceWorkerVersion(newVersion);
        updateManifestVersion(newVersion);
        
        console.log(`🎉 ¡Versión actualizada exitosamente a ${newVersion}!`);
        console.log('📝 Recuerda hacer commit y push de los cambios.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = {
    incrementVersion,
    updateServiceWorkerVersion,
    updatePackageJsonVersion,
    updateManifestVersion
};

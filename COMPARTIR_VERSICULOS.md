# 📖 Sistema de Compartir Versículos Personalizados

## 🎯 Descripción

Sistema completo para personalizar y compartir versículos del día con imágenes de fondo personalizadas, compatible con PWA y funcionando offline.

## ✨ Funcionalidades Principales

### 1. **Modal de Personalización**
- ✅ Interfaz limpia y moderna con vista previa en tiempo real
- ✅ Panel de opciones a la izquierda, vista previa a la derecha
- ✅ Compatible con modo oscuro
- ✅ Diseño responsive para móviles y tablets

### 2. **Opciones de Personalización**

#### 🖼️ Imagen de Fondo
- **10 fondos predeterminados** en `/assets/backgrounds/`
  - `fondo1.jpg` hasta `fondo10.jpg`
- **Subir imagen propia** desde el dispositivo
- Visualización en miniatura de todas las opciones
- Scroll vertical para ver todos los fondos

#### ✍️ Tipo de Letra
- **4 opciones de fuentes:**
  1. **Serif** - Georgia (elegante, clásica)
  2. **Sans-serif** - Arial (moderna, limpia)
  3. **Cursiva** - Brush Script MT (decorativa)
  4. **Monospace** - Courier New (técnica)

#### 🎨 Color del Texto
- **3 opciones de color:**
  1. **Blanco** - Ideal para fondos oscuros
  2. **Negro** - Ideal para fondos claros
  3. **Dorado** - Elegante y llamativo

#### 📐 Alineación del Texto
- **Centro** - Texto centrado verticalmente
- **Abajo** - Texto alineado en la parte inferior

### 3. **Vista Previa en Tiempo Real**
- 👁️ Actualización instantánea al cambiar cualquier opción
- Resolución optimizada: 1080x1080px (ideal para redes sociales)
- Logo de OrganizApp en esquina inferior derecha
- Overlay oscuro para mejorar legibilidad
- Text shadow para contraste

### 4. **Generación y Compartir**

#### 📱 Compartir (Web Share API)
- **Primera opción**: Si el navegador soporta `navigator.share`
  - Abre el menú nativo de compartir del dispositivo
  - Compatible con WhatsApp, Instagram, Facebook, etc.
  - Comparte como archivo de imagen (no solo link)

#### 📥 Descarga (Fallback)
- **Segunda opción**: Si no soporta Web Share API
  - Descarga automática de la imagen
  - Nombre del archivo: `versiculo-[timestamp].jpg`
  - Formato: JPEG con calidad 95%
  - El usuario puede compartir desde su galería

## 🔧 Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura del modal y elementos
- **Tailwind CSS** - Estilos modernos y responsive
- **JavaScript Vanilla** - Lógica sin frameworks

### Librerías
- **html2canvas 1.4.1** - Generación de imágenes desde HTML
  - CDN: `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`
  - Configuración optimizada para calidad y rendimiento

### APIs Nativas
- **File API** - Para cargar imágenes personalizadas
- **Web Share API** - Para compartir en redes sociales
- **Canvas API** - Para conversión de imagen

## 📂 Estructura de Archivos

```
organizapp_1-master/
├── assets/
│   └── backgrounds/
│       ├── fondo1.jpg
│       ├── fondo2.jpg
│       ├── ...
│       └── fondo10.jpg
├── index.html (Modal de personalización)
├── app.js (Lógica JavaScript)
└── style.css (Estilos personalizados)
```

## 🚀 Flujo de Uso

1. **Usuario abre la app** → Ve el versículo del día
2. **Click en "Compartir versículo"** → Se abre el modal de personalización
3. **Personaliza el versículo:**
   - Selecciona fondo (predefinido o sube uno)
   - Elige tipo de letra
   - Cambia color del texto
   - Ajusta alineación
4. **Ve vista previa en tiempo real**
5. **Click en "Compartir"**:
   - **Móvil**: Se abre menú nativo para compartir
   - **Desktop**: Se descarga la imagen
6. **Comparte** en WhatsApp, Instagram, etc.

## 💾 Compatibilidad PWA

### Funcionamiento Offline
- ✅ Las imágenes de fondo se cachean al primer uso
- ✅ html2canvas cargado desde CDN (se cachea)
- ✅ Funciona completamente sin internet después del primer uso
- ✅ Service Worker cachea todos los recursos necesarios

### Configuración en `service-worker.js`
```javascript
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './assets/backgrounds/fondo1.jpg',
  './assets/backgrounds/fondo2.jpg',
  // ... resto de fondos ...
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];
```

## 🎨 Personalización Adicional

### Agregar Más Fondos
1. Guarda la imagen en `/assets/backgrounds/`
2. Nómbrala: `fondoX.jpg` (donde X es el número siguiente)
3. Agrega el botón en `index.html`:
```html
<button class="verse-bg-option ..." data-bg="fondoX" 
        style="background-image: url('assets/backgrounds/fondoX.jpg');" 
        title="Fondo X"></button>
```

### Cambiar Fuentes
Modifica el objeto `fontFamilies` en `app.js`:
```javascript
const fontFamilies = {
    'nueva': "'Tu Fuente', fallback",
    // ...
};
```

### Agregar Colores
Modifica el objeto `textColors` en `app.js`:
```javascript
const textColors = {
    'nuevo': '#HEX_COLOR',
    // ...
};
```

## 📱 Compatibilidad de Navegadores

| Navegador | Web Share API | Fallback (Descarga) |
|-----------|---------------|---------------------|
| Chrome Mobile | ✅ | ✅ |
| Safari iOS | ✅ | ✅ |
| Firefox Mobile | ⚠️ Limitado | ✅ |
| Chrome Desktop | ❌ | ✅ |
| Firefox Desktop | ❌ | ✅ |
| Safari Desktop | ❌ | ✅ |

**Nota:** Todos los navegadores pueden descargar la imagen. Solo móviles modernos soportan Web Share API.

## 🐛 Resolución de Problemas

### La imagen se descarga en lugar de compartir
- **Causa**: El navegador no soporta Web Share API
- **Solución**: Normal, el usuario puede compartir desde su galería

### Los fondos no se ven
- **Causa**: Las imágenes no están en `/assets/backgrounds/`
- **Solución**: Verificar que existan los archivos `fondo1.jpg` a `fondo10.jpg`

### Error al generar imagen
- **Causa**: html2canvas no está cargado
- **Solución**: Verificar conexión a internet en el primer uso

### Imagen de fondo personalizada no funciona
- **Causa**: Archivo muy grande o formato no soportado
- **Solución**: Usar imágenes JPG o PNG menores a 5MB

## 🔐 Consideraciones de Seguridad

- ✅ Las imágenes se procesan localmente (no se envían a servidor)
- ✅ FileReader API se usa de forma segura
- ✅ No se almacenan datos sensibles
- ✅ CORS habilitado solo para imágenes locales

## 📊 Rendimiento

- ⚡ Generación de imagen: ~2-3 segundos
- ⚡ Tamaño de imagen final: ~300-800 KB
- ⚡ Resolución: 1080x1080px @ 2x scale (2160x2160px)
- ⚡ Calidad JPEG: 95%

## 🎉 Extras Implementados

- ✅ Logo de OrganizApp en la imagen generada
- ✅ Alineación de texto configurable
- ✅ Overlay oscuro para mejor legibilidad
- ✅ Text shadow para contraste
- ✅ Animación de carga al generar
- ✅ Mensajes de feedback al usuario
- ✅ Cierre de modal al hacer clic fuera

## 📝 Notas Finales

Este sistema NO modifica ninguna otra funcionalidad de la app. Solo agrega la capacidad de compartir versículos personalizados de forma visual y atractiva, perfecto para redes sociales.

**¡Comparte la Palabra de Dios con estilo! 🙏✨**


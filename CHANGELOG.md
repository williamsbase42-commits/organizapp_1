# Changelog - OrganizApp

Todas las mejoras y correcciones notables de este proyecto serán documentadas en este archivo.

## [1.0.4] - 2025-01-27

### 🔧 Mejoras Técnicas
- **Modal de Carpetas**: Reducido tamaño de modales de crear/editar carpetas (`max-w-xs` y `mx-2`) para evitar que se salgan de la pantalla
- **Menús de Opciones**: Cambiado de `position: absolute` a `position: fixed` en la generación de HTML para mejor funcionamiento
- **CSS Global**: Estilos globales para todos los menús de opciones con z-index y visibilidad optimizados
- **Debug Mejorado**: Logs específicos para position: fixed con coordenadas absolutas de ventana

### 🐛 Correcciones
- **Modal Responsivo**: Modales de carpetas ahora se ajustan correctamente a pantallas pequeñas
- **Menús en Carpetas**: Implementación definitiva de menús de tres puntos con position: fixed
- **Posicionamiento**: Cálculo mejorado de posición para menús con coordenadas de ventana

### 📱 Experiencia de Usuario
- **Modales Compactos**: Mejor experiencia en dispositivos móviles con modales más pequeños
- **Menús Funcionales**: Los tres puntos ahora deberían funcionar correctamente en todas las tarjetas

---

## [1.0.3] - 2025-01-27

### 🔧 Mejoras Técnicas
- **Scroll en Modales**: Agregado `overflow-y-auto` y `my-4` a modales de agregar/editar elementos para mejor experiencia en pantallas pequeñas
- **Debug Avanzado**: Implementados logs detallados para diagnosticar problemas con menús de tres puntos en carpetas
- **CSS Mejorado**: Estilos adicionales específicos para elementos dentro de carpetas con z-index y overflow optimizados

### 🐛 Correcciones
- **Función Compartir**: Verificada funcionalidad para todas las tarjetas (inicio y carpetas)
- **Menús de Opciones**: Estilos CSS reforzados para garantizar visibilidad de menús en elementos dentro de carpetas

### 📱 Experiencia de Usuario
- **Modales Responsivos**: Mejor manejo de scroll en dispositivos móviles
- **Debug Temporal**: Logs de consola para identificar problemas específicos con menús

---

## [1.0.2] - 2025-01-27

### 🐛 Correcciones
- **Menú de opciones en carpetas**: Arreglado el problema donde los menús de tres puntos de elementos dentro de carpetas no se mostraban correctamente
- **Posición de botones modales**: Corregida la disposición de botones en el modal de nuevo elemento (cancelar a la izquierda, agregar a la derecha)
- **Visibilidad del FAB**: Solucionado el problema donde el botón flotante "+" no aparecía dentro de las carpetas creadas

### 🔧 Mejoras técnicas
- Agregados estilos CSS específicos para menús de opciones dentro de carpetas
- Configurado `overflow: visible` en todos los contenedores relevantes para evitar cortes de menús
- Mejorado el sistema de visibilidad del FAB para mantenerlo visible en todas las vistas de carpetas
- Actualizada la función `handleScrollVisibility()` para no ocultar el FAB en vista de carpetas
- Agregadas llamadas a `ensureFabVisibility()` en funciones de navegación de carpetas

### 📱 PWA
- Actualizado Service Worker a versión v1.0.2
- Actualizado manifest.json con nueva versión
- Mejorado el sistema de detección de actualizaciones

## [1.0.1] - Versión inicial
- Lanzamiento inicial de OrganizApp
- Funcionalidades básicas de gestión de tareas, notas, compras y recordatorios
- Sistema de carpetas implementado
- PWA completamente funcional
- Modo oscuro automático
- Vista de calendario
- Búsqueda en tiempo real

---

### Formato del Changelog
- **🐛 Correcciones**: Cambios que corrigen problemas
- **✨ Nuevas características**: Nuevas funcionalidades añadidas
- **🔧 Mejoras técnicas**: Mejoras en el código sin cambios visibles al usuario
- **📱 PWA**: Cambios relacionados con la funcionalidad PWA
- **⚡ Rendimiento**: Mejoras de rendimiento
- **🔒 Seguridad**: Cambios relacionados con seguridad

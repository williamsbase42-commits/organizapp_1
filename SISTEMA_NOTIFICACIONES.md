# Sistema de Notificaciones para Móviles 📱🔔

## Descripción

OrganizApp ahora cuenta con un sistema completo de notificaciones optimizado para dispositivos móviles. Las notificaciones llegan directamente a la bandeja de notificaciones del celular, incluso cuando la app está cerrada.

## 🎯 Características Principales

### ✅ Notificaciones en la Bandeja del Celular
- **Las notificaciones aparecen en la bandeja de notificaciones** del sistema operativo (Android/iOS)
- Funcionan incluso cuando la app está cerrada o en segundo plano
- Incluyen vibración para alertar al usuario
- Se mantienen visibles hasta que el usuario las revise

### 📲 Soporte Multiplataforma
- **Android**: Soporte completo con acciones interactivas
- **iOS**: Soporte completo cuando se instala como PWA
- **Desktop**: Notificaciones del navegador

### 🔔 Tipos de Notificaciones

#### 1. Notificaciones de Recordatorios
- Se envían en los siguientes momentos:
  - **24 horas antes** del recordatorio
  - **12 horas antes** del recordatorio
  - **2 horas antes** del recordatorio
  - **30 minutos antes** del recordatorio
  - **5 minutos antes** del recordatorio
  - **En el momento exacto** del recordatorio

#### 2. Notificación de Prueba
- Al activar las notificaciones por primera vez
- Confirma que el sistema está funcionando correctamente

### 🎨 Elementos de la Notificación

Cada notificación incluye:
- **Título**: ⏰ + Contenido del recordatorio
- **Cuerpo**: Tiempo relativo al recordatorio
- **Icono**: Logo de OrganizApp
- **Vibración**: Patrón de vibración (300ms, pausa, 300ms)
- **Badge**: Insignia para iOS
- **Acciones interactivas**:
  - 👁️ **Ver**: Abre la app y navega al recordatorio
  - ✅ **Completar**: Marca el recordatorio como completado

## 🚀 Cómo Funciona

### Activación de Notificaciones

1. **Activación Automática**:
   - La app solicita permisos automáticamente cuando creas tu primer recordatorio
   - También pregunta al iniciar la app si tienes recordatorios pendientes

2. **Activación Manual**:
   - La app mostrará un mensaje pidiendo activar las notificaciones
   - Simplemente acepta el permiso cuando el navegador lo solicite

### Flujo de Trabajo

```
1. Usuario crea un recordatorio con fecha y hora
   ↓
2. OrganizApp solicita permisos de notificación (si no están otorgados)
   ↓
3. Sistema programa 6 notificaciones (24h, 12h, 2h, 30min, 5min, momento exacto)
   ↓
4. En cada momento programado:
   - Se envía la notificación a la bandeja del celular
   - El celular vibra
   - Se reproduce un sonido
   ↓
5. Usuario recibe la notificación y puede:
   - Ver: Abre la app en ese recordatorio
   - Completar: Marca como completado sin abrir la app
   - Ignorar: La notificación permanece en la bandeja
```

## 💻 Implementación Técnica

### Service Worker
El sistema usa Service Workers para enviar notificaciones persistentes:
- Las notificaciones funcionan incluso con la app cerrada
- Maneja clics en notificaciones y acciones
- Actualiza el estado de los recordatorios

### Notification API
- Usa la API de Notificaciones del navegador
- Compatible con Chrome, Firefox, Safari (PWA)
- Incluye soporte para vibración en dispositivos móviles

### Características Técnicas
```javascript
// Notificación con todas las características
{
  title: "⏰ [Contenido del recordatorio]",
  body: "Recordatorio: [Tiempo relativo]",
  icon: "./icons/logo-1.png",
  badge: "./icons/logo-1.png",
  vibrate: [300, 100, 300, 100, 300],
  requireInteraction: true,
  actions: [
    { action: "view", title: "👁️ Ver" },
    { action: "complete", title: "✅ Completar" }
  ]
}
```

## 📝 Requisitos

### Para que funcionen las notificaciones necesitas:

1. **Navegador Compatible**:
   - Chrome/Edge (Android/Desktop)
   - Safari (iOS, requiere instalación como PWA)
   - Firefox (Android/Desktop)

2. **Conexión HTTPS o localhost**:
   - Las notificaciones solo funcionan en sitios seguros (HTTPS)
   - O en localhost para desarrollo

3. **Permisos Otorgados**:
   - Debes permitir las notificaciones cuando el navegador lo solicite
   - Los permisos pueden cambiarse en la configuración del navegador

4. **Para móviles (Recomendado)**:
   - Instalar OrganizApp como PWA (Progressive Web App)
   - Esto permite notificaciones incluso con la app cerrada

## 🔧 Solución de Problemas

### ❌ No recibo notificaciones

**Verifica:**
1. **Permisos**: Ve a la configuración del navegador y asegúrate de que las notificaciones están permitidas
2. **PWA**: En móviles, instala la app desde el menú del navegador
3. **Hora del recordatorio**: Las notificaciones solo se envían para recordatorios futuros con hora específica
4. **App abierta**: En algunas versiones, la app necesita estar abierta al menos una vez

### ⚠️ Las notificaciones no tienen sonido

- En Android: Verifica el volumen de notificaciones
- En iOS: Las notificaciones de PWA usan el sonido del sistema
- En Desktop: Verifica la configuración de notificaciones del sistema operativo

### 🔕 Notificaciones bloqueadas

Si bloqueaste las notificaciones por error:

**Chrome (Android/Desktop)**:
1. Ve a Configuración → Privacidad y seguridad → Configuración del sitio → Notificaciones
2. Busca OrganizApp y cambia el permiso a "Permitir"

**Safari (iOS)**:
1. Ajustes → Safari → Avanzado → Notificaciones
2. Busca el sitio y activa las notificaciones

## 📱 Instalación como PWA

Para mejor experiencia en móviles:

### Android (Chrome)
1. Abre OrganizApp
2. Toca el menú (⋮)
3. Selecciona "Instalar app" o "Agregar a pantalla de inicio"

### iOS (Safari)
1. Abre OrganizApp
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"

## 🎯 Beneficios

✅ **Nunca olvides un recordatorio**: Recibirás múltiples alertas antes del evento
✅ **Trabaja en segundo plano**: No necesitas tener la app abierta
✅ **Acciones rápidas**: Completa tareas directamente desde la notificación
✅ **Vibración**: Alerta táctil en dispositivos móviles
✅ **Persistentes**: Las notificaciones permanecen hasta que las revises

## 🔒 Privacidad

- **Todas las notificaciones son locales**: No se envían datos a servidores externos
- **Tus datos permanecen en tu dispositivo**: El sistema funciona 100% offline
- **Sin seguimiento**: No se recopila información sobre las notificaciones

## 📊 Estado del Sistema

La app muestra el estado de las notificaciones:
- 🔔 **Verde**: Notificaciones activas
- 🔕 **Rojo**: Notificaciones bloqueadas
- 🔔 **Amarillo**: Permisos pendientes

## 🆕 Actualizaciones Futuras

Próximamente:
- [ ] Notificaciones recurrentes (diarias, semanales)
- [ ] Notificaciones de tareas pendientes
- [ ] Personalización de tiempos de notificación
- [ ] Sonidos personalizados
- [ ] Prioridad de notificaciones

---

**Versión del Sistema**: 2.0.6+  
**Última Actualización**: Octubre 2025  
**Desarrollado para**: OrganizApp PWA


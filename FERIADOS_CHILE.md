# Feriados de Chile en OrganizApp 🇨🇱

## Descripción

Este documento detalla todos los feriados de Chile implementados en OrganizApp. Los feriados se muestran automáticamente en el calendario con un indicador visual especial (🎉) y un fondo rojo distintivo.

## Feriados Implementados

### Feriados Fijos

Los siguientes feriados se celebran en la misma fecha cada año:

1. **Año Nuevo** - 1 de enero ✅ *Irrenunciable*
2. **Día del Trabajo** - 1 de mayo ✅ *Irrenunciable*
3. **Día de las Glorias Navales** - 21 de mayo
4. **Día Nacional de los Pueblos Indígenas** - 20 de junio (solsticio de invierno)
5. **San Pedro y San Pablo** - 29 de junio
6. **Día de la Virgen del Carmen** - 16 de julio
7. **Asunción de la Virgen** - 15 de agosto
8. **Día de la Independencia** - 18 de septiembre ✅ *Irrenunciable*
9. **Día de las Glorias del Ejército** - 19 de septiembre ✅ *Irrenunciable*
10. **Feriado adicional Fiestas Patrias** - 20 de septiembre
11. **Encuentro de Dos Mundos** - 12 de octubre
12. **Día de las Iglesias Evangélicas y Protestantes** - 31 de octubre
13. **Día de Todos los Santos** - 1 de noviembre
14. **Inmaculada Concepción** - 8 de diciembre
15. **Navidad** - 25 de diciembre ✅ *Irrenunciable*
16. **Feriado Bancario (Fin de Año)** - 31 de diciembre

### Feriados Móviles

Los siguientes feriados cambian de fecha cada año según el calendario religioso:

1. **Viernes Santo** - Calculado según Semana Santa ✅ *Irrenunciable*
2. **Sábado Santo** - Calculado según Semana Santa ✅ *Irrenunciable*

### Feriados con Traslado

Algunos feriados se trasladan al lunes siguiente cuando caen entre martes y viernes:

1. **San Pedro y San Pablo** (29 de junio)
2. **Encuentro de Dos Mundos** (12 de octubre)

## Características Técnicas

### Cálculo Automático

- **Feriados Fijos**: Se muestran automáticamente para cualquier año
- **Pascua y Semana Santa**: Se calculan usando el algoritmo de Meeus para mayor precisión
- **Feriados Trasladados**: Se determinan automáticamente según el día de la semana

### Visualización en el Calendario

- **Indicador Visual**: Los días feriados muestran el emoji 🎉 seguido del nombre del feriado
- **Fondo Distintivo**: Los días feriados tienen un fondo rojo degradado
- **Tooltip**: Al pasar el mouse sobre un feriado, se muestra el nombre completo
- **Detalles del Día**: Al seleccionar un día feriado, se muestra una tarjeta especial con la información completa

### Feriados Irrenunciables

Los feriados marcados como "irrenunciables" son aquellos en los que todos los trabajadores tienen derecho a descanso según la legislación chilena:

- Año Nuevo (1 de enero)
- Viernes Santo y Sábado Santo
- Día de la Independencia (18 de septiembre)
- Día de las Glorias del Ejército (19 de septiembre)
- Navidad (25 de diciembre)
- Día del Trabajo (1 de mayo)

## Estilos Visuales

### Modo Claro
- Fondo: Degradado rojo suave
- Borde: Rojo semi-transparente
- Texto del indicador: Rojo oscuro sobre fondo rosado

### Modo Oscuro
- Fondo: Degradado rojo oscuro
- Borde: Rojo brillante semi-transparente
- Texto del indicador: Rosa claro sobre fondo rojo oscuro

## Responsive

El sistema de feriados está completamente optimizado para dispositivos móviles:
- En pantallas pequeñas, el tamaño del texto se reduce automáticamente
- Los indicadores de feriados se adaptan al espacio disponible
- El texto largo se trunca con puntos suspensivos

## Notas Importantes

1. **Actualizaciones Anuales**: Algunos feriados pueden variar según decretos gubernamentales específicos
2. **Feriado del 20 de septiembre**: Aunque está incluido, su aplicación puede variar según el año
3. **Feriados Regionales**: Esta implementación incluye solo feriados nacionales, no regionales
4. **Día de los Pueblos Indígenas**: Reemplaza al anterior "Día del Descubrimiento de América"

## Implementación Técnica

### Archivos Modificados

1. **app.js**: Lógica de cálculo y renderizado de feriados
   - Función `calcularPascua(year)`: Calcula la fecha de Pascua
   - Función `obtenerFeriadosChile(year)`: Retorna todos los feriados del año
   - Función `esFeriadoChile(dateStr)`: Verifica si una fecha específica es feriado
   - Modificación de `renderCalendar()`: Integra los feriados en la visualización
   - Modificación de `renderDayDetails()`: Muestra información detallada del feriado

2. **style.css**: Estilos visuales para los feriados
   - Clase `.calendar-day.holiday`: Estilo del día completo
   - Clase `.calendar-holiday-indicator`: Estilo del indicador de feriado
   - Media queries responsive para móviles

## Uso

Los feriados se muestran automáticamente en el calendario. No se requiere ninguna acción del usuario para activarlos o visualizarlos.

### Para ver un feriado:
1. Navega a la vista de **Calendario** 📅
2. Los días feriados se mostrarán con un fondo rojo y el indicador 🎉
3. Haz clic en un día feriado para ver los detalles completos

---

**Versión**: 1.0  
**Última actualización**: Octubre 2025  
**Autor**: OrganizApp Team


// ================================================================
// ORGANIZAPP - SISTEMA DE LISTA DE COMPRAS
// ================================================================
// Sistema para manejar listas de compras cuando el tipo es "Compra"
// ================================================================

'use strict';

// console.log('🛒 Cargando sistema de lista de compras...');

// Variables globales
let currentShoppingList = []; // Lista temporal de items
let editShoppingList = []; // Lista temporal para edición

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeShoppingListSystem();
});

function initializeShoppingListSystem() {
    // console.log('🛒 Iniciando sistema de lista de compras...');
    
    // ========================================
    // MODAL DE CREAR
    // ========================================
    const typeSelector = document.getElementById('type-selector');
    const shoppingListContainer = document.getElementById('shopping-list-container');
    const toggleBtn = document.getElementById('toggle-shopping-list-btn');
    const shoppingListContent = document.getElementById('shopping-list-content');
    const toggleIcon = document.getElementById('shopping-list-toggle-icon');
    const addItemBtn = document.getElementById('add-shopping-item-btn');
    const itemInput = document.getElementById('shopping-item-input');
    
    // Mostrar/ocultar lista según el tipo seleccionado
    if (typeSelector) {
        typeSelector.addEventListener('change', function() {
            if (this.value === 'Compra') {
                shoppingListContainer.classList.remove('hidden');
            } else {
                shoppingListContainer.classList.add('hidden');
                shoppingListContent.classList.add('hidden');
                toggleIcon.textContent = '▼';
                currentShoppingList = [];
                renderShoppingList('shopping-items-list', currentShoppingList);
            }
        });
    }
    
    // Toggle expandir/colapsar lista
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (shoppingListContent.classList.contains('hidden')) {
                shoppingListContent.classList.remove('hidden');
                toggleIcon.textContent = '▲';
            } else {
                shoppingListContent.classList.add('hidden');
                toggleIcon.textContent = '▼';
            }
        });
    }
    
    // Agregar item a la lista
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            addShoppingItem(itemInput, currentShoppingList, 'shopping-items-list');
        });
    }
    
    // Enter key en input
    if (itemInput) {
        itemInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addShoppingItem(itemInput, currentShoppingList, 'shopping-items-list');
            }
        });
    }
    
    // ========================================
    // MODAL DE EDITAR
    // ========================================
    const editTypeSelector = document.getElementById('edit-type-selector');
    const editShoppingListContainer = document.getElementById('edit-shopping-list-container');
    const editToggleBtn = document.getElementById('edit-toggle-shopping-list-btn');
    const editShoppingListContent = document.getElementById('edit-shopping-list-content');
    const editToggleIcon = document.getElementById('edit-shopping-list-toggle-icon');
    const editAddItemBtn = document.getElementById('edit-add-shopping-item-btn');
    const editItemInput = document.getElementById('edit-shopping-item-input');
    
    // Mostrar/ocultar lista según el tipo seleccionado
    if (editTypeSelector) {
        editTypeSelector.addEventListener('change', function() {
            if (this.value === 'Compra') {
                editShoppingListContainer.classList.remove('hidden');
            } else {
                editShoppingListContainer.classList.add('hidden');
                editShoppingListContent.classList.add('hidden');
                editToggleIcon.textContent = '▼';
            }
        });
    }
    
    // Toggle expandir/colapsar lista
    if (editToggleBtn) {
        editToggleBtn.addEventListener('click', function() {
            if (editShoppingListContent.classList.contains('hidden')) {
                editShoppingListContent.classList.remove('hidden');
                editToggleIcon.textContent = '▲';
            } else {
                editShoppingListContent.classList.add('hidden');
                editToggleIcon.textContent = '▼';
            }
        });
    }
    
    // Agregar item a la lista
    if (editAddItemBtn) {
        editAddItemBtn.addEventListener('click', function() {
            addShoppingItem(editItemInput, editShoppingList, 'edit-shopping-items-list');
        });
    }
    
    // Enter key en input
    if (editItemInput) {
        editItemInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addShoppingItem(editItemInput, editShoppingList, 'edit-shopping-items-list');
            }
        });
    }
    
    // ========================================
    // LIMPIAR AL CERRAR MODALES
    // ========================================
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            currentShoppingList = [];
            renderShoppingList('shopping-items-list', currentShoppingList);
        });
    }
    
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', function() {
            editShoppingList = [];
            renderShoppingList('edit-shopping-items-list', editShoppingList);
        });
    }
    
    // console.log('✅ Sistema de lista de compras inicializado');
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Agrega un item a la lista de compras
 */
function addShoppingItem(inputElement, list, containerId) {
    const itemText = inputElement.value.trim();
    
    if (itemText === '') {
        showSystemMessage('⚠️ Escribe el nombre del artículo', 'warning');
        return;
    }
    
    // Agregar item a la lista
    list.push({
        item: itemText,
        done: false
    });
    
    // Limpiar input
    inputElement.value = '';
    
    // Re-renderizar lista
    renderShoppingList(containerId, list);
    
    console.log('🛒 Item agregado:', itemText);
}

/**
 * Renderiza la lista de compras en el DOM
 */
function renderShoppingList(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay artículos en la lista</p>';
        return;
    }
    
    container.innerHTML = '';
    
    list.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600';
        
        // Checkbox + Texto
        const leftDiv = document.createElement('div');
        leftDiv.className = 'flex items-center gap-2 flex-1';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.done;
        checkbox.className = 'w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500';
        checkbox.addEventListener('change', function() {
            item.done = this.checked;
            itemText.classList.toggle('line-through', this.checked);
            itemText.classList.toggle('text-gray-400', this.checked);
        });
        
        const itemText = document.createElement('span');
        itemText.className = `text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`;
        itemText.textContent = item.item;
        
        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(itemText);
        
        // Botón eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'px-2 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Eliminar';
        deleteBtn.addEventListener('click', function() {
            list.splice(index, 1);
            renderShoppingList(containerId, list);
        });
        
        itemDiv.appendChild(leftDiv);
        itemDiv.appendChild(deleteBtn);
        
        container.appendChild(itemDiv);
    });
}

/**
 * Obtiene la lista de compras actual del modal de crear
 */
function getCurrentShoppingList() {
    return [...currentShoppingList];
}

/**
 * Obtiene la lista de compras actual del modal de editar
 */
function getEditShoppingList() {
    return [...editShoppingList];
}

/**
 * Carga una lista de compras en el modal de editar
 */
function loadShoppingListInEdit(shoppingList) {
    if (!shoppingList || !Array.isArray(shoppingList)) {
        editShoppingList = [];
    } else {
        editShoppingList = [...shoppingList];
    }
    
    renderShoppingList('edit-shopping-items-list', editShoppingList);
    
    // Mostrar el contenedor si hay items
    if (editShoppingList.length > 0) {
        const editShoppingListContent = document.getElementById('edit-shopping-list-content');
        const editToggleIcon = document.getElementById('edit-shopping-list-toggle-icon');
        
        if (editShoppingListContent) {
            editShoppingListContent.classList.remove('hidden');
            if (editToggleIcon) {
                editToggleIcon.textContent = '▲';
            }
        }
    }
}

/**
 * Limpia la lista temporal de crear
 */
function clearCreateShoppingList() {
    currentShoppingList = [];
    renderShoppingList('shopping-items-list', currentShoppingList);
}

/**
 * Limpia la lista temporal de editar
 */
function clearEditShoppingList() {
    editShoppingList = [];
    renderShoppingList('edit-shopping-items-list', editShoppingList);
}

// ============================================================
// RENDERIZAR LISTAS EN TARJETAS DE ITEMS
// ============================================================

/**
 * Agrega la lista de compras visible en las tarjetas de items
 */
function addShoppingListsToItems() {
    if (!items || !Array.isArray(items)) return;
    
    items.forEach(item => {
        // Solo procesar items de tipo "Compra" que tengan lista
        if (item.type !== 'Compra' || !item.shoppingList || !Array.isArray(item.shoppingList) || item.shoppingList.length === 0) {
            return;
        }
        
        // ✅ VERIFICAR SI EL ITEM ESTÁ EN UNA CARPETA BLOQUEADA
        if (item.folderId) {
            // Verificar si la carpeta tiene clave de acceso
            if (typeof hasFolderAccessKey === 'function' && hasFolderAccessKey(item.folderId)) {
                // Verificar si la carpeta está desbloqueada en esta sesión
                const unlockedFolders = sessionStorage.getItem('unlockedFolders');
                const unlockedList = unlockedFolders ? JSON.parse(unlockedFolders) : [];
                
                // Si la carpeta NO está desbloqueada, NO mostrar la lista
                if (!unlockedList.includes(item.folderId)) {
                    // console.log('🔒 Lista de compras oculta (carpeta bloqueada):', item.id);
                    return;
                }
            }
        }
        
        // Buscar el elemento del item
        let itemElement = document.getElementById(`item-${item.id}`);
        if (!itemElement) {
            itemElement = document.querySelector(`[data-item-id="${item.id}"]`);
        }
        if (!itemElement) return;
        
        // Verificar si ya existe la lista renderizada
        if (itemElement.querySelector('.shopping-list-preview')) return;
        
        // Buscar el contenedor flex-grow
        const contentContainer = itemElement.querySelector('.flex-grow');
        if (!contentContainer) return;
        
        // Crear el contenedor de la lista de compras
        const shoppingListWrapper = document.createElement('div');
        shoppingListWrapper.className = 'shopping-list-preview';
        shoppingListWrapper.style.cssText = 'display: block; width: 100%; margin-top: 0.75rem; clear: both;';
        
        // Título de la sección
        const title = document.createElement('div');
        title.className = 'flex items-center gap-2 mb-2';
        title.innerHTML = '<span class="text-sm font-semibold text-green-600 dark:text-green-400">🛒 Lista de compras</span>';
        shoppingListWrapper.appendChild(title);
        
        // Contenedor de items
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'space-y-1.5 bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 border border-green-200 dark:border-green-800';
        
        // Mostrar solo los primeros 3 items
        const maxVisible = 3;
        const visibleItems = item.shoppingList.slice(0, maxVisible);
        const hasMore = item.shoppingList.length > maxVisible;
        
        visibleItems.forEach((shoppingItem, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center gap-2 text-sm';
            
            const checkbox = document.createElement('span');
            checkbox.textContent = shoppingItem.done ? '☑' : '☐';
            checkbox.className = (shoppingItem.done 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-gray-400 dark:text-gray-500') + ' cursor-pointer hover:scale-110 transition-transform';
            checkbox.style.cursor = 'pointer';
            
            // Agregar evento de clic para marcar/desmarcar
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                // Cambiar el estado del item
                shoppingItem.done = !shoppingItem.done;
                
                // Actualizar visualmente el checkbox
                checkbox.textContent = shoppingItem.done ? '☑' : '☐';
                checkbox.className = (shoppingItem.done 
                    ? 'text-green-500 dark:text-green-400' 
                    : 'text-gray-400 dark:text-gray-500') + ' cursor-pointer hover:scale-110 transition-transform';
                
                // Actualizar visualmente el texto
                text.className = shoppingItem.done 
                    ? 'text-gray-500 dark:text-gray-400 line-through' 
                    : 'text-gray-700 dark:text-gray-300';
                
                // Guardar cambios en el array global de items
                if (typeof saveItems === 'function') {
                    saveItems();
                }
                
                // Actualizar el contador de completados si está visible
                const counterDiv = itemElement.querySelector('.shopping-list-preview .text-xs.text-center');
                if (counterDiv) {
                    const completed = item.shoppingList.filter(i => i.done).length;
                    const total = item.shoppingList.length;
                    counterDiv.innerHTML = `✅ <strong>${completed}</strong> de <strong>${total}</strong> completados`;
                }
            });
            
            const text = document.createElement('span');
            text.textContent = shoppingItem.item;
            text.className = shoppingItem.done 
                ? 'text-gray-500 dark:text-gray-400 line-through' 
                : 'text-gray-700 dark:text-gray-300';
            
            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(text);
            itemsContainer.appendChild(itemDiv);
        });
        
        shoppingListWrapper.appendChild(itemsContainer);
        
        // Si hay más items, agregar botón "Ver más"
        if (hasMore) {
            const viewMoreBtn = document.createElement('button');
            viewMoreBtn.className = 'mt-2 w-full px-3 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md';
            viewMoreBtn.textContent = `Ver todos (${item.shoppingList.length} items)`;
            viewMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openShoppingListModal(item);
            });
            shoppingListWrapper.appendChild(viewMoreBtn);
        } else {
            // Mostrar contador si todos los items son visibles
            const completed = item.shoppingList.filter(i => i.done).length;
            const total = item.shoppingList.length;
            const counterDiv = document.createElement('div');
            counterDiv.className = 'mt-2 text-xs text-center text-gray-600 dark:text-gray-400';
            counterDiv.innerHTML = `✅ <strong>${completed}</strong> de <strong>${total}</strong> completados`;
            shoppingListWrapper.appendChild(counterDiv);
        }
        
        // Insertar antes de la imagen (si existe) o al final
        const imagePreview = contentContainer.querySelector('.item-image-thumbnail');
        if (imagePreview) {
            contentContainer.insertBefore(shoppingListWrapper, imagePreview);
        } else {
            contentContainer.appendChild(shoppingListWrapper);
        }
    });
}

/**
 * Abre el modal para ver la lista completa
 */
function openShoppingListModal(item) {
    if (!item || !item.shoppingList || !Array.isArray(item.shoppingList)) return;
    
    const modal = document.getElementById('view-shopping-list-modal');
    const titleElement = document.querySelector('#view-shopping-list-title p');
    const itemsContainer = document.getElementById('view-shopping-list-items');
    const completedCount = document.getElementById('completed-count');
    const totalCount = document.getElementById('total-count');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressBar = document.getElementById('progress-bar');
    
    if (!modal || !itemsContainer) return;
    
    // Establecer título
    if (titleElement) {
        titleElement.textContent = item.content || 'Lista de compras';
    }
    
    // Limpiar items anteriores
    itemsContainer.innerHTML = '';
    
    // Renderizar todos los items
    item.shoppingList.forEach(shoppingItem => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center gap-3 p-3 bg-white/70 dark:bg-gray-700/70 rounded-lg border border-green-200 dark:border-green-800 transition-all hover:shadow-md';
        
        const checkbox = document.createElement('span');
        checkbox.textContent = shoppingItem.done ? '☑' : '☐';
        checkbox.className = (shoppingItem.done 
            ? 'text-2xl text-green-500 dark:text-green-400' 
            : 'text-2xl text-gray-400 dark:text-gray-500') + ' cursor-pointer hover:scale-110 transition-transform';
        checkbox.style.cursor = 'pointer';
        
        // Agregar evento de clic para marcar/desmarcar
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            // Cambiar el estado del item
            shoppingItem.done = !shoppingItem.done;
            
            // Actualizar visualmente el checkbox
            checkbox.textContent = shoppingItem.done ? '☑' : '☐';
            checkbox.className = (shoppingItem.done 
                ? 'text-2xl text-green-500 dark:text-green-400' 
                : 'text-2xl text-gray-400 dark:text-gray-500') + ' cursor-pointer hover:scale-110 transition-transform';
            
            // Actualizar visualmente el texto
            text.className = shoppingItem.done 
                ? 'flex-1 text-sm text-gray-500 dark:text-gray-400 line-through' 
                : 'flex-1 text-sm text-gray-700 dark:text-gray-300 font-medium';
            
            // Guardar cambios
            if (typeof saveItems === 'function') {
                saveItems();
            }
            
            // Actualizar estadísticas del modal
            const completed = item.shoppingList.filter(i => i.done).length;
            const total = item.shoppingList.length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            if (completedCount) completedCount.textContent = completed;
            if (totalCount) totalCount.textContent = total;
            if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
            if (progressBar) progressBar.style.width = `${percentage}%`;
        });
        
        const text = document.createElement('span');
        text.textContent = shoppingItem.item;
        text.className = shoppingItem.done 
            ? 'flex-1 text-sm text-gray-500 dark:text-gray-400 line-through' 
            : 'flex-1 text-sm text-gray-700 dark:text-gray-300 font-medium';
        
        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(text);
        itemsContainer.appendChild(itemDiv);
    });
    
    // Calcular estadísticas
    const completed = item.shoppingList.filter(i => i.done).length;
    const total = item.shoppingList.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (completedCount) completedCount.textContent = completed;
    if (totalCount) totalCount.textContent = total;
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    
    // Mostrar modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de visualización
 */
function closeShoppingListModal() {
    const modal = document.getElementById('view-shopping-list-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Refrescar las listas de compras visibles en las tarjetas
        setTimeout(() => {
            // Limpiar listas existentes
            document.querySelectorAll('.shopping-list-preview').forEach(el => el.remove());
            
            // Re-renderizar todas las listas de compras
            if (typeof window.addShoppingListsToItems === 'function') {
                window.addShoppingListsToItems();
            }
        }, 100);
    }
}

// Event listeners para cerrar el modal
document.addEventListener('DOMContentLoaded', function() {
    const closeBtn1 = document.getElementById('close-view-shopping-list-btn');
    const closeBtn2 = document.getElementById('close-view-shopping-list-btn-bottom');
    
    if (closeBtn1) {
        closeBtn1.addEventListener('click', closeShoppingListModal);
    }
    
    if (closeBtn2) {
        closeBtn2.addEventListener('click', closeShoppingListModal);
    }
    
    // Cerrar al hacer clic fuera del modal
    const modal = document.getElementById('view-shopping-list-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeShoppingListModal();
            }
        });
    }
});

// ============================================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================================
window.getCurrentShoppingList = getCurrentShoppingList;
window.getEditShoppingList = getEditShoppingList;
window.loadShoppingListInEdit = loadShoppingListInEdit;
window.clearCreateShoppingList = clearCreateShoppingList;
window.clearEditShoppingList = clearEditShoppingList;
window.addShoppingListsToItems = addShoppingListsToItems;

// console.log('✅ Sistema de lista de compras cargado correctamente');


// ================================================================
// ORGANIZAPP - INTEGRACIÓN DEL SISTEMA DE IMÁGENES CON APP.JS
// ================================================================
// Este archivo extiende las funcionalidades de app.js para soportar imágenes
// ================================================================

'use strict';

// console.log('🔗 Cargando integración del sistema de imágenes...');

// Esperar a que el DOM y app.js estén completamente cargados
document.addEventListener('DOMContentLoaded', function() {
    // Dar tiempo a que app.js se inicialice completamente
    setTimeout(initializeImageIntegration, 500);
    
    // Interceptar renderDayDetails después de que todo esté cargado
    setTimeout(interceptCalendarFunctions, 1500);
});

function initializeImageIntegration() {
    // console.log('🔗 Iniciando integración de imágenes con app.js...');

    // ============================================================
    // RENDERIZAR IMÁGENES EN CARGA INICIAL
    // ============================================================
    // Esperar a que los items estén cargados y renderizados
    setTimeout(() => {
        // console.log('🖼️ Renderizando imágenes en carga inicial...');
        addImagesToRenderedItems();
        addImagesToFolders();
        
        // Renderizar listas de compras
        if (typeof window.addShoppingListsToItems === 'function') {
            window.addShoppingListsToItems();
            // console.log('🛒 Listas de compras renderizadas en carga inicial');
        }
        
        // Agregar event listeners a imágenes de carpetas
        attachFolderImageClickListeners();
    }, 1000);

    // Observar cambios en el DOM para agregar imágenes dinámicamente
    // setupDOMObserver(); // Comentado temporalmente

    // ============================================================
    // EXTENDER FUNCIÓN renderFoldersList PARA CARPETAS
    // ============================================================
    if (typeof window.renderFoldersList === 'function') {
        const originalRenderFoldersList = window.renderFoldersList;
        window.renderFoldersList = function() {
            // Llamar a la función original
            originalRenderFoldersList.call(this);
            
            // Agregar event listeners a las imágenes después de renderizar
            setTimeout(() => {
                attachFolderImageClickListeners();
            }, 100);
        };
    }

    // ============================================================
    // EXTENDER FUNCIÓN addItem
    // ============================================================
    if (typeof window.addItem === 'function') {
        const originalAddItem = window.addItem;
        window.addItem = function(content, type, colorClass, statusClass, date, folderId, time) {
            // Obtener imagen si existe del modal de crear
            const imageData = getCurrentItemCreateImage();
            
            // Obtener lista de compras si el tipo es "Compra"
            const shoppingList = (type === 'Compra' && typeof getCurrentShoppingList === 'function') 
                ? getCurrentShoppingList() 
                : null;
            
            // Llamar a la función original
            originalAddItem.call(this, content, type, colorClass, statusClass, date, folderId, time);
            
            // Si hay imagen o lista de compras, agregarlas al último item (items[0] es el más reciente)
            if (items && items.length > 0) {
                if (imageData) {
                    items[0].image = imageData;
                    // console.log('✅ [CREATE ITEM] Imagen guardada con nuevo item');
                }
                
                if (shoppingList && shoppingList.length > 0) {
                    items[0].shoppingList = shoppingList;
                    // console.log('🛒 [CREATE ITEM] Lista de compras guardada:', shoppingList.length, 'items');
                }
                
                if (imageData || (shoppingList && shoppingList.length > 0)) {
                    saveItems();
                }
                
                // Limpiar lista temporal
                if (typeof clearCreateShoppingList === 'function') {
                    clearCreateShoppingList();
                }
            }
        };
    }

    // ============================================================
    // EXTENDER FUNCIÓN renderFolderItems PARA CARPETAS
    // ============================================================
    if (typeof window.renderFolderItems === 'function') {
        const originalRenderFolderItems = window.renderFolderItems;
        window.renderFolderItems = function(folderId) {
            // console.log('🔗 Interceptando renderFolderItems para:', folderId);
            
            // Llamar a la función original
            originalRenderFolderItems.call(this, folderId);
            
            // Renderizar imágenes después de un pequeño delay
            setTimeout(() => {
                // console.log('🖼️ Agregando imágenes a items de carpeta');
                addImagesToRenderedItems();
            }, 200);
        };
    }

    // ============================================================
    // EXTENDER FUNCIÓN updateItemContent PARA EDICIÓN
    // ============================================================
    if (typeof window.editingItemId !== 'undefined') {
        // Interceptar el botón de guardar edición
        const editSaveBtn = document.getElementById('edit-save-btn');
        if (editSaveBtn) {
            editSaveBtn.addEventListener('click', function(e) {
                const imageData = getCurrentTempImage('edit');
                if (imageData && window.editingItemId && items) {
                    const item = items.find(i => i.id === window.editingItemId);
                    if (item) {
                        item.image = imageData;
                        item.updatedAt = Date.now();
                    }
                }
            }, {capture: true});
        }
    }

    // ============================================================
    // EXTENDER renderList PARA MOSTRAR IMÁGENES
    // ============================================================
    if (typeof window.renderList === 'function') {
        const originalRenderList = window.renderList;
        window.renderList = function() {
            originalRenderList.call(this);
            
            // Agregar imágenes a los items renderizados
            setTimeout(() => {
                addImagesToRenderedItems();
            }, 100);
        };
    }

    // ============================================================
    // EXTENDER openEditModal PARA ITEMS (NOTAS, RECORDATORIOS, ETC)
    // ============================================================
    // Variable para almacenar el ID del item que se está editando
    let currentEditingItemId = null;
    
    // Interceptar la función openEditModal para cargar imagen y lista de compras existente
    if (typeof window.openEditModal === 'function') {
        const originalOpenEditModal = window.openEditModal;
        window.openEditModal = function(itemId) {
            // Capturar el ID cuando se abre el modal
            currentEditingItemId = itemId;
            // console.log('📝 [EDIT ITEM] Modal abierto para item:', itemId);
            
            // Llamar a la función original
            const result = originalOpenEditModal.call(this, itemId);
            
            // Cargar la imagen y lista de compras existente si las hay
            setTimeout(() => {
                if (items) {
                    const item = items.find(i => i.id === itemId);
                    if (item) {
                        // Cargar imagen
                        if (item.image) {
                            window.loadImageInEditModal(item.image);
                            // console.log('🖼️ [EDIT ITEM] Imagen existente cargada en el modal');
                        }
                        
                        // Cargar lista de compras
                        if (item.type === 'Compra' && item.shoppingList && typeof loadShoppingListInEdit === 'function') {
                            loadShoppingListInEdit(item.shoppingList);
                            // console.log('🛒 [EDIT ITEM] Lista de compras cargada:', item.shoppingList.length, 'items');
                            
                            // Mostrar el contenedor de lista de compras
                            const editShoppingListContainer = document.getElementById('edit-shopping-list-container');
                            if (editShoppingListContainer) {
                                editShoppingListContainer.classList.remove('hidden');
                            }
                        }
                    }
                }
            }, 100);
            
            return result;
        };
    }
    
    // Event listener para el botón de guardar item editado
    const editSaveBtn = document.getElementById('edit-save-btn');
    if (editSaveBtn) {
        // Agregar listener ADICIONAL para manejar imágenes y lista de compras
        editSaveBtn.addEventListener('click', function(e) {
            const imageData = getCurrentItemEditImage();
            const savedItemId = currentEditingItemId;
            const shoppingList = (typeof getEditShoppingList === 'function') ? getEditShoppingList() : null;
            
            if ((imageData || (shoppingList && shoppingList.length > 0)) && savedItemId && items) {
                setTimeout(() => {
                    const item = items.find(i => i.id === savedItemId);
                    if (item) {
                        let updated = false;
                        
                        // Guardar imagen
                        if (imageData) {
                            // console.log('📝 [EDIT ITEM] Guardando imagen para:', item.content.substring(0, 30));
                            item.image = imageData;
                            updated = true;
                        }
                        
                        // Guardar lista de compras (solo si el tipo es Compra)
                        if (item.type === 'Compra' && shoppingList && shoppingList.length > 0) {
                            item.shoppingList = shoppingList;
                            // console.log('🛒 [EDIT ITEM] Lista de compras actualizada:', shoppingList.length, 'items');
                            updated = true;
                        }
                        
                        if (updated) {
                            saveItems();
                            // console.log('✅ [EDIT ITEM] Cambios guardados en localStorage');
                            
                            // Re-renderizar
                            setTimeout(() => {
                                addImagesToRenderedItems();
                                
                                // Re-renderizar listas de compras
                                if (typeof window.addShoppingListsToItems === 'function') {
                                    window.addShoppingListsToItems();
                                }
                            }, 300);
                        }
                        
                        // Limpiar lista temporal
                        if (typeof clearEditShoppingList === 'function') {
                            clearEditShoppingList();
                        }
                    }
                }, 500);
            }
        });
    }
    
    // Botón para quitar imagen de item
    const removeItemImageBtn = document.getElementById('edit-remove-image-btn');
    if (removeItemImageBtn) {
        removeItemImageBtn.addEventListener('click', function(e) {
            const savedItemId = currentEditingItemId;
            
            setTimeout(() => {
                if (savedItemId && items) {
                    const item = items.find(i => i.id === savedItemId);
                    if (item && item.image) {
                        // console.log('🗑️ [REMOVE ITEM] Eliminando imagen de item:', savedItemId);
                        delete item.image;
                        saveItems();
                        // console.log('✅ [REMOVE ITEM] Imagen eliminada de localStorage');
                        
                        setTimeout(() => {
                            addImagesToRenderedItems();
                        }, 100);
                        
                        showSystemMessage('🗑️ Imagen eliminada', 'success');
                    }
                }
            }, 50);
        });
    }

    // ============================================================
    // EXTENDER createFolder PARA CARPETAS
    // ============================================================
    const createFolderBtn = document.getElementById('create-folder-confirm-btn');
    if (createFolderBtn) {
        createFolderBtn.addEventListener('click', function(e) {
            const imageData = getCurrentFolderCreateImage();
            // console.log('📸 [CREATE] Imagen detectada:', imageData ? 'SÍ' : 'NO');
            
            // Esperar a que la carpeta se cree
            setTimeout(() => {
                if (imageData && folders && folders.length > 0) {
                    // Buscar la carpeta más reciente (última agregada)
                    const newestFolder = folders[folders.length - 1];
                    // console.log('📂 [CREATE] Carpeta creada:', newestFolder.name);
                    newestFolder.image = imageData;
                    saveFolders();
                    // console.log('✅ [CREATE] Imagen guardada en localStorage');
                    
                    // Actualizar SOLO esta carpeta en el DOM
                    setTimeout(() => {
                        // console.log('🔄 [CREATE] Actualizando imagen en el DOM...');
                        updateSingleFolderImage(newestFolder.id);
                    }, 200);
                }
            }, 500);
        });
    }

    // ============================================================
    // EXTENDER editFolder PARA CARPETAS
    // ============================================================
    // Variable para almacenar el ID de la carpeta que se está editando
    let currentEditingFolderId = null;
    
    // Interceptar la función openEditFolderModal para capturar el ID
    if (typeof window.openEditFolderModal === 'function') {
        const originalOpenEditFolder = window.openEditFolderModal;
        window.openEditFolderModal = function(folderId) {
            // Capturar el ID cuando se abre el modal
            currentEditingFolderId = folderId;
            // console.log('📂 [EDIT] Modal abierto para carpeta:', folderId);
            
            // Llamar a la función original
            const result = originalOpenEditFolder.call(this, folderId);
            
            // Cargar la imagen existente si la hay
            setTimeout(() => {
                if (folders) {
                    const folder = folders.find(f => f.id === folderId);
                    if (folder && folder.image) {
                        window.loadImageInEditFolderModal(folder.image);
                        // console.log('🖼️ [EDIT] Imagen existente cargada en el modal');
                    }
                }
            }, 100);
            
            return result;
        };
    }
    
    const saveFolderBtn = document.getElementById('save-folder-btn');
    if (saveFolderBtn) {
        saveFolderBtn.addEventListener('click', function(e) {
            // Usar el ID guardado al abrir el modal
            const imageData = getCurrentFolderEditImage();
            const savedFolderId = currentEditingFolderId;
            
            // console.log('📸 [EDIT] Imagen detectada:', imageData ? 'SÍ' : 'NO');
            // console.log('📁 [EDIT] ID guardado:', savedFolderId);
            
            // Esperar a que el modal se cierre y los datos se guarden
            setTimeout(() => {
                if (savedFolderId && folders) {
                    const folder = folders.find(f => f.id === savedFolderId);
                    if (folder) {
                        // console.log('📂 [EDIT] Carpeta encontrada:', folder.name);
                        
                        // Si hay imagen, guardarla
                        if (imageData) {
                            folder.image = imageData;
                            saveFolders();
                            // console.log('✅ [EDIT] Imagen guardada en localStorage');
                            
                            // Actualizar SOLO esta carpeta en el DOM
                            setTimeout(() => {
                                // console.log('🔄 [EDIT] Actualizando imagen en el DOM...');
                                updateSingleFolderImage(savedFolderId);
                                currentEditingFolderId = null; // Limpiar después de actualizar
                            }, 200);
                        }
                        // Si no hay imagen pero tampoco se marcó para eliminar, no hacer nada con la imagen
                    } else {
                        console.error('❌ [EDIT] No se encontró la carpeta con ID:', savedFolderId);
                    }
                } else {
                    // console.log('ℹ️ [EDIT] Sin imagen para guardar');
                    if (!savedFolderId) console.log('  - No hay ID de carpeta');
                    if (!folders) console.log('  - No hay array de carpetas');
                }
            }, 500); // Dar más tiempo para que se complete el guardado original
        });
    }
    
    // ============================================================
    // EXTENDER BOTÓN QUITAR IMAGEN DE CARPETA
    // ============================================================
    // El botón ya está configurado por ImageSystem, solo agregamos la eliminación de localStorage
    const removeFolderImageBtn = document.getElementById('edit-folder-remove-image-btn');
    if (removeFolderImageBtn) {
        // Agregar listener DESPUÉS del de ImageSystem para procesar la eliminación
        removeFolderImageBtn.addEventListener('click', function(e) {
            const savedFolderId = currentEditingFolderId;
            
            // Esperar a que ImageSystem limpie la vista previa
            setTimeout(() => {
                // Eliminar imagen de la carpeta en localStorage
                if (savedFolderId && folders) {
                    const folder = folders.find(f => f.id === savedFolderId);
                    if (folder && folder.image) {
                        // console.log('🗑️ [REMOVE] Eliminando imagen de carpeta:', savedFolderId);
                        delete folder.image;
                        saveFolders();
                        // console.log('✅ [REMOVE] Imagen eliminada de localStorage');
                        
                        // Actualizar el DOM inmediatamente
                        setTimeout(() => {
                            updateSingleFolderImage(savedFolderId);
                            // console.log('✅ [REMOVE] Emoji restaurado en el DOM');
                        }, 100);
                        
                        showSystemMessage('🗑️ Imagen eliminada de la carpeta', 'success');
                    }
                }
            }, 50);
        });
    }

    // ============================================================
    // LIMPIAR IMÁGENES AL CANCELAR MODALES
    // ============================================================
    setupModalCleanup();

    // ============================================================
    // EXTENDER EXPORTAR/IMPORTAR
    // ============================================================
    setupExportImportHandlers();

    // console.log('✅ Integración de imágenes completada');
}

// ============================================================
// FUNCIÓN PARA AGREGAR IMÁGENES A ITEMS RENDERIZADOS
// ============================================================
function addImagesToRenderedItems() {
    if (!items || !Array.isArray(items)) return;

    items.forEach(item => {
        if (item.image) {
            // ✅ VERIFICAR SI EL ITEM ESTÁ EN UNA CARPETA BLOQUEADA
            if (item.folderId) {
                // Verificar si la carpeta tiene clave de acceso
                if (typeof hasFolderAccessKey === 'function' && hasFolderAccessKey(item.folderId)) {
                    // Verificar si la carpeta está desbloqueada en esta sesión
                    const unlockedFolders = sessionStorage.getItem('unlockedFolders');
                    const unlockedList = unlockedFolders ? JSON.parse(unlockedFolders) : [];
                    
                    // Si la carpeta NO está desbloqueada, NO mostrar la imagen
                    if (!unlockedList.includes(item.folderId)) {
                        // console.log('🔒 Imagen oculta (carpeta bloqueada):', item.id);
                        return;
                    }
                }
            }
            
            // Buscar el elemento en el DOM - primero por id
            let itemElement = document.getElementById(`item-${item.id}`);
            
            // Si no se encuentra por id, buscar por data-item-id
            if (!itemElement) {
                itemElement = document.querySelector(`[data-item-id="${item.id}"]`);
            }
            
            if (!itemElement) return;

            // Verificar si ya tiene imagen
            if (itemElement.querySelector('.item-image-thumbnail')) return;

            // CRÍTICO: Buscar el div "flex-grow" que contiene el contenido
            // Esto es donde DEBE ir la imagen para no romper el layout
            const contentContainer = itemElement.querySelector('.flex-grow');
            
            if (!contentContainer) {
                console.warn('No se encontró contenedor flex-grow para item:', item.id);
                return;
            }

            // Crear contenedor de imagen
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'item-image-thumbnail';
            imageWrapper.style.cssText = 'display: block; width: 100%; margin-top: 0.75rem; clear: both;';
            
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = 'Imagen adjunta';
            img.style.cssText = 'display: block; width: 100%; max-width: 100%; height: 8rem; object-fit: cover; border-radius: 0.5rem; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);';
            
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.imageSystemInstance) {
                    window.imageSystemInstance.showImageViewer(item.image);
                }
            });
            
            imageWrapper.appendChild(img);

            // INSERTAR LA IMAGEN DENTRO DEL CONTENEDOR flex-grow, AL FINAL
            contentContainer.appendChild(imageWrapper);
        }
    });
}

// ============================================================
// CONFIGURAR LIMPIEZA DE MODALES
// ============================================================
function setupModalCleanup() {
    // Modal de crear
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', clearAllTempImages);
    }

    // Modal de editar
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', clearAllTempImages);
    }

    // Modal de crear carpeta
    const cancelFolderBtn = document.getElementById('cancel-folder-btn');
    if (cancelFolderBtn) {
        cancelFolderBtn.addEventListener('click', clearAllTempImages);
    }

    // Modal de editar carpeta
    const cancelEditFolderBtn = document.getElementById('cancel-edit-folder-btn');
    if (cancelEditFolderBtn) {
        cancelEditFolderBtn.addEventListener('click', clearAllTempImages);
    }

    // Limpiar cuando se abren modales
    const modal = document.getElementById('input-modal');
    const editModal = document.getElementById('edit-modal');
    
    if (modal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (!modal.classList.contains('hidden')) {
                        // Modal abierto
                        clearAllTempImages();
                    }
                }
            });
        });
        observer.observe(modal, { attributes: true });
    }
}

// ============================================================
// CARGAR IMAGEN AL EDITAR
// ============================================================
function loadImageInEditModal(item) {
    if (!item || !item.image) return;

    const preview = document.getElementById('edit-image-preview');
    const container = document.getElementById('edit-image-preview-container');
    const fileName = document.getElementById('edit-image-file-name');

    if (preview && container) {
        preview.src = item.image;
        container.classList.remove('hidden');
        if (fileName) {
            const sizeKB = Math.round((item.image.length * 0.75) / 1024);
            fileName.textContent = `📄 Imagen guardada (≈${sizeKB} KB)`;
        }
        
        // Guardar en temporal
        if (window.imageSystemInstance) {
            window.imageSystemInstance.setTempImage('edit-image-input', item.image);
        }
    }
}

// ============================================================
// CARGAR IMAGEN EN MODAL DE EDITAR CARPETA
// ============================================================
function loadImageInEditFolderModal(folder) {
    if (!folder || !folder.image) return;

    const preview = document.getElementById('edit-folder-image-preview');
    const container = document.getElementById('edit-folder-image-preview-container');
    const fileName = document.getElementById('edit-folder-image-file-name');

    if (preview && container) {
        preview.src = folder.image;
        container.classList.remove('hidden');
        if (fileName) {
            const sizeKB = Math.round((folder.image.length * 0.75) / 1024);
            fileName.textContent = `📄 Imagen guardada (≈${sizeKB} KB)`;
        }
        
        // Guardar en temporal
        if (window.imageSystemInstance) {
            window.imageSystemInstance.setTempImage('edit-folder-image-input', folder.image);
        }
    }
}

// ============================================================
// EXPORTAR/IMPORTAR CON IMÁGENES
// ============================================================
function setupExportImportHandlers() {
    // Las imágenes ya están incluidas en los objetos items y folders
    // El sistema de exportar/importar existente las incluirá automáticamente
    // console.log('✅ Sistema de exportar/importar con imágenes configurado');
}

// ============================================================
// INTERCEPTAR EDICIÓN DE ITEMS
// ============================================================
// Interceptar cuando se abre el modal de edición
document.addEventListener('click', function(e) {
    // Buscar si se hizo clic en un botón de editar
    const editButton = e.target.closest('[onclick*="editItem"]') || 
                       e.target.closest('.edit-item-btn') ||
                       e.target.closest('[data-action="edit"]');
    
    if (editButton) {
        setTimeout(() => {
            if (window.editingItemId && items) {
                const item = items.find(i => i.id === window.editingItemId);
                if (item) {
                    loadImageInEditModal(item);
                }
            }
        }, 100);
    }

    // Buscar si se hizo clic en editar carpeta
    const editFolderButton = e.target.closest('[onclick*="editFolder"]') || 
                             e.target.closest('.edit-folder-btn') ||
                             e.target.closest('[data-folder-action="edit"]');
    
    if (editFolderButton) {
        setTimeout(() => {
            if (window.editingFolderId && folders) {
                const folder = folders.find(f => f.id === window.editingFolderId);
                if (folder) {
                    loadImageInEditFolderModal(folder);
                }
            }
        }, 100);
    }
}, true);

// ============================================================
// OBSERVADOR DEL DOM PARA RENDERIZAR IMÁGENES AUTOMÁTICAMENTE
// ============================================================
function setupDOMObserver() {
    if (typeof MutationObserver === 'undefined') return;

    // Observar lista de items principal
    const itemListObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            setTimeout(() => {
                // console.log('🖼️ Renderizando imágenes en lista principal');
                addImagesToRenderedItems();
            }, 100);
        }
    });

    const itemList = document.getElementById('item-list');
    if (itemList) {
        itemListObserver.observe(itemList, { childList: true, subtree: true });
        // console.log('✅ Observador configurado para item-list');
    }

    // Observar items DENTRO de carpetas (folder-items-list)
    const folderItemsObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            setTimeout(() => {
                // console.log('🖼️ Renderizando imágenes en items de carpeta');
                addImagesToRenderedItems();
            }, 100);
        }
    });

    const folderItemsList = document.getElementById('folder-items-list');
    if (folderItemsList) {
        folderItemsObserver.observe(folderItemsList, { childList: true, subtree: true });
        // console.log('✅ Observador configurado para folder-items-list');
    }

    // Observar lista de carpetas (solo cuando se agregan NUEVAS carpetas)
    const foldersObserver = new MutationObserver((mutations) => {
        let hasNewFolderCards = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // Solo disparar si se agregó un elemento .folder-card (nueva carpeta)
                if (node.nodeType === 1) { // Es un elemento
                    if (node.classList && node.classList.contains('folder-card')) {
                        hasNewFolderCards = true;
                    } else if (node.querySelector && node.querySelector('.folder-card')) {
                        hasNewFolderCards = true;
                    }
                }
            });
        });
        
        if (hasNewFolderCards) {
            // console.log('➕ Nuevas carpetas detectadas en el DOM');
            setTimeout(() => {
                addImagesToFolders();
            }, 100);
        }
    });

    const foldersList = document.getElementById('folders-list');
    if (foldersList) {
        // childList: true - detecta cuando se agregan/eliminan hijos directos
        // subtree: false - NO observa cambios internos (previene bucles)
        foldersObserver.observe(foldersList, { childList: true, subtree: false });
        // console.log('✅ Observador configurado para folders-list');
    }

    // Observar items del día en calendario
    const calendarObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            setTimeout(() => {
                // console.log('🖼️ Renderizando imágenes en calendario');
                addImagesToRenderedItems();
            }, 100);
        }
    });

    const selectedDayItems = document.getElementById('selected-day-items');
    if (selectedDayItems) {
        calendarObserver.observe(selectedDayItems, { childList: true, subtree: true });
        // console.log('✅ Observador configurado para selected-day-items');
    }

    // console.log('✅ Todos los observadores del DOM configurados');
}

// ============================================================
// INTERCEPTAR RENDERIZADO DE CARPETAS (ELIMINADO - ya está en setupDOMObservers)
// ============================================================
// Este observer estaba duplicado y causaba bucles infinitos

// Bandera para prevenir bucles infinitos
let isUpdatingFolderImages = false;

// Función para actualizar UNA carpeta específica (sin bandera de bloqueo)
function updateSingleFolderImage(folderId) {
    if (!folders || !Array.isArray(folders)) return;
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
        console.warn('⚠️ Carpeta no encontrada:', folderId);
        return;
    }
    
    const folderCard = document.querySelector(`.folder-card[data-folder-id="${folderId}"]`);
    if (!folderCard) {
        console.warn('⚠️ Elemento DOM no encontrado para carpeta:', folderId);
        return;
    }
    
    const folderIconContainer = folderCard.querySelector('.folder-icon');
    if (!folderIconContainer) return;
    
    // Limpiar imagen existente
    const existingImg = folderIconContainer.querySelector('.folder-cover-image');
    if (existingImg) {
        existingImg.remove();
        // console.log('🗑️ Imagen anterior eliminada');
    }
    
    const emojiSpan = folderIconContainer.querySelector('span.text-2xl');
    
    if (folder.image) {
        // TIENE IMAGEN: ocultar emoji y mostrar imagen
        // console.log('🖼️ Agregando imagen a carpeta:', folder.name);
        if (emojiSpan) {
            emojiSpan.style.display = 'none';
        }
        
        const img = document.createElement('img');
        img.src = folder.image;
        img.alt = folder.name;
        img.className = 'folder-cover-image';
        img.style.cssText = `
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 0.5rem;
            cursor: pointer;
            display: block;
        `;
        
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.imageSystemInstance) {
                window.imageSystemInstance.showImageViewer(folder.image);
            }
        });
        
        folderIconContainer.insertBefore(img, folderIconContainer.firstChild);
        // console.log('✅ Imagen de carpeta actualizada correctamente');
    } else {
        // NO TIENE IMAGEN: mostrar emoji
        // console.log('😀 Mostrando emoji de carpeta:', folder.name);
        if (emojiSpan) {
            emojiSpan.style.display = '';
        }
    }
}

function addImagesToFolders() {
    if (!folders || !Array.isArray(folders)) return;
    
    // PREVENIR RE-ENTRADAS (bucles infinitos)
    if (isUpdatingFolderImages) {
        return;
    }
    
    isUpdatingFolderImages = true;

    let foldersWithImages = 0;
    let foldersUpdated = 0;
    
    folders.forEach(folder => {
        // Buscar el elemento de carpeta en el DOM
        const folderCard = document.querySelector(`.folder-card[data-folder-id="${folder.id}"]`);
        if (!folderCard) return;
        
        const folderIconContainer = folderCard.querySelector('.folder-icon');
        if (!folderIconContainer) return;
        
        // SIEMPRE limpiar imagen existente primero (permite actualizaciones)
        const existingImg = folderIconContainer.querySelector('.folder-cover-image');
        if (existingImg) {
            existingImg.remove();
            foldersUpdated++;
        }
        
        const emojiSpan = folderIconContainer.querySelector('span.text-2xl');
        
        if (folder.image) {
            // TIENE IMAGEN: ocultar emoji y mostrar imagen
            foldersWithImages++;
            if (emojiSpan) {
                emojiSpan.style.display = 'none';
            }

            // Crear elemento de imagen CUADRADA como portada
            const img = document.createElement('img');
            img.src = folder.image;
            img.alt = folder.name;
            img.className = 'folder-cover-image';
            img.style.cssText = `
                width: 48px;
                height: 48px;
                object-fit: cover;
                border-radius: 0.5rem;
                cursor: pointer;
                display: block;
            `;
            
            // Agregar click para ver en grande
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.imageSystemInstance) {
                    window.imageSystemInstance.showImageViewer(folder.image);
                }
            });

            // Insertar la imagen al principio del contenedor
            folderIconContainer.insertBefore(img, folderIconContainer.firstChild);
        } else {
            // NO TIENE IMAGEN: mostrar emoji
            if (emojiSpan) {
                emojiSpan.style.display = '';
            }
        }
    });
    
    // Mostrar resumen
    // console.log(`✅ Actualización completada: ${foldersWithImages} carpetas con imagen, ${foldersUpdated} actualizadas`);
    
    // Agregar event listeners a las nuevas imágenes
    attachFolderImageClickListeners();
    
    // Liberar la bandera DESPUÉS de actualizar el DOM
    setTimeout(() => {
        isUpdatingFolderImages = false;
    }, 50);
}

// ============================================================
// FUNCIÓN PARA AGREGAR EVENT LISTENERS A IMÁGENES DE CARPETAS
// ============================================================
function attachFolderImageClickListeners() {
    // Buscar todas las imágenes de carpetas en el DOM
    const folderImages = document.querySelectorAll('.folder-cover-image[data-folder-image]');
    
    folderImages.forEach(img => {
        // Remover listener anterior si existe (prevenir duplicados)
        img.replaceWith(img.cloneNode(true));
        
        // Obtener la nueva referencia después del clonado
        const folderId = img.getAttribute('data-folder-image');
        const newImg = document.querySelector(`.folder-cover-image[data-folder-image="${folderId}"]`);
        
        if (newImg) {
            newImg.addEventListener('click', (e) => {
                e.stopPropagation();
                const imageSrc = newImg.src;
                if (window.imageSystemInstance && imageSrc) {
                    window.imageSystemInstance.showImageViewer(imageSrc);
                }
            });
        }
    });
}

// ============================================================
// FUNCIONES PARA CARGAR IMÁGENES EN MODALES
// ============================================================

/**
 * Carga una imagen existente en el modal de edición de items
 */
function loadImageInEditModal(imageDataUrl) {
    if (!imageDataUrl) return;
    
    const previewContainer = document.getElementById('edit-image-preview-container');
    const previewImg = document.getElementById('edit-image-preview');
    const fileName = document.getElementById('edit-image-file-name');
    
    if (previewContainer && previewImg) {
        previewImg.src = imageDataUrl;
        previewImg.dataset.existingImage = 'true'; // Marcar que es imagen existente
        previewContainer.classList.remove('hidden');
        
        if (fileName) {
            const sizeKB = Math.round((imageDataUrl.length * 0.75) / 1024);
            fileName.textContent = `📄 Imagen existente (≈${sizeKB} KB)`;
        }
        
        // console.log('✅ Imagen de item cargada en modal de edición');
    }
}

/**
 * Carga una imagen existente en el modal de edición de carpetas
 */
function loadImageInEditFolderModal(imageDataUrl) {
    if (!imageDataUrl) return;
    
    const previewContainer = document.getElementById('edit-folder-image-preview-container');
    const previewImg = document.getElementById('edit-folder-image-preview');
    const fileName = document.getElementById('edit-folder-image-file-name');
    
    if (previewContainer && previewImg) {
        previewImg.src = imageDataUrl;
        previewImg.dataset.existingImage = 'true'; // Marcar que es imagen existente
        previewContainer.classList.remove('hidden');
        
        if (fileName) {
            const sizeKB = Math.round((imageDataUrl.length * 0.75) / 1024);
            fileName.textContent = `📄 Portada actual (≈${sizeKB} KB)`;
        }
        
        // console.log('✅ Imagen de carpeta cargada en modal de edición');
    }
}

/**
 * Obtiene la imagen actual del modal de edición de carpeta
 */
function getCurrentFolderEditImage() {
    const previewImg = document.getElementById('edit-folder-image-preview');
    const previewContainer = document.getElementById('edit-folder-image-preview-container');
    
    // Si el contenedor está oculto, no hay imagen
    if (!previewContainer || previewContainer.classList.contains('hidden')) {
        return null;
    }
    
    // Obtener la imagen del preview
    if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
        return previewImg.src;
    }
    
    return null;
}

/**
 * Obtiene la imagen actual del modal de edición de item
 */
function getCurrentItemEditImage() {
    const previewImg = document.getElementById('edit-image-preview');
    const previewContainer = document.getElementById('edit-image-preview-container');
    
    // Si el contenedor está oculto, no hay imagen
    if (!previewContainer || previewContainer.classList.contains('hidden')) {
        return null;
    }
    
    // Obtener la imagen del preview
    if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
        return previewImg.src;
    }
    
    return null;
}

/**
 * Obtiene la imagen actual del modal de crear item
 */
function getCurrentItemCreateImage() {
    const previewImg = document.getElementById('image-preview');
    const previewContainer = document.getElementById('image-preview-container');
    
    // Si el contenedor está oculto, no hay imagen
    if (!previewContainer || previewContainer.classList.contains('hidden')) {
        return null;
    }
    
    // Obtener la imagen del preview
    if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
        return previewImg.src;
    }
    
    return null;
}

/**
 * Obtiene la imagen actual del modal de crear carpeta
 */
function getCurrentFolderCreateImage() {
    const previewImg = document.getElementById('folder-image-preview');
    const previewContainer = document.getElementById('folder-image-preview-container');
    
    // Si el contenedor está oculto, no hay imagen
    if (!previewContainer || previewContainer.classList.contains('hidden')) {
        return null;
    }
    
    // Obtener la imagen del preview
    if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
        return previewImg.src;
    }
    
    return null;
}

// ============================================================
// INTERCEPTAR FUNCIONES DEL CALENDARIO
// ============================================================
function interceptCalendarFunctions() {
    // console.log('📅 Interceptando funciones del calendario...');
    
    // Verificar si renderDayDetails está disponible
    if (typeof window.renderDayDetails === 'function') {
        // console.log('✅ renderDayDetails encontrada, interceptando...');
        const originalRenderDayDetails = window.renderDayDetails;
        
        window.renderDayDetails = function(dateStr) {
            // console.log('📅 renderDayDetails llamada para:', dateStr);
            // Llamar a la función original
            originalRenderDayDetails.call(this, dateStr);
            
            // Renderizar imágenes y listas de compras después de un pequeño delay
            setTimeout(() => {
                // console.log('📅 Renderizando imágenes/listas en calendario...');
                // const calendarItems = document.querySelectorAll('.calendar-item');
                // console.log('📅 Items del calendario encontrados:', calendarItems.length);
                
                addImagesToRenderedItems();
                
                // Renderizar listas de compras
                if (typeof window.addShoppingListsToItems === 'function') {
                    window.addShoppingListsToItems();
                    // console.log('📅 Listas de compras procesadas para calendario');
                }
            }, 150);
        };
        
        // console.log('✅ renderDayDetails interceptada exitosamente');
    } else {
        // console.warn('⚠️ renderDayDetails no está disponible aún');
        
        // Reintentar después de un delay
        setTimeout(() => {
            // console.log('🔄 Reintentando interceptar renderDayDetails...');
            interceptCalendarFunctions();
        }, 1000);
    }
}

// ============================================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================================
window.loadImageInEditModal = loadImageInEditModal;
window.loadImageInEditFolderModal = loadImageInEditFolderModal;
window.getCurrentFolderEditImage = getCurrentFolderEditImage;
window.getCurrentItemEditImage = getCurrentItemEditImage;
window.getCurrentItemCreateImage = getCurrentItemCreateImage;
window.getCurrentFolderCreateImage = getCurrentFolderCreateImage;
window.addImagesToRenderedItems = addImagesToRenderedItems;
window.addImagesToFolders = addImagesToFolders;
window.updateSingleFolderImage = updateSingleFolderImage;

// console.log('✅ Módulo de integración de imágenes cargado correctamente');


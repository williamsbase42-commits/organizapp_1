// ================================================================
// ORGANIZAPP - SISTEMA COMPLETO DE IMÁGENES V2.0
// ================================================================
// Sistema profesional para manejo de imágenes con:
// - Compresión automática
// - Almacenamiento en base64
// - Previsualización y vista completa
// - Exportar/importar
// - Compatible con carpetas bloqueadas
// ================================================================

'use strict';

// ============================================================
// CONFIGURACIÓN GLOBAL
// ============================================================

const IMAGE_CONFIG = {
    MAX_SIZE_MB: 2,                    // Tamaño máximo en MB
    MAX_SIZE_BYTES: 2 * 1024 * 1024,  // 2MB en bytes
    COMPRESSION_QUALITY: 0.8,          // Calidad de compresión (0-1)
    MAX_WIDTH: 1200,                   // Ancho máximo de imagen
    MAX_HEIGHT: 1200,                  // Alto máximo de imagen
    THUMBNAIL_SIZE: 300,               // Tamaño de miniaturas
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// ============================================================
// CLASE PRINCIPAL DEL SISTEMA DE IMÁGENES
// ============================================================

class ImageSystem {
    constructor() {
        this.selectedImage = null;
        this.init();
    }

    /**
     * Inicializa el sistema de imágenes
     */
    init() {
        // console.log('🖼️ Inicializando Sistema de Imágenes v2.0');
        this.setupEventListeners();
        this.setupModalImageViewer();
    }

    /**
     * Configura los event listeners para todos los modales
     */
    setupEventListeners() {
        // Modal de crear nota/recordatorio
        this.setupModalListeners('image-input', 'image-upload-btn', 'image-preview-container', 
            'image-preview', 'remove-image-btn', 'image-file-name');
        
        // Modal de editar nota/recordatorio
        this.setupModalListeners('edit-image-input', 'edit-image-upload-btn', 'edit-image-preview-container',
            'edit-image-preview', 'edit-remove-image-btn', 'edit-image-file-name');
        
        // Modal de crear carpeta
        this.setupModalListeners('folder-image-input', 'folder-image-upload-btn', 'folder-image-preview-container',
            'folder-image-preview', 'folder-remove-image-btn', 'folder-image-file-name');
        
        // Modal de editar carpeta
        this.setupModalListeners('edit-folder-image-input', 'edit-folder-image-upload-btn', 'edit-folder-image-preview-container',
            'edit-folder-image-preview', 'edit-folder-remove-image-btn', 'edit-folder-image-file-name');
    }

    /**
     * Configura listeners para un modal específico
     */
    setupModalListeners(inputId, buttonId, containerId, previewId, removeId, fileNameId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        const container = document.getElementById(containerId);
        const preview = document.getElementById(previewId);
        const removeBtn = document.getElementById(removeId);
        const fileName = document.getElementById(fileNameId);

        if (!input || !button) return;

        // Detectar si es un modal de carpeta
        const isFolderModal = inputId.includes('folder');

        // Botón para abrir selector
        button.addEventListener('click', () => input.click());

        // Cuando se selecciona un archivo
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.handleImageSelection(file, preview, container, fileName, inputId, isFolderModal);
            }
        });

        // Botón para remover imagen
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.clearImage(input, container, preview, fileName, inputId);
            });
        }

        // Drag & Drop
        this.setupDragAndDrop(button, input, preview, container, fileName, inputId, isFolderModal);
    }

    /**
     * Maneja la selección de una imagen
     */
    async handleImageSelection(file, previewElement, containerElement, fileNameElement, inputId, isFolderModal = false) {
        try {
            // Validar archivo
            if (!this.validateImageFile(file)) {
                return;
            }

            // Mostrar loading
            this.showLoading(previewElement, containerElement);

            // Leer archivo como data URL
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const imageDataUrl = e.target.result;

                // Callback cuando se cancela el crop
                const onCancel = () => {
                    // Ocultar loading y limpiar previsualización
                    containerElement.classList.add('hidden');
                    previewElement.src = '';
                    fileNameElement.textContent = '';
                    
                    // Limpiar input
                    const input = document.getElementById(inputId);
                    if (input) input.value = '';
                    
                    showSystemMessage('❌ Recorte cancelado', 'info');
                };

                // Abrir modal de crop
                if (window.imageCropModal) {
                    window.imageCropModal.show(imageDataUrl, isFolderModal, async (croppedImage) => {
                        // Imagen ya recortada por el usuario
                        // Comprimir si es necesario
                        const finalImage = await this.ensureCompression(croppedImage);

                        // Mostrar previsualización
                        previewElement.src = finalImage;
                        containerElement.classList.remove('hidden');

                        // Guardar en memoria temporal
                        this.setTempImage(inputId, finalImage);

                        // Mostrar nombre y tamaño
                        const sizeKB = Math.round((finalImage.length * 0.75) / 1024);
                        const imageType = isFolderModal ? 'Portada recortada' : 'Imagen recortada';
                        fileNameElement.textContent = `📄 ${imageType}: ${this.truncateFileName(file.name)} (≈${sizeKB} KB)`;

                        // Ocultar loading
                        this.hideLoading(containerElement);

                        const message = isFolderModal ? '✅ Portada de carpeta lista' : '✅ Imagen recortada correctamente';
                        showSystemMessage(message, 'success');
                    }, onCancel);
                } else {
                    // Fallback: comprimir sin crop
                    const compressedImage = await this.compressImage(file, isFolderModal);
                    previewElement.src = compressedImage;
                    containerElement.classList.remove('hidden');
                    this.setTempImage(inputId, compressedImage);
                    this.hideLoading(containerElement);
                }
            };

            reader.onerror = () => {
                throw new Error('Error al leer el archivo');
            };

            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error al procesar imagen:', error);
            showSystemMessage('❌ Error al procesar la imagen', 'error');
            this.clearImage(document.getElementById(inputId.replace('input', 'upload-btn')), 
                containerElement, previewElement, fileNameElement, inputId);
        }
    }

    /**
     * Asegura que la imagen esté comprimida adecuadamente
     */
    async ensureCompression(imageDataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const sizeBytes = imageDataUrl.length * 0.75;
                
                // Si ya es pequeña, devolverla tal cual
                if (sizeBytes < IMAGE_CONFIG.MAX_SIZE_BYTES) {
                    resolve(imageDataUrl);
                    return;
                }

                // Si es muy grande, re-comprimir
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const compressed = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressed);
            };
            img.src = imageDataUrl;
        });
    }

    /**
     * Valida que el archivo sea una imagen válida
     */
    validateImageFile(file) {
        // Verificar que sea un archivo
        if (!file) {
            showSystemMessage('❌ No se seleccionó ningún archivo', 'error');
            return false;
        }

        // Verificar tipo de archivo
        if (!IMAGE_CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            showSystemMessage('❌ Formato no soportado. Usa JPG, PNG, GIF o WebP', 'error');
            return false;
        }

        // Verificar tamaño (antes de compresión)
        if (file.size > IMAGE_CONFIG.MAX_SIZE_BYTES * 3) { // 6MB sin comprimir
            showSystemMessage(`❌ Imagen muy grande. Máximo 6MB sin comprimir`, 'error');
            return false;
        }

        return true;
    }

    /**
     * Comprime una imagen a base64
     * @param {File} file - Archivo de imagen
     * @param {boolean} isSquare - Si debe ser cuadrada (para carpetas)
     */
    async compressImage(file, isSquare = false) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width, height, sourceX, sourceY, sourceSize;

                    if (isSquare) {
                        // Para carpetas: hacer imagen CUADRADA con crop centrado
                        // Tomar el lado más pequeño como referencia
                        sourceSize = Math.min(img.width, img.height);
                        
                        // Calcular posición para centrar el crop
                        sourceX = (img.width - sourceSize) / 2;
                        sourceY = (img.height - sourceSize) / 2;
                        
                        // Tamaño final cuadrado (máximo 500px)
                        const finalSize = Math.min(sourceSize, 500);
                        
                        canvas.width = finalSize;
                        canvas.height = finalSize;
                        
                        // Dibujar imagen cuadrada centrada
                        ctx.drawImage(
                            img,
                            sourceX, sourceY, sourceSize, sourceSize, // source
                            0, 0, finalSize, finalSize // destination
                        );
                    } else {
                        // Para notas: mantener aspect ratio
                        width = img.width;
                        height = img.height;

                        if (width > IMAGE_CONFIG.MAX_WIDTH || height > IMAGE_CONFIG.MAX_HEIGHT) {
                            const ratio = Math.min(
                                IMAGE_CONFIG.MAX_WIDTH / width,
                                IMAGE_CONFIG.MAX_HEIGHT / height
                            );
                            width *= ratio;
                            height *= ratio;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Dibujar imagen normal
                        ctx.drawImage(img, 0, 0, width, height);
                    }

                    // Comprimir y convertir a base64
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', IMAGE_CONFIG.COMPRESSION_QUALITY);

                    // Verificar tamaño final
                    const sizeBytes = (compressedDataUrl.length * 0.75); // Aproximado
                    if (sizeBytes > IMAGE_CONFIG.MAX_SIZE_BYTES) {
                        // Comprimir más si es necesario
                        const newQuality = IMAGE_CONFIG.COMPRESSION_QUALITY * 0.7;
                        const recompressed = canvas.toDataURL('image/jpeg', newQuality);
                        resolve(recompressed);
                    } else {
                        resolve(compressedDataUrl);
                    }
                };

                img.onerror = () => reject(new Error('Error al cargar la imagen'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Limpia la imagen seleccionada
     */
    clearImage(inputElement, containerElement, previewElement, fileNameElement, inputId) {
        const input = document.getElementById(inputId);
        if (input) input.value = '';
        
        if (previewElement) previewElement.src = '';
        if (containerElement) containerElement.classList.add('hidden');
        if (fileNameElement) fileNameElement.textContent = '';
        
        this.setTempImage(inputId, null);
        showSystemMessage('🗑️ Imagen removida', 'info');
    }

    /**
     * Guarda imagen temporalmente en memoria
     */
    setTempImage(inputId, imageData) {
        if (!window.tempImages) window.tempImages = {};
        window.tempImages[inputId] = imageData;
    }

    /**
     * Obtiene imagen temporal de memoria
     */
    getTempImage(inputId) {
        if (!window.tempImages) return null;
        return window.tempImages[inputId] || null;
    }

    /**
     * Trunca el nombre del archivo
     */
    truncateFileName(fileName, maxLength = 30) {
        if (fileName.length <= maxLength) return fileName;
        const ext = fileName.split('.').pop();
        const name = fileName.substring(0, maxLength - ext.length - 4);
        return `${name}...${ext}`;
    }

    /**
     * Muestra loading
     */
    showLoading(previewElement, containerElement) {
        previewElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FyZ2FuZG8uLi48L3RleHQ+PC9zdmc+';
        containerElement.classList.remove('hidden');
    }

    /**
     * Oculta loading
     */
    hideLoading(containerElement) {
        // No hacer nada, la imagen ya reemplazó el loading
    }

    /**
     * Configura drag and drop
     */
    setupDragAndDrop(buttonElement, inputElement, previewElement, containerElement, fileNameElement, inputId, isFolderModal = false) {
        if (!buttonElement) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            buttonElement.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            buttonElement.addEventListener(eventName, () => {
                buttonElement.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'border-dashed');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            buttonElement.addEventListener(eventName, () => {
                buttonElement.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'border-dashed');
            });
        });

        buttonElement.addEventListener('drop', async (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                await this.handleImageSelection(files[0], previewElement, containerElement, fileNameElement, inputId, isFolderModal);
            }
        });
    }

    /**
     * Configura el visor modal de imágenes
     */
    setupModalImageViewer() {
        // Crear modal si no existe
        if (!document.getElementById('image-viewer-modal')) {
            const modal = document.createElement('div');
            modal.id = 'image-viewer-modal';
            modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm hidden z-[9999] flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="relative max-w-4xl w-full">
                    <button id="close-image-viewer" class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img id="image-viewer-img" src="" alt="Vista completa" class="w-full h-auto rounded-xl shadow-2xl">
                </div>
            `;
            document.body.appendChild(modal);

            // Event listeners del modal
            document.getElementById('close-image-viewer').addEventListener('click', () => {
                this.closeImageViewer();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeImageViewer();
                }
            });
        }
    }

    /**
     * Muestra una imagen en vista completa
     */
    showImageViewer(imageSrc) {
        const modal = document.getElementById('image-viewer-modal');
        const img = document.getElementById('image-viewer-img');
        
        if (modal && img) {
            img.src = imageSrc;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Cierra el visor de imágenes
     */
    closeImageViewer() {
        const modal = document.getElementById('image-viewer-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
}

// ============================================================
// FUNCIONES AUXILIARES GLOBALES
// ============================================================

/**
 * Obtiene la imagen temporal del modal actual
 */
function getCurrentTempImage(modalType) {
    const inputIds = {
        'create': 'image-input',
        'edit': 'edit-image-input',
        'folder-create': 'folder-image-input',
        'folder-edit': 'edit-folder-image-input'
    };
    
    const inputId = inputIds[modalType];
    return window.imageSystemInstance ? window.imageSystemInstance.getTempImage(inputId) : null;
}

/**
 * Limpia todas las imágenes temporales
 */
function clearAllTempImages() {
    if (window.tempImages) {
        window.tempImages = {};
    }
}

/**
 * Crea elemento de miniatura de imagen para tarjetas
 */
function createImageThumbnail(imageSrc, onClickCallback) {
    const container = document.createElement('div');
    container.className = 'mt-3 relative group cursor-pointer';
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Imagen adjunta';
    img.className = 'w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]';
    
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center';
    overlay.innerHTML = '<span class="text-white text-sm font-medium">🔍 Ver imagen completa</span>';
    
    container.appendChild(img);
    container.appendChild(overlay);
    
    container.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onClickCallback) onClickCallback(imageSrc);
    });
    
    return container;
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

// Inicializar sistema cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageSystemInstance = new ImageSystem();
    });
} else {
    window.imageSystemInstance = new ImageSystem();
}

// console.log('✅ Módulo de sistema de imágenes cargado correctamente');


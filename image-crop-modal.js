// ================================================================
// SISTEMA DE RECORTE MANUAL DE IMÁGENES
// ================================================================

'use strict';

class ImageCropModal {
    constructor() {
        this.cropModal = null;
        this.originalImage = null;
        this.cropData = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.callback = null;
        this.cancelCallback = null;
        this.isSquare = false;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'image-crop-modal';
        modal.className = 'fixed inset-0 bg-black/95 hidden z-[10000] flex items-center justify-center p-2 sm:p-4';
        modal.innerHTML = `
            <div class="w-full h-full sm:max-w-4xl sm:h-auto bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[95vh]">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
                    <h3 class="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                        <span class="text-xl sm:text-2xl">✂️</span>
                        <span class="hidden sm:inline">Recortar Imagen</span>
                        <span class="sm:hidden">Recortar</span>
                    </h3>
                    <button id="crop-modal-close" class="text-white hover:text-gray-200 transition-colors p-1">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Info -->
                <div class="bg-blue-50 dark:bg-blue-900/30 p-2 sm:p-3 border-b border-blue-200 dark:border-blue-800 flex-shrink-0">
                    <p class="text-xs sm:text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <span>ℹ️</span>
                        <span id="crop-instruction" class="line-clamp-2 sm:line-clamp-1">Arrastra sobre la imagen para seleccionar el área</span>
                    </p>
                </div>

                <!-- Canvas Container - scrollable -->
                <div class="flex-1 overflow-auto p-3 sm:p-6 flex items-center justify-center" style="min-height: 0;">
                    <div class="relative inline-block max-w-full">
                        <canvas id="crop-canvas" class="border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair max-w-full h-auto" style="touch-action: none;"></canvas>
                        <div id="crop-selection" class="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none hidden" style="box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);"></div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <div class="flex items-center gap-2 justify-between sm:justify-start">
                            <button id="crop-reset-btn" class="px-3 sm:px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition-all">
                                🔄 <span class="hidden sm:inline">Reiniciar</span>
                            </button>
                            <span class="text-xs text-gray-500 dark:text-gray-400" id="crop-size-info">-</span>
                        </div>
                        <div class="flex gap-2 sm:gap-3">
                            <button id="crop-cancel-btn" class="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition-all">
                                Cancelar
                            </button>
                            <button id="crop-confirm-btn" class="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg">
                                ✂️ Recortar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.cropModal = modal;
    }

    setupEventListeners() {
        const canvas = document.getElementById('crop-canvas');
        const selection = document.getElementById('crop-selection');

        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.startCrop(e));
        canvas.addEventListener('mousemove', (e) => this.updateCrop(e));
        canvas.addEventListener('mouseup', () => this.endCrop());
        canvas.addEventListener('mouseleave', () => this.endCrop());

        // Touch events para móviles
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.startCrop(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.updateCrop(mouseEvent);
        });

        canvas.addEventListener('touchend', () => this.endCrop());

        // Botones
        document.getElementById('crop-modal-close').addEventListener('click', () => this.close());
        document.getElementById('crop-cancel-btn').addEventListener('click', () => this.close());
        document.getElementById('crop-confirm-btn').addEventListener('click', () => this.confirmCrop());
        document.getElementById('crop-reset-btn').addEventListener('click', () => this.resetCrop());
    }

    show(imageSrc, isSquare = false, callback, cancelCallback = null) {
        this.isSquare = isSquare;
        this.callback = callback;
        this.cancelCallback = cancelCallback;

        const canvas = document.getElementById('crop-canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            this.originalImage = img;

            // Ajustar tamaño del canvas de forma responsive
            const isMobile = window.innerWidth < 640;
            const maxWidth = isMobile ? window.innerWidth - 40 : 800;
            const maxHeight = isMobile ? window.innerHeight * 0.5 : 600;
            
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen
            ctx.drawImage(img, 0, 0, width, height);

            // Inicializar selección por defecto
            this.resetCrop();

            // Actualizar instrucción
            const instruction = document.getElementById('crop-instruction');
            if (isSquare) {
                instruction.textContent = isMobile ? '📐 Área cuadrada' : '📐 Selecciona un área CUADRADA para la portada';
            } else {
                instruction.textContent = isMobile ? 'Arrastra para seleccionar' : 'Arrastra sobre la imagen para seleccionar el área';
            }

            // Mostrar modal
            this.cropModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };

        img.src = imageSrc;
    }

    startCrop(e) {
        const canvas = document.getElementById('crop-canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.isDragging = true;
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        const selection = document.getElementById('crop-selection');
        selection.classList.remove('hidden');
    }

    updateCrop(e) {
        if (!this.isDragging) return;

        const canvas = document.getElementById('crop-canvas');
        const rect = canvas.getBoundingClientRect();
        const selection = document.getElementById('crop-selection');

        let currentX = e.clientX - rect.left;
        let currentY = e.clientY - rect.top;

        // Limitar a los bordes del canvas
        currentX = Math.max(0, Math.min(currentX, canvas.width));
        currentY = Math.max(0, Math.min(currentY, canvas.height));

        let width = currentX - this.startX;
        let height = currentY - this.startY;

        // Si es cuadrada, forzar aspect ratio 1:1
        if (this.isSquare) {
            const size = Math.min(Math.abs(width), Math.abs(height));
            width = width < 0 ? -size : size;
            height = height < 0 ? -size : size;
        }

        const x = width < 0 ? this.startX + width : this.startX;
        const y = height < 0 ? this.startY + height : this.startY;

        this.cropData = {
            x: x,
            y: y,
            width: Math.abs(width),
            height: Math.abs(height)
        };

        // Actualizar visualización
        selection.style.left = x + 'px';
        selection.style.top = y + 'px';
        selection.style.width = Math.abs(width) + 'px';
        selection.style.height = Math.abs(height) + 'px';

        // Actualizar info
        this.updateSizeInfo();
    }

    endCrop() {
        this.isDragging = false;
    }

    resetCrop() {
        const canvas = document.getElementById('crop-canvas');
        const selection = document.getElementById('crop-selection');

        // Selección por defecto: 80% del centro
        const margin = 0.1;
        const width = canvas.width * (1 - 2 * margin);
        const height = canvas.height * (1 - 2 * margin);

        if (this.isSquare) {
            const size = Math.min(width, height);
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;
            
            this.cropData = { x, y, width: size, height: size };
        } else {
            this.cropData = {
                x: canvas.width * margin,
                y: canvas.height * margin,
                width: width,
                height: height
            };
        }

        selection.style.left = this.cropData.x + 'px';
        selection.style.top = this.cropData.y + 'px';
        selection.style.width = this.cropData.width + 'px';
        selection.style.height = this.cropData.height + 'px';
        selection.classList.remove('hidden');

        this.updateSizeInfo();
    }

    updateSizeInfo() {
        const info = document.getElementById('crop-size-info');
        info.textContent = `${Math.round(this.cropData.width)} × ${Math.round(this.cropData.height)} px`;
    }

    async confirmCrop() {
        const canvas = document.getElementById('crop-canvas');
        const scaleX = this.originalImage.width / canvas.width;
        const scaleY = this.originalImage.height / canvas.height;

        // Crear canvas para la imagen recortada
        const cropCanvas = document.createElement('canvas');
        const ctx = cropCanvas.getContext('2d');

        // Calcular coordenadas en la imagen original
        const sourceX = this.cropData.x * scaleX;
        const sourceY = this.cropData.y * scaleY;
        const sourceWidth = this.cropData.width * scaleX;
        const sourceHeight = this.cropData.height * scaleY;

        // Tamaño final
        const maxSize = this.isSquare ? 500 : 1200;
        let finalWidth = sourceWidth;
        let finalHeight = sourceHeight;

        if (finalWidth > maxSize || finalHeight > maxSize) {
            const ratio = Math.min(maxSize / finalWidth, maxSize / finalHeight);
            finalWidth *= ratio;
            finalHeight *= ratio;
        }

        cropCanvas.width = finalWidth;
        cropCanvas.height = finalHeight;

        // Dibujar imagen recortada
        ctx.drawImage(
            this.originalImage,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, finalWidth, finalHeight
        );

        // Convertir a base64
        const croppedImage = cropCanvas.toDataURL('image/jpeg', 0.85);

        // Llamar callback
        if (this.callback) {
            this.callback(croppedImage);
        }

        // Cerrar sin cancelar (wasCancelled = false)
        this.close(false);
    }

    close(wasCancelled = true) {
        this.cropModal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Si se canceló, llamar al callback de cancelación
        if (wasCancelled && this.cancelCallback) {
            this.cancelCallback();
        }
        
        // Limpiar
        const canvas = document.getElementById('crop-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const selection = document.getElementById('crop-selection');
        selection.classList.add('hidden');
        
        // Limpiar callbacks
        this.callback = null;
        this.cancelCallback = null;
    }
}

// Instancia global
window.imageCropModal = new ImageCropModal();

// console.log('✅ Sistema de recorte de imágenes cargado');


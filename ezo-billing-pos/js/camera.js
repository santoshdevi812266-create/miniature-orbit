// Camera Preview Module
class CameraPreview {
    constructor(containerId) {
        this.containerId = containerId;
        this.video = null;
        this.stream = null;
    }

    async initialize() {
        try {
            const container = document.getElementById(this.containerId);
            if (!container) {
                console.warn(`Container ${this.containerId} not found`);
                return;
            }

            this.video = document.createElement('video');
            this.video.autoplay = true;
            this.video.playsinline = true;
            this.video.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            `;

            // Request camera access
            const constraints = {
                video: { facingMode: 'environment' },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            container.appendChild(this.video);
            console.log('Camera preview initialized');
            return true;
        } catch (error) {
            console.error('Camera error:', error);
            this.showCameraError(error.message);
            return false;
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.video && this.video.parentElement) {
            this.video.parentElement.removeChild(this.video);
        }
    }

    showCameraError(message) {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; border-radius: 8px;">
                    <div style="text-align: center; color: #666;">
                        <p>📷 Camera not available</p>
                        <small>${message}</small>
                    </div>
                </div>
            `;
        }
    }
}

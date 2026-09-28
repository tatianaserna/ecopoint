function initMobilePointForm() {
    const form = document.getElementById('recyclingForm');
    const nameInput = document.getElementById('name_point');
    const locationButton = document.getElementById('btn-point-geolocation');
    const coordinatesText = document.getElementById('coordsText');
    const photoInput = document.getElementById('point-evidence-photo');
    const previewBox = document.getElementById('point-preview-box');
    const previewImage = document.getElementById('point-preview-img');
    const removePhotoButton = document.getElementById('btn-remove-point-photo');
    const status = document.getElementById('point-form-status');
    const mapCard = document.querySelector('.map-section .map-card');
    let coordinates = null;
    let pointMarker = null;
    let previewUrl = null;

    if (!form || !locationButton || !photoInput || !status) return;

    if (!isMobileDevice()) {
        photoInput.removeAttribute('capture');
    }

    locationButton.addEventListener('click', () => {
        if (!isLoggedIn() || !isMobileDevice()) return;
        if (!navigator.geolocation) {
            status.textContent = 'Este dispositivo no permite obtener la ubicación.';
            status.className = 'form-status is-error';
            return;
        }

        locationButton.disabled = true;
        status.textContent = 'Obteniendo ubicación...';
        status.className = 'form-status';

        navigator.geolocation.getCurrentPosition((position) => {
            coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            coordinatesText.textContent = `Lat: ${coordinates.latitude.toFixed(6)}, Lon: ${coordinates.longitude.toFixed(6)}`;

            if (typeof leafletMap !== 'undefined' && leafletMap) {
                const point = [coordinates.latitude, coordinates.longitude];
                leafletMap.flyTo(point, 15, { animate: true, duration: 1.2 });
                if (pointMarker) {
                    pointMarker.setLatLng(point);
                } else {
                    pointMarker = L.marker(point).addTo(leafletMap);
                }
                pointMarker.bindPopup('Ubicación del nuevo punto').openPopup();
                mapCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            status.textContent = 'Ubicación obtenida.';
            status.className = 'form-status is-success';
            locationButton.disabled = false;
        }, (error) => {
            const messages = {
                1: 'Permite el acceso a la ubicación para continuar.',
                2: 'No se pudo determinar la ubicación. Inténtalo de nuevo.',
                3: 'La solicitud de ubicación tardó demasiado. Inténtalo de nuevo.',
            };
            status.textContent = messages[error.code] || 'No se pudo obtener la ubicación.';
            status.className = 'form-status is-error';
            locationButton.disabled = false;
        }, { enableHighAccuracy: true, timeout: 15000 });
    });

    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = file ? URL.createObjectURL(file) : null;
        previewImage.src = previewUrl || '';
        previewBox.hidden = !file;
    });

    removePhotoButton.addEventListener('click', () => {
        photoInput.value = '';
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = null;
        previewImage.src = '';
        previewBox.hidden = true;
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        status.textContent = '';
        status.className = 'form-status';

        if (!isLoggedIn()) {
            status.textContent = 'Inicia sesión para registrar un punto.';
            status.classList.add('is-error');
            return;
        }
        if (!isMobileDevice()) {
            status.textContent = 'El registro con GPS y foto está disponible desde un celular.';
            status.classList.add('is-error');
            return;
        }
        if (nameInput.value.trim().length < 3) {
            status.textContent = 'El nombre debe tener al menos 3 caracteres.';
            status.classList.add('is-error');
            return;
        }
        if (!coordinates) {
            status.textContent = 'Obtén la ubicación GPS antes de guardar el punto.';
            status.classList.add('is-error');
            return;
        }
        if (!photoInput.files.length) {
            status.textContent = 'Selecciona una foto de evidencia antes de guardar.';
            status.classList.add('is-error');
            return;
        }

        const formData = new FormData();
        formData.append('name', nameInput.value.trim());
        formData.append('latitude', String(coordinates.latitude));
        formData.append('longitude', String(coordinates.longitude));
        formData.append('address', 'Ubicación GPS');
        formData.append('image', photoInput.files[0]);

        status.textContent = 'Guardando punto...';
        try {
            const response = await fetch(`${API_BASE}/recycling-points/mobile/points`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.error || result.message || 'No se pudo registrar el punto.');
            }

            status.textContent = 'Punto registrado correctamente.';
            status.classList.add('is-success');
            form.reset();
            coordinates = null;
            coordinatesText.textContent = 'Lat: -, Lon: -';
            previewBox.hidden = true;
            previewImage.src = '';
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            previewUrl = null;
            if (typeof loadRecyclingPoints === 'function') loadRecyclingPoints();
        } catch (error) {
            status.textContent = error.message;
            status.classList.add('is-error');
        }
    });
}
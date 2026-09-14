const MEDAL_ICONS = ['☆', '🎖', '🏆', '↗', '⭐', '🏅'];

function formatPoints(value) {
    return Number(value).toLocaleString('es-CO');
}

function renderMedalsCatalog(medals) {
    const grid = document.getElementById('medals-grid');
    if (!grid) return;

    const sorted = [...medals].sort((a, b) => a.pointsRequired - b.pointsRequired);

    if (!sorted.length) {
        grid.innerHTML = '<p class="medals-empty">No hay medallas en el catálogo.</p>';
        return;
    }

    grid.innerHTML = sorted
        .map((medal, index) => {
            const icon = MEDAL_ICONS[index % MEDAL_ICONS.length];
            return `
                <div class="medal-item unlocked">
                    <span class="medal-icon">${icon}</span>
                    <p>${medal.name}</p>
                    <span class="medal-points">${formatPoints(medal.pointsRequired)} pts</span>
                </div>
            `;
        })
        .join('');
}

function renderUserPoints(total, medals) {
    if (!isLoggedIn()) return;

    const totalEl = document.getElementById('user-points-total');
    const progressEl = document.getElementById('user-points-progress');
    const progressTextEl = document.getElementById('user-points-progress-text');

    if (!totalEl) return;

    totalEl.textContent = formatPoints(total);

    const sorted = [...medals].sort((a, b) => a.pointsRequired - b.pointsRequired);
    const nextMedal = sorted.find((medal) => total < medal.pointsRequired);

    if (!progressEl || !progressTextEl) return;

    if (!nextMedal) {
        progressEl.style.width = '100%';
        progressTextEl.textContent = '¡Has alcanzado todas las medallas del catálogo!';
        return;
    }

    const previousThreshold = sorted
        .filter((medal) => medal.pointsRequired <= total)
        .pop()?.pointsRequired ?? 0;

    const range = nextMedal.pointsRequired - previousThreshold;
    const progress = range > 0
        ? Math.min(100, Math.round(((total - previousThreshold) / range) * 100))
        : 0;

    progressEl.style.width = `${progress}%`;
    progressTextEl.textContent = `${formatPoints(nextMedal.pointsRequired - total)} puntos hasta la próxima medalla`;
}

// Funcionalidad Extra 2: Mostrar impacto ambiental estimado basado en los puntos
function renderImpactoAmbiental(totalPuntos) {
    const impactoContainer = document.getElementById('impacto-ambiental-card');
    if (!impactoContainer) return;

    // Cálculo estimado: 10 puntos = 1 kg de material reciclado, 50 puntos = 1 árbol salvado
    const kilosEstimados = (totalPuntos / 10).toFixed(1);
    const arbolesEquivalentes = (totalPuntos / 50).toFixed(1);

    impactoContainer.innerHTML = `
        <div class="impacto-content">
            <h3>🌍 Tu Impacto Ambiental</h3>
            <p>🌿 Residuos reciclados estimados: <strong>${kilosEstimados} kg</strong></p>
            <p>🌳 Equivalente en árboles salvados: <strong>${arbolesEquivalentes}</strong></p>
        </div>
    `;
}

async function loadRewards() {
    const grid = document.getElementById('medals-grid');
    const totalEl = document.getElementById('user-points-total');
    const progressTextEl = document.getElementById('user-points-progress-text');

    if (grid) {
        grid.innerHTML = '<p class="medals-status">Cargando medallas...</p>';
    }

    if (isLoggedIn() && totalEl) {
        totalEl.textContent = '…';
        if (progressTextEl) progressTextEl.textContent = 'Cargando puntos...';
    }

    try {
        const medals = await apiRequest('/medals');
        renderMedalsCatalog(medals);

        if (!isLoggedIn()) return;

        const user = await apiRequest('/auth/me');
        const records = await apiRequest(`/recycling-records/user/${user.id}`);
        const total = records.reduce((sum, record) => sum + record.pointsEarned, 0);
        
        renderUserPoints(total, medals);
        renderImpactoAmbiental(total); // Se ejecuta aquí la funcionalidad extra con el total de puntos
    } catch (error) {
        if (grid) {
            grid.innerHTML = `<p class="medals-status is-error">No se pudo cargar el catálogo: ${error.message}</p>`;
        }

        if (isLoggedIn() && totalEl) {
            totalEl.textContent = '—';
            if (progressTextEl) {
                progressTextEl.textContent = `No se pudieron cargar tus puntos: ${error.message}`;
            }
        }
    } finally {
        if (typeof syncRewardsAuthUI === 'function') {
            syncRewardsAuthUI();
        }
    }
}

function initRewards() {
    loadRewards();
}

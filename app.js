// ===== Ajustes del evento =====
const EVENT_CODE = 'boda-2025';   // Cambia el código del evento si quieres separar álbumes
const ADMIN_KEY  = 'noviafeliz';  // Cambia esta clave para moderar desde la UI

// ===== Estado =====
let pb = null;            // Cliente de PocketBase
let adminMode = false;
let guestName = '';

// ===== Elementos UI =====
const backendUrlInput   = document.getElementById('backendUrl');
const saveBackend       = document.getElementById('saveBackend');
const nameForm          = document.getElementById('nameForm');
const guestNameInput    = document.getElementById('guestName');
const uploadSec         = document.getElementById('upload');
const photoInput        = document.getElementById('photoInput');
const sendBtn           = document.getElementById('sendBtn');
const progressP         = document.getElementById('progress');
const grid              = document.getElementById('grid');
const empty             = document.getElementById('empty');
const adminKey          = document.getElementById('adminKey');
const toggleModeration  = document.getElementById('toggleModeration');
const genQR             = document.getElementById('genQR');
const qrUrl             = document.getElementById('qrUrl');
const qrCanvas          = document.getElementById('qrCanvas');

// ===== Cargar valores guardados =====
backendUrlInput.value = localStorage.getItem('pb_url') || '';
guestNameInput.value  = localStorage.getItem('guest_name') || '';

// ===== Conectar con PocketBase cuando guardes la URL =====
saveBackend.addEventListener('click', () => {
  const url = backendUrlInput.value.trim();
  if (!url) return alert('Pega el Backend URL (ej. https://tu-app.fly.dev)');
  localStorage.setItem('pb_url', url);
  pb = new PocketBase(url);
  startLive();
  alert('Conectado al backend ✅');
});

// ===== Nombre del invitado =====
nameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  guestName = guestNameInput.value.trim() || 'Invitado';
  localStorage.setItem('guest_name', guestName);
  uploadSec.classList.remove('hidden');
});

// Habilitar botón cuando selecciones archivo
photoInput.addEventListener('change', () => {
  sendBtn.disabled = !photoInput.files?.length;
});

// ===== Subir foto =====
sendBtn.addEventListener('click', async () => {
  if (!pb) return alert('Primero guarda el Backend URL.');
  const file = photoInput.files?.[0];
  if (!file) return;

  try {
    const form = new FormData();
    form.append('event', EVENT_CODE);
    form.append('by', guestName || 'Invitado');
    form.append('approved', false);
    form.append('image', file);

    await pb.collection('photos').create(form);
    progressP.textContent = '¡Foto subida! Pendiente de aprobación.';
    sendBtn.disabled = true;
    photoInput.value = '';
  } catch (err) {
    alert('Error al subir: ' + err.message);
  }
});

// ===== Galería en vivo =====
let subscribed = false;

function startLive(){
  if (!pb) return;

  // 1) render inicial
  fetchAndRender();

  // 2) suscripción realtime (una sola vez)
  if (!subscribed) {
    pb.collection('photos').subscribe('*', () => fetchAndRender());
    subscribed = true;
  }
}

async function fetchAndRender(){
  try {
    const res = await pb.collection('photos').getList(1, 200, {
      filter: `event="${EVENT_CODE}"`,
      sort: '-created'
    });

    grid.innerHTML = '';
    let any = false;

    for (const x of res.items) {
      if (!adminMode && !x.approved) continue;
      any = true;

      const fig = document.createElement('figure');

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = pb.files.getUrl(x, x.image);
      fig.appendChild(img);

      const cap = document.createElement('figcaption');
      cap.className = 'badge';
      cap.textContent = x.by || 'Invitado';
      fig.appendChild(cap);

      if (adminMode) {
        const bar = document.createElement('div');
        bar.className = 'admin-bar';

        const btn = document.createElement('button');
        btn.textContent = x.approved ? 'Ocultar' : 'Aprobar';
        btn.addEventListener('click', async () => {
          await pb.collection('photos').update(x.id, { approved: !x.approved });
          fetchAndRender();
        });

        bar.appendChild(btn);
        fig.appendChild(bar);
      }

      grid.appendChild(fig);
    }

    empty.style.display = any ? 'none' : 'block';
  } catch (err) {
    console.error(err);
  }
}

// ===== Modo admin (solo para moderar desde la UI) =====
toggleModeration.addEventListener('click', () => {
  if (adminMode) {
    adminMode = false;
    toggleModeration.textContent = 'Conectar';
    fetchAndRender();
    return;
  }
  if (adminKey.value === ADMIN_KEY) {
    adminMode = true;
    toggleModeration.textContent = 'Modo moderación ON';
    fetchAndRender();
  } else {
    alert('Clave incorrecta');
  }
});

// ===== Generador de QR =====
genQR.addEventListener('click', () => {
  const url = qrUrl.value.trim();
  qrCanvas.innerHTML = '';
  if (!url) return alert('Pega el URL público primero.');
  QRCode.toCanvas(document.createElement('canvas'), url, { width: 240 }, (err, canvas) => {
    if (err) return alert('Error creando QR');
    qrCanvas.appendChild(canvas);
  });
});

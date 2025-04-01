if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

document.getElementById('notify-button').addEventListener('click', () => {
    if (Notification.permission === 'granted') {
        new Notification('Hola desde la PWA!', {
            body: 'Esta es una notificación de prueba',
            icon: 'icon.png'
        });
    }
});

// IndexedDB para almacenar datos localmente
let db;
const request = indexedDB.open('PWA_DB', 1);

request.onupgradeneeded = event => {
    db = event.target.result;
    db.createObjectStore('datos', { keyPath: 'id' });
};

request.onsuccess = event => {
    db = event.target.result;
};

function guardarDato(id, contenido) {
    const transaction = db.transaction(['datos'], 'readwrite');
    const store = transaction.objectStore('datos');
    store.put({ id, contenido });
}

function obtenerDato(id, callback) {
    const transaction = db.transaction(['datos'], 'readonly');
    const store = transaction.objectStore('datos');
    const request = store.get(id);
    request.onsuccess = () => callback(request.result);
}

// Prueba guardando datos
guardarDato(1, 'Hola IndexedDB');
obtenerDato(1, data => console.log('Dato almacenado:', data));

// Sincronización en segundo plano
if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(sw => {
        return sw.sync.register('sync-data');
    }).catch(err => console.log('Error en la sincronización:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    document.getElementById('install-button').hidden = false;
});

document.getElementById('install-button').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                console.log('PWA instalada');
            }
            document.getElementById('install-button').hidden = true;
        });
    }
});

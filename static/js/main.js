
const DATA_URL = 'static/data/data.json';
let profesionalData = null;

// Tema: persistencia y preferencia del sistema
function initTheme(){
    const saved = localStorage.getItem('cv-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(saved === 'dark' || (!saved && prefersDark)){
        document.body.classList.add('dark-mode');
        setThemeIcon(true);
    } else {
        document.body.classList.remove('dark-mode');
        setThemeIcon(false);
    }


    document.getElementById('themeToggle').addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('cv-theme', isDark ? 'dark' : 'light');
        setThemeIcon(isDark);
    });
}


function setThemeIcon(isDark){
    const icon = document.getElementById('themeIcon');
    if(!icon) return;
    icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    document.getElementById('themeToggle').setAttribute('aria-pressed', String(isDark));
}


// Cargar JSON con fallback
async function loadData(){
    try{
        const res = await fetch(DATA_URL);
        if(!res.ok) throw new Error('Respuesta no OK');
        profesionalData = await res.json();
    } catch(e){
        console.warn('No se pudo cargar el JSON, usando datos de fallback.', e);
        profesionalData = getFallbackData();
    }
}


function getFallbackData(){
    return {
        experiencia: [{ empresa:'Empresa X', rol:'Desarrollador Junior', periodo:'2022 - 2024', descripcion:'Desarrollo de aplicaciones web, mantenimiento y mejoras continuas.' }],
        formacion: [{ titulo:'Ingeniería en Sistemas', institucion:'Universidad Ejemplo', periodo:'2018 - 2022' }],
        certificados: [
            { nombre:'Curso de Python', institucion:'Platzi', url:'certificados/python.pdf' },
            { nombre:'Desarrollo Web', institucion:'Coursera', url:'certificados/web.pdf' }
        ]
    };
}


// Util: extraer año de inicio para ordenar (intenta obtener el primer número de 4 dígitos)
function parseStartYear(periodo){
    if(!periodo) return 0;
    const m = periodo.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 0;
}


// Renderizado
function renderExperiencia(){
    const container = document.getElementById('experienciaTimeline');
    container.innerHTML = '';
    const items = [...(profesionalData.experiencia || [])];
    items.sort((a,b) => parseStartYear(b.periodo) - parseStartYear(a.periodo));
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `<strong>${escapeHtml(item.empresa)}</strong> – ${escapeHtml(item.rol)} (${escapeHtml(item.periodo)})<br/><div class="mt-1">${escapeHtml(item.descripcion)}</div>`;
        container.appendChild(div);
    });
}


function renderFormacion(){
    const container = document.getElementById('formacionTimeline');
    container.innerHTML = '';
    const items = [...(profesionalData.formacion || [])];
    items.sort((a,b) => parseStartYear(b.periodo) - parseStartYear(a.periodo));
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.textContent = `${item.titulo} – ${item.institucion} (${item.periodo})`;
        container.appendChild(div);
    });
}


function renderCertificados(){
    const container = document.getElementById('listaCertificados');
    container.innerHTML = '';
    (profesionalData.certificados || []).forEach(cert => {
        const a = document.createElement('a');
        a.href = cert.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'tag';
        a.innerHTML = `${escapeHtml(cert.nombre)} <span class="opacity-75">– ${escapeHtml(cert.institucion)}</span>`;
        a.setAttribute('title', `${cert.nombre} – ${cert.institucion}`);
        container.appendChild(a);
    });
}


// Seguridad mínima: escapar texto para evitar XSS si el JSON fuese malicioso
function escapeHtml(str){
    if(!str) return '';
    return String(str).replace(/[&<>"'`]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[s]));
}


function initInteractions(){
    const certToggle = document.getElementById('certToggle');
    certToggle.addEventListener('click', () => {
        const container = document.getElementById('listaCertificados');
        const expanded = certToggle.getAttribute('aria-expanded') === 'true';
        certToggle.setAttribute('aria-expanded', String(!expanded));
        container.classList.toggle('hidden');
    });
}

// Inicialización completa
async function init(){
    initTheme();
    await loadData();
    renderExperiencia();
    renderFormacion();
    renderCertificados();
    initInteractions();
}


// Ejecutar
init();
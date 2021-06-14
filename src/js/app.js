let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
};

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {    
    mostrarServicios();
    //Resalta el div actual
    mostrarSeccion();
    //Oculta o muestra la seccion
    cambiarSeccion();
    //Siguiente y anterior
    paginaSiguiente();
    paginaAnterior();
    //Comprobar pagina
    botonesPaginador();
    //Muestra el resumen de la cita o error
    mostrarResumen();
    //Almacena los datos de la cita
    nombreCita();
    fechaCita();
    fechaAnterior();
    horaCita();
}


/* RESUMEN */
function nombreCita() {
    const nombre = document.querySelector('#nombre');

    nombre.addEventListener('input', e => {
        const nombreText = e.target.value.trim();
        //Validacion del nombre
        if(nombreText === '' || nombreText.length < 3) {
            mostrarAlerta('¡Nombre Invalido!', 1);
        } else {
            const alerta = document.querySelector('.alerta');
            if(alerta) {
                alerta.remove();
            }
           cita.nombre = nombreText; 
        }
    });
}

function fechaCita() {
    const fecha = document.querySelector('#fecha');
    fecha.addEventListener('input', e => {
        const dia = new Date(e.target.value).getUTCDay();
        if([0, 6].includes(dia)) {
            e.preventDefault();
            fecha.value = '';
            mostrarAlerta('fines de semanas no permitidos', 1);
        } else {
            cita.fecha = fecha.value;
        }
    });
}

function fechaAnterior() {
    const fecha = document.querySelector('#fecha');

    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const mes = monthFormated();
    const dia = fechaActual.getDate() +1;
    const fechaDesabilitar = `${year}-${mes}-${dia}`;

    fecha.min = fechaDesabilitar;
}

function horaCita() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e => {
        const horaCita = e.target.value;
        const hora = horaCita.split(':');

        if(hora[0] < 10 || hora[0] > 18) {
            mostrarAlerta('Hora invalida', 1);
            inputHora.value = '';
            cita.hora = '';
        } else {
            cita.hora = horaCita;
        }
    })
}

function mostrarResumen() {
    const {nombre, fecha, hora, servicios } = cita; //destructuring al objeto

    const resumenDiv = document.querySelector('.contenido-resumen');
    resumenDiv.innerHTML= ''; //Elimina las alertas anteriores
    
    //Comprueba si el formulario(Nombre, Fecha y Hora) esta completo
    if(Object.values(cita).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de Servicio, rellena todos los campos.';
        noServicios.classList.add('invalidar-cita');
        resumenDiv.appendChild(noServicios);
        return;
    }

    //Crea el resumen (Nombre, Fecha, Hora, etc)
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;
    const fechaCita = document.createElement('P');
    fechaCita.innerHTML =  `<span>Fecha:</span> ${fecha}`;
    const horaCita = document.createElement('P');
    horaCita.innerHTML =  `<span>Hora:</span> ${hora}`;

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    serviciosCita.appendChild(headingServicios);

    if(Object.keys(servicios).length === 0) {
        const serviciosVacio = document.createElement('P');
        serviciosVacio.textContent = 'No agregaste ningun servicio';
        serviciosVacio.classList.add('invalidar-cita');
        serviciosCita.appendChild(serviciosVacio);

        resumenDiv.appendChild(nombreCita);
        resumenDiv.appendChild(fechaCita);
        resumenDiv.appendChild(horaCita);
        resumenDiv.appendChild(serviciosCita);
        return;
    }
    
    let cantidad = 0; //Almacena la cantidad a pagar

    //Recorre los servicios selecionados para agregarlos al HTML
    servicios.forEach( servicio => {
        const {nombreServicio, precio} = servicio;
        
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicios');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombreServicio;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');
        cantidad += parseInt(totalServicio[1].trim());

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    });

    //Agrega los servicios al HTML
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a pagar: </span>$${cantidad}`;

    resumenDiv.appendChild(cantidadPagar);
}


/* NAVEGACION */
function mostrarSeccion() {
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if(seccionAnterior) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }
    //Hace visible la pagina en la que dimos click
    const seccion = document.querySelector(`#paso-${pagina}`)
    seccion.classList.add('mostrar-seccion');

    //Eliminar el marcado azul del anterior
    const tabAnterior = document.querySelector('.tabs .actual');
    if(tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    //Agrega la clase(azul boton) al nuevo tab
    const tab = document.querySelector(`[data-paso="${pagina}"]`)
    tab.classList.add('actual');

}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();

            pagina = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();
        });
    })
}

/* SERVICIOS */
async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();
        const {servicios} = db;
        
        //html 
        servicios.forEach( servicio => {
            const { id, nombre, precio } = servicio;

            //DOM Scripting

            //Genrar HTML de servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');


            //Genrar HTML del precio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            //Genrar HTML el DIV que contiene los servicios
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;
            
            //Agrega el nombre y el precio al DIV
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //Muestra el div
            document.querySelector('#servicios').appendChild(servicioDiv);
            
            //Selecciona para la cita
            servicioDiv.onclick = selecionarServicio;
        });
    } catch (error) {
        console.log(error);
    }
}

function selecionarServicio(e) {
    
    let elemento;
    if(e.target.tagName === 'P'){
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }

    if(elemento.classList.contains('selecionado')) {
        elemento.classList.remove('selecionado');
        const id = parseInt(elemento.dataset.idServicio);
        eliminarServicio(id);
    } else {
        elemento.classList.add('selecionado');

        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),
            nombreServicio: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent
        };

        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id) {
    const {servicios} = cita;
    cita.servicios = servicios.filter( servicio => servicio.id !== id);
}

function agregarServicio(servicioObj) {
    const {servicios} = cita;
    cita.servicios = [...servicios, servicioObj];
}

/* Botones */
function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;
        botonesPaginador();
    });
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;
        botonesPaginador();
    });
}

function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if(pagina === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if(pagina === 2) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if(pagina === 3) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');
        mostrarResumen(); //Pagina 3 cargar el resumen
    }
    mostrarSeccion();
}

/* Utilidades */
function monthFormated(){ 
    var date = new Date(), 
        month = date.getMonth(); 
    return month < 10 ? "0" + (month+1) : month+1; 
}

function mostrarAlerta(mensaje, tipo) { //1: error | 0 : correcto
    
    //Evitar muchas alertas
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia) {
        return;
    }
    
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    if(tipo === 1) {
        alerta.classList.add('error');
    }

    const formulario = document.querySelector('.formulario');
    formulario.appendChild(alerta);

    //Elimar la alerta
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}
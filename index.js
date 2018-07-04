'use strict';
const Nightmare = require('nightmare');
Nightmare.action('show',
    function(name, options, parent, win, renderer, done) {
        parent.respondTo('show', function(inactive, done) {
            if(inactive) {
                win.showInactive();
            } else {
                win.show();
            }

            done();
        });

        done();
    },
    function(inactive, done) {
        this.child.call('show', inactive, done);
    });

Nightmare.action('hide',
    function(name, options, parent, win, renderer, done) {
        parent.respondTo('hide', function(done) {
            win.hide();
            done();
        });

        done();
    },
    function(done) {
        this.child.call('hide', done);
    });

const nightmare = Nightmare({
    openDevTools: {
        mode: 'detach'
    }, 
    show: true
});

module.exports = (rfc, password, mode, dates) => {
    // Missing validations
    if (mode === 'recibidas') {
        mode = '#ctl00_MainContent_RdoTipoBusquedaReceptor';
    } else if (mode === 'emitidas') {
        mode = '#ctl00_MainContent_RdoTipoBusquedaEmisor'
    } else {
        throw new Error(`Invalid mode, got ${mode}`);
    }

    nightmare
    .goto('https://portalcfdi.facturaelectronica.sat.gob.mx/')
    .wait('#rfc')
    .insert('#rfc', rfc)
    .insert('#password', password)
    //El span aparece en el home despues de iniciar sesión
    .wait('#ctl00_LblRfcAutenticado')
    // Verificar que el RFC proporcionado sea el que inicio sesión
    .evaluate((rfc) => {
        if (rfc !== (document.querySelector('#ctl00_LblRfcAutenticado').innerText.split(':')[1]).split(' ')[1]) {
            throw new Error('RFC PROPORCIONADO NO COINCIDE CON EL QUE INICIO SESION');
        }
    }, rfc)
    // .hide()
    .click(mode)
    .click('#ctl00_MainContent_BtnBusqueda')
    .wait('#ctl00_MainContent_RdoFechas')
    .click('#ctl00_MainContent_RdoFechas')
    .wait(500)
    .evaluate((dates) => {
        function parseDate(date) {
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            var dd = date.getDate();
            var mm = date.getMonth()+1; //Enero es 0!
            var yyyy = date.getFullYear();
            if(dd < 10) {
                dd='0'+dd;
            } 
            if(mm < 10) {
                mm='0'+mm;
            } 
            return dd + '/' + mm + '/' + yyyy;
        }
        updateDateField('ctl00$MainContent$CldFechaInicial2$Calendario_text', parseDate(dates.start));
        updateDateField('ctl00$MainContent$CldFechaFinal2$Calendario_text', parseDate(dates.end));
    }, dates)
    .wait(500)
    // ctl00_MainContent_DdlEstadoComprobante ESTADO DEL COMPROBANTE TIENE QUE SER VIGENTE
    .click('#ctl00_MainContent_BtnBusqueda')
    // .end()
    .catch((e) => {
        console.log(e);
    });

};
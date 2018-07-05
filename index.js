'use strict';
const Nightmare = require('nightmare');

Nightmare.action('show',
	(name, options, parent, win, renderer, done) => {
		parent.respondTo('show', (inactive, done) => {
			if (inactive) {
				win.showInactive();
			} else {
				win.show();
			}

			done();
		});

		done();
	},
	(inactive, done) => {
		this.child.call('show', inactive, done);
	});

Nightmare.action('hide',
	(name, options, parent, win, renderer, done) => {
		parent.respondTo('hide', done => {
			win.hide();
			done();
		});

		done();
	},
	done => {
		this.child.call('hide', done);
	});

const nightmare = Nightmare({
	show: true
});

module.exports = (rfc, password, mode, rango) => {
	validaciones(rfc, password, mode, rango);

	const satUrl = 'https://portalcfdi.facturaelectronica.sat.gob.mx/';
	const inputRfc = '#rfc';
	const inputPassword = '#password';
	const spanAuthUser = '#ctl00_LblRfcAutenticado';
	const btnBusqueda = '#ctl00_MainContent_BtnBusqueda';
	const radioFechas = '#ctl00_MainContent_RdoFechas';
	const selectEstadoComprobante = '#ctl00_MainContent_DdlEstadoComprobante';

	const nightmarePromise = new Promise((resolve, reject) => {
		nightmare
			.goto(satUrl)
			.wait(inputRfc)
			.insert(inputRfc, rfc)
			.insert(inputPassword, password)
			// El span aparece en el home despues de iniciar sesión
			.wait(spanAuthUser)
			// Verificar que el RFC proporcionado sea el que inicio sesión
			.evaluate(rfc => {
				if (rfc !== (document.querySelector(spanAuthUser).innerText.split(':')[1]).split(' ')[1]) {
					throw new Error('RFC PROPORCIONADO NO COINCIDE CON EL QUE INICIO SESION');
				}
			}, rfc)
			.hide()
			.click(mode)
			.click(btnBusqueda)
			.wait(radioFechas)
			.click(radioFechas)
			.wait(1000)
			.evaluate(rango => {
				function parseDate(date) {
					if (!(date instanceof Date)) {
						date = new Date(date);
					}
					let dd = date.getDate();
					let mm = date.getMonth() + 1;
					const yyyy = date.getFullYear();
					if (dd < 10) {
						dd = '0' + dd;
					}
					if (mm < 10) {
						mm = '0' + mm;
					}
					return dd + '/' + mm + '/' + yyyy;
				}
				updateDateField('ctl00$MainContent$CldFechaInicial2$Calendario_text', parseDate(rango.inicio));
				updateDateField('ctl00$MainContent$CldFechaFinal2$Calendario_text', parseDate(rango.final));
			}, rango)
			.wait(500)
			.select(selectEstadoComprobante, 1)
			.wait(500)
			.click(btnBusqueda)
			.wait(1500)
			.evaluate(() => {
				const promises = [];
				for (const facturaElement of document.getElementsByName('BtnDescarga')) {
					promises.push(
						new Promise((resolve, reject) => {
							const regex = /'.*?'/g;
							const downloadFunction = facturaElement.getAttribute('onclick');

							let blobUrl = regex.exec(downloadFunction)[0].slice(1, -1);
							blobUrl = (window.location.href.replace(window.location.pathname, '')) + '/' + blobUrl;

							const xhr = new XMLHttpRequest();
							xhr.open('GET', blobUrl, true);
							xhr.onload = error => {
								if (error) {
									reject(error);
								}
								if (xhr.readyState === 4) {
									if (xhr.status === 200) {
										resolve(xhr.responseText);
									} else {
										console.error(xhr.statusText);
										reject(xhr.statusText);
									}
								}
							};
							xhr.send();
						})
					);
				}

				return Promise.all(promises);
			})
			.end(xmls => {
				resolve(xmls);
			})
			.catch(e => {
				console.log(e);
				reject(e);
			});
	});

	return nightmarePromise;
};

function validaciones(rfc, password, mode, rango) {
	if (!rfc) {
		throw new Error('RFC es requerido');
	}
	if (!password) {
		throw new Error('La contraseña es requerida');
	}
	if (mode === 'recibidas') {
		mode = '#ctl00_MainContent_RdoTipoBusquedaReceptor';
	} else if (mode === 'emitidas') {
		mode = '#ctl00_MainContent_RdoTipoBusquedaEmisor';
	} else {
		throw new Error(`Modo inválido, recibí ${mode}`);
	}
	if (!rango.inicio) {
		throw new Error('Falta la fecha inicial en el rango');
	}
	if (!rango.final) {
		throw new Error('Falta la fecha final en el rango');
	}
	if (!(rango.inicio instanceof Date)) {
		throw new TypeError('La fecha inicial no es de tipo Date');
	}
	if (!(rango.final instanceof Date)) {
		throw new TypeError('La fecha final no es de tipo Date');
	}
}

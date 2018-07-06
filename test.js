import test from 'ava';
import satdwnld from '.';

test('RFC', t => {
	const err = t.throws(() => {
		satdwnld('', '123', {
			inicio: new Date('May 1, 2018 00:00:00'),
			final: new Date('May 31, 2018 23:59:59')
		});
	}, Error);
	t.is(err.message, 'RFC es requerido');
});

test('Password', t => {
	const err = t.throws(() => {
		satdwnld('abc', '', {
			inicio: new Date('May 1, 2018 00:00:00'),
			final: new Date('May 31, 2018 23:59:59')
		});
	}, Error);
	t.is(err.message, 'La contraseña es requerida');
});

// Test('mode', t => {
// 	const err = t.throws(() => {
// 		satdwnld('abc', '123', {
// 			inicio: new Date('May 1, 2018 00:00:00'),
// 			final: new Date('May 31, 2018 23:59:59')
// 		});
// 	}, Error);
// 	t.is(err.message, 'Modo inválido, recibí todas');
// });

test('Dates', t => {
	const errInicial = t.throws(() => {
		satdwnld('abc', '123', {
			inicio: 'May 1, 2018 00:00:00',
			final: new Date('May 31, 2018 23:59:59')
		});
	}, TypeError);

	const errFinal = t.throws(() => {
		satdwnld('abc', '123', {
			inicio: new Date('May 1, 2018 00:00:00'),
			final: 'May 31, 2018 23:59:59'
		});
	}, TypeError);

	t.is(errInicial.message, 'La fecha inicial no es de tipo Date');

	t.is(errFinal.message, 'La fecha final no es de tipo Date');
});

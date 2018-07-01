import test from 'ava';
import satdwnld from '.';

test('title', t => {
	const err = t.throws(() => {
		satdwnld(123);
	}, TypeError);
	t.is(err.message, 'Expected a string, got number');

	t.is(satdwnld('unicorns'), 'unicorns & rainbows');
});

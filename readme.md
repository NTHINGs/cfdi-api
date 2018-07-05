# satdwnld [![Build Status](https://travis-ci.org/NTHINGs/satdwnld.svg?branch=master)](https://travis-ci.org/NTHINGs/satdwnld)

> Descargar xml del sat


## Instalar

```
$ npm install satdwnld
```


## Uso

```js
const satdwnld = require('satdwnld');

// Regresa una promesa
satdwnld('rfc', 'contraseña', 'emitidas', {
    inicio: new Date('May 1, 2018 00:00:00'),
    final: new Date('May 31, 2018 23:59:59')
}).then((facturas) => {
    console.log(facturas);
});
```


## API

### satdwnld(rfc, contraseña, modo, [rango de fechas])

#### Rfc

Type: `string`

RFC que quieras consultar sus facturas.

#### Contraseña

Type: `string`

Contraseña del SAT (para iniciar sesión en el portal).

#### Modo

Type: `string`

recibidas || emitidas

#### Rango de fechas

Type: `Object`

Objecto con la fecha inicial y final del rango que quieras consultar.

##### Inicio

Type: `Date`

##### Final

Type: `Date`


## License

MIT © [](http://none)

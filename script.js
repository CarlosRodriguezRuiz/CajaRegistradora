
import { createInterface } from "node:readline/promises";

const consola = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const cajaRegistradora = new Map();
cajaRegistradora.set(500, 0);
cajaRegistradora.set(200, 0);
cajaRegistradora.set(100, 0);
cajaRegistradora.set(50, 1);
cajaRegistradora.set(20, 5);
cajaRegistradora.set(10, 6);
cajaRegistradora.set(5, 7);
cajaRegistradora.set(2, 8);
cajaRegistradora.set(1, 6);
cajaRegistradora.set(0.5, 67);
cajaRegistradora.set(0.2, 34);
cajaRegistradora.set(0.1, 50);
cajaRegistradora.set(0.05, 67);
cajaRegistradora.set(0.02, 66);
cajaRegistradora.set(0.01, 50);

// Variables necesarias
let precio = Number(await consola.question("¿Cuánto cuesta el producto? "));
let total = 0;
let suficiente = false;
let noMasMoney = false;
let billeteDeMas = false;
let contadorBucle = 0;
let preguntas = Promise.resolve();
let dineroCliente = new Map();

// Guardamos una copia de la caja antes de empezar
const cajaRegistradoraCopia = new Map(cajaRegistradora);

// FUNCION PARA DEVOLVER EL CAMBIO
function cajaRegistradoraDevolucion(total, precio) {
  let cambio = Math.round((total - precio) * 100);
  let billetes = [...cajaRegistradora.keys()];
  let cambioArray = [];

  function buscarCambio(posicion, restante) {
    // Hemos conseguido devolver todo el cambio
    if (restante === 0) {
      return true;
    }

    // No quedan más billetes para probar
    if (posicion === billetes.length) {
      return false;
    }

    let billete = billetes[posicion];
    let valor = Math.round(billete * 100);
    let disponibles = cajaRegistradora.get(billete) || 0;

    // Calculamos cuántos billetes podemos utilizar como máximo
    let maximo = Math.min(disponibles, Math.floor(restante / valor));

    // Probamos distintas cantidades
    for (let i = maximo; i >= 0; i--) {
      for (let j = 0; j < i; j++) {
        cambioArray.push(billete);
      }

      // Intentamos completar el cambio con los siguientes billetes
      if (buscarCambio(posicion + 1, restante - i * valor)) {
        return true;
      }

      // Si no funciona, quitamos los billetes utilizados
      for (let j = 0; j < i; j++) {
        cambioArray.pop();
      }
    }

    return false;
  }

  if (buscarCambio(0, cambio)) {
    // Hemos encontrado una combinación válida
    cambioArray.forEach((billete) => {
      cajaRegistradora.set(
        billete,
        cajaRegistradora.get(billete) - 1,
      );
    });

    console.log("Cambio devuelto:", cambioArray);
    console.log(`Total devuelto: ${(cambio / 100).toFixed(2)} €`);

    return true;
  } else {
    console.log("No puedo devolver el cambio exacto.");
    return false;
  }
}

// EMPEZAMOS A COBRAR
while (!suficiente && !noMasMoney) {
  cajaRegistradora.forEach((cantidad, billete) => {
    preguntas = preguntas.then(async () => {
      if (suficiente || noMasMoney) return;

      let cantBilletes = "";
      let valido = false;
      let tipo = "";

      // Comprobamos si son billetes o monedas
      if (contadorBucle < 7) {
        tipo = "billetes";
      } else {
        tipo = "monedas";
      }

      // Repetimos la pregunta hasta introducir una cantidad válida
      while (!valido) {
        cantBilletes = await consola.question(
          `¿Cuántos ${tipo} de ${billete} € vas a utilizar?\nPulsa 'ENTER' si no vas a utilizar ninguno: `,
        );

        const cantidadIntroducida = Number(cantBilletes);

        if (!Number.isInteger(cantidadIntroducida) || cantidadIntroducida < 0) {
          console.log("¿ME ESTÁS INTENTANDO TIMAR?!!!!");
        } else {
          let dineroPendiente = Number(precio) - total;
          let cantidadNecesaria = Math.ceil(dineroPendiente / billete);

          if (cantidadIntroducida > cantidadNecesaria) {
            console.log(
              `¿PERO DÓNDE VAS CON ${cantidadIntroducida} ${tipo}? ¡Con ${cantidadNecesaria} es suficiente!`,
            );
          } else {
            valido = true;
          }
        }
      }

      contadorBucle++;

      if (cantBilletes !== "") {
        const cantidadIntroducida = Number(cantBilletes);

        let ultimoBillete = billete * cantidadIntroducida;

        total = Number((total + ultimoBillete).toFixed(2));

        // Guardamos el dinero temporalmente
        dineroCliente.set(billete, cantidadIntroducida);

        console.log("Total pagado: " + total + " €");
      }

      // Comprobamos si ya ha pagado suficiente
      if (total >= precio) {
        suficiente = true;

        if (total > precio) {
          billeteDeMas = true;

          console.log(`Has pagado ${total} €, pero el precio es ${precio} €.`);

          console.log(`Te tengo que devolver ${(total - precio).toFixed(2)} €.`);
        } else {
          console.log("Has pagado el importe exacto.");
        }
      }

      // Hemos recorrido todas las denominaciones
      if (contadorBucle >= 15 && !suficiente) {
        noMasMoney = true;

        console.log(
          "A mí no me vas a timar, todavía te falta por pagar: " +
            (precio - total).toFixed(2) +
            " €",
        );
      }
    });
  });

  await preguntas;

  if (suficiente) {
    // El cliente ha pagado, añadimos su dinero temporalmente
    dineroCliente.forEach((cantidad, billete) => {
      cajaRegistradora.set(
        billete,
        cajaRegistradora.get(billete) + cantidad,
      );
    });

    if (billeteDeMas) {
      // Intentamos devolver el cambio
      let cambioCorrecto = cajaRegistradoraDevolucion(total, precio);

      if (cambioCorrecto) {
        console.log("Pago completado correctamente.");
      } else {
        // No podemos devolver el cambio
        console.log("No puedo darte el cambio. Compra cancelada.");

        console.log("Te devuelvo:");

        dineroCliente.forEach((cantidad, billete) => {
          if (cantidad > 0) {
            console.log(`${cantidad} billetes/monedas de ${billete} €`);
          }
        });

        console.log(`Total devuelto: ${total} €`);

        // Restauramos la caja original
        cajaRegistradoraCopia.forEach((cantidad, billete) => {
          cajaRegistradora.set(billete, cantidad);
        });

        suficiente = false;
        noMasMoney = true;
      }
    } else {
      console.log("Pago completado correctamente.");
    }
  } else {
    // No ha pagado suficiente
    console.log("No tienes suficiente dinero. Te devuelvo:");

    dineroCliente.forEach((cantidad, billete) => {
      if (cantidad > 0) {
        console.log(`${cantidad} billetes/monedas de ${billete} €`);
      }
    });

    console.log(`Total devuelto: ${total} €`);

    total = 0;
    noMasMoney = true;
  }
}

console.log("Caja registradora actualizada:", cajaRegistradora);

consola.close();

import { createInterface } from "node:readline/promises";

const consola = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function cajaRegistradoraDevolucion(total, precio) {
  const cajaRegistradora = new Map();
  cajaRegistradora.set(500, 0);
  cajaRegistradora.set(200, 0);
  cajaRegistradora.set(100, 0);
  cajaRegistradora.set(50, 1);
  cajaRegistradora.set(20, 4);
  cajaRegistradora.set(10, 8);
  cajaRegistradora.set(5, 2);
  cajaRegistradora.set(2, 5);
  cajaRegistradora.set(1, 4);
  cajaRegistradora.set(0.5, 0);
  cajaRegistradora.set(0.2, 0);
  cajaRegistradora.set(0.1, 1);
  cajaRegistradora.set(0.05, 2);
  cajaRegistradora.set(0.02, 3);
  cajaRegistradora.set(0.01, 1);

  let cambio = total - precio;
  let cambioArray = [];
  cajaRegistradora.forEach((cantidad, billete) => {
    while (billete <= cambio && cajaRegistradora.get(billete) > 0) {
      let billeteUsado = 0;
      billeteUsado++;
      cambioArray.push(billete);
      cambio = cambio - billete;
      cambio = Number(cambio.toFixed(2));
      cajaRegistradora.set(
        billete,
        cajaRegistradora.get(billete) - billeteUsado,
      );
    }
  });
  if (cambio != 0) {
    console.log("No tengo cambio para " + cambio);
  } else {
    console.log(
      `El total es: ${total}, el precio es: ${precio}, el cambio es: ${cambioArray.toString()}`,
    );
  }
}
const total = await consola.question("Te pago con esto: ");
const precio = await consola.question("El precio es: ");

cajaRegistradoraDevolucion(total, precio);
consola.close();

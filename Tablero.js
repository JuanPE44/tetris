class Tablero {
  static FILAS = 20;
  static COLUMNAS = 10;
  static CUBO_LARGO = 30;

  constructor() {
    this.tablero = [];
    this.globalX = 4;
    this.globalY = 0;
    this.idFicha = 1;
    this.colorFichas = [];
    this.fichaActual = [];
    this.indexFicha = 3;
    this.indexRotacion = 0;
    this.posicionesFicha = [];
    this.pausa = true;
    this.perder = false;
    this.mover = false;
    this.puntaje = 0;
    this.velocidad = 500;
    this.loop;
  }

  crearTablero() {
    document.addEventListener("keydown", (e) => this.control(e));

    // colocamos el ancho y largo del canvas
    ctx.canvas.width = Tablero.COLUMNAS * Tablero.CUBO_LARGO;
    ctx.canvas.height = Tablero.FILAS * Tablero.CUBO_LARGO;
    // se crea la matriz del tablero
    for (let x = 0; x < Tablero.FILAS; x++) {
      this.tablero[x] = [];
    }
    // se rellena la matriz con 0
    for (let x = 0; x < Tablero.COLUMNAS; x++) {
      for (let y = 0; y < Tablero.FILAS; y++) {
        this.tablero[y][x] = 0;
      }
    }
    this.crearFicha();
    this.colocarFicha();
    this.pintarTablero();
    this.pintarMejorPuntaje();
  }

  pintarTablero() {
    for (let x = 0; x < Tablero.FILAS; x++) {
      for (let y = 0; y < Tablero.COLUMNAS; y++) {
        let numero = this.tablero[x][y];
        ctx.beginPath();
        ctx.fillStyle = this.obtenerColor(numero);
        ctx.fillRect(
          y * Tablero.CUBO_LARGO,
          x * Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO
        );
        // ctx.strokeStyle = `#${(((1 << 24) * (Math.random() + 1)) | 0)
        // .toString(16)
        // .substr(1)}`;
        ctx.strokeStyle = numero !== 0 ? this.obtenerColor(numero) : "#fff";
        ctx.strokeRect(
          y * Tablero.CUBO_LARGO,
          x * Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO
        );
      }
    }
  }

  manejarPausa() {
    this.pausa ? (this.pausa = false) : (this.pausa = true);
    this.pausa ? this.pausar() : this.jugar();
  }

  jugar() {
    document.querySelector(".pausa").innerHTML =
      '<i class="fa-solid fa-pause"></i>';
    this.mover = true;
    this.iniciarLoop();
  }

  pausar() {
    document.querySelector(".pausa").innerHTML =
      '<i class="fa-solid fa-play"></i>';
    this.mover = false;
    clearInterval(this.loop);
  }

  iniciarLoop() {
    this.loop = setInterval(() => {
      this.bajarFicha();
    }, this.velocidad);
  }

  obtenerColor(numero) {
    return numero === 0 ? "#c8c1c1" : this.colorFichas[numero - 1].color;
  }

  crearFicha() {
    const f = new Ficha();
    const ficha = f.crearFicha(this.idFicha);
    const color = `#${(((1 << 24) * (Math.random() + 1)) | 0)
      .toString(16)
      .substr(1)}`;
    this.colorFichas.push({ id: this.idFicha++, color: color });
    this.globalX = 4;
    this.globalY = 0;
    this.indexRotacion = 0;
    this.indexFicha >= 4 ? (this.indexFicha = 0) : this.indexFicha++;
    this.fichaActual = ficha[this.indexFicha];
    this.posicionesFicha = [];
  }

  bajarFicha() {
    this.descolocarFicha();
    this.globalY++;
    this.colocarFicha();
  }

  perdio() {
    this.crearFicha();
    const { posiciones } = this.obtenerPosiciones();
    this.pintarFicha(posiciones);
    clearInterval(this.loop);
    this.mover = false;    
  }

  actualizarPuntos() {
    let puntos = JSON.parse(localStorage.getItem("puntos"));
    puntos.push(this.puntaje);
    localStorage.setItem("puntos", JSON.stringify(puntos));
  }

  pintarMejorPuntaje() {
    let puntos = JSON.parse(localStorage.getItem("puntos"));
    let max = 0;
    puntos.forEach((p) => {
      if (p > max) {
        max = p;
      }
    });
    document.querySelector(".highscore").innerHTML = `HIGHSCORE ${max}`;
  }

  colocarFicha(direccion) {
    // si direccion es true izquierda, sino es derecha
    const { posiciones, adentroTablero } = this.obtenerPosiciones();
    let moverAbajo = this.sePuedeMoverAbajo(posiciones);
    let [moverIzquierda, moverDerecha] = this.sePuedeMoverCostados(
      this.posicionesFicha
    );
    const perdio = this.comprobarSiPerdio(posiciones, moverAbajo);

    // si existe direccion
    if (direccion !== undefined) {
      // si se mueve a la iquierda hay una ficha
      if (!direccion && !moverIzquierda) {
        this.globalX++;
        const { posiciones } = this.obtenerPosiciones();
        this.pintarFicha(posiciones);
        return;
      }
      // si se mueve a la derecha y hay una ficha
      if (direccion && !moverDerecha) {
        this.globalX--;
        const { posiciones } = this.obtenerPosiciones();
        this.pintarFicha(posiciones);
        return;
      }
    }

    if (perdio) {
      this.pintarFicha(posiciones);
      this.perdio();
    } else if (moverAbajo) {
      if (adentroTablero) {
        this.pintarFicha(posiciones);
        this.posicionesFicha = posiciones;
      } else {
        this.pintarFicha(this.posicionesFicha);
        this.globalX < 0 ? this.globalX++ : this.globalX--;
      }
    } else {
      this.pintarFicha(posiciones);
      this.crearFicha();
      this.globalY--;
      this.filaCompletada();
    }
  }

  moverFicha(direccion) {
    this.descolocarFicha();
    direccion ? this.globalX++ : this.globalX--;
    this.colocarFicha(direccion);
  }

  sePuedeMoverAbajo(posiciones) {
    let mover = true;
    posiciones.forEach((caja) => {
      if (
        caja.y >= Tablero.FILAS - 1 ||
        this.tablero[caja.y + 1][caja.x] !== 0
      ) {
        mover = false;
      }
    });
    return mover;
  }

  sePuedeMoverCostados(posiciones) {
    let moverIzquierda = true;
    let moverDerecha = true;
    posiciones.forEach((caja) => {
      if (caja.x + 1 < Tablero.COLUMNAS && caja.x - 1 >= 0) {
        if (this.tablero[caja.y][caja.x - 1] !== 0) {
          moverIzquierda = false;
        }
        if (this.tablero[caja.y][caja.x + 1] !== 0) {
          moverDerecha = false;
        }
      }
    });
    return [moverIzquierda, moverDerecha];
  }

  filaCompletada() {
    let contador = 0;
    for (let x = 0; x < Tablero.FILAS; x++) {
      for (let y = 0; y < Tablero.COLUMNAS; y++) {
        if (this.tablero[x][y] !== 0) {
          contador++;
        }
      }
      if (contador === Tablero.COLUMNAS) {
        this.pintarFila(x);
        this.eliminarFila(x);
        this.puntaje += 100;
        document.querySelector(".score").innerHTML = `SCORE ${this.puntaje}`;
        this.actualizarPuntos();
        this.pintarMejorPuntaje();
        if (this.velocidad > 80) {
          this.velocidad -= 4;
        }
        clearInterval(this.loop);
        this.iniciarLoop();
        console.log(this.puntaje);
      }
      contador = 0;
    }
  }

  eliminarFila(numFila) {
    let newTablero = this.tablero.filter((a, index) => index !== numFila);
    let newFila = [];
    for (let i = 0; i < Tablero.COLUMNAS; i++) {
      newFila.push(0);
    }
    this.tablero = newTablero;
    this.tablero.unshift(newFila);
  }

  pintarFila(x) {
    this.tablero[x].forEach((n, i) => {
      ctx.beginPath();
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(
        i * Tablero.CUBO_LARGO,
        x * Tablero.CUBO_LARGO,
        Tablero.CUBO_LARGO,
        Tablero.CUBO_LARGO
      );
    });
  }

  comprobarSiPerdio(posiciones, moverAbajo) {
    let perdio = false;
    posiciones.forEach((caja) => {
      if (caja.y <= 3 && !moverAbajo) {
        perdio = true;
        this.perder = true;
      }
    });
    return perdio;
  }

  rotarFicha() {
    this.descolocarFicha();
    this.indexRotacion >= 3 ? (this.indexRotacion = 0) : this.indexRotacion++;
    this.colocarFicha(); //
  }

  descolocarFicha() {
    this.posicionesFicha.forEach((caja) => {
      this.tablero[caja.y][caja.x] = 0;
    });
    this.pintarTablero();
  }

  pintarFicha(posiciones) {
    posiciones.forEach((caja) => {
      this.tablero[caja.y][caja.x] = caja.num;
    });
    this.pintarTablero();
  }

  obtenerPosiciones() {
    let fichaActual = this.fichaActual.rotaciones[this.indexRotacion];
    let posiciones = [];
    fichaActual.forEach((array, indexY) => {
      array.forEach((num, indexX) => {
        // si esta adentro del tablero
        if (
          indexX + this.globalX >= 0 &&
          indexX + this.globalX < Tablero.COLUMNAS &&
          indexY + this.globalY >= 0 &&
          indexY + this.globalY < Tablero.FILAS &&
          num !== 0
        ) {
          posiciones.push({
            y: indexY + this.globalY,
            x: indexX + this.globalX,
            num: num,
          });
        }
      });
    });
    return { posiciones: posiciones, adentroTablero: posiciones.length >= 4 };
  }

  control(e) {
    if (this.mover) {
      switch (e.keyCode) {
        case 37:
          this.moverFicha(false); // izquierda
          break;
        case 39:
          this.moverFicha(true); // derecha
          break;
        case 40:
          this.bajarFicha(); //abajo
          break;
        case 82:
          this.rotarFicha(); // R
          break;
      }
    }
    if (e.keyCode === 80) {
      this.manejarPausa();
    }
  }
}

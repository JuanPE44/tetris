const cargarSonido = (fuente, autoplay) => {
  const sonido = document.createElement("audio");
  sonido.src = fuente;
  sonido.setAttribute("preload", "auto");
  sonido.setAttribute("controls", "none");
  sonido.loop = autoplay;
  sonido.style.display = "none"; // <-- oculto
  document.body.appendChild(sonido);
  return sonido;
};
// const musicaTetris = cargarSonido('sonidos/cancionTetris.mp3', true);
// const moverAudio = cargarSonido('sonidos/mover.mp3');

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
    this.indexFichaAnterior = null;
    this.indexFicha = 0;
    this.indexRotacion = 0;
    this.posicionesFicha = [];
    this.pausa = true;
    this.perder = false;
    this.mover = false;
    this.puntaje = 0;
    this.velocidad = 800;
    this.loop;
  }

  crearTablero() {
    document.addEventListener("keydown", (e) => this.control(e.key, true));

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
        ctx.strokeStyle = "#fff";
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
    this.pausa ? this.pausarPartida() : this.reanudarPartida();
  }

  reanudarPartida() {
    document.querySelector(".pausa").innerHTML =
      '<i class="fa-solid fa-pause"></i>';
    this.mover = true;
    this.iniciarLoop();
    // musicaTetris.play()
  }

  pausarPartida() {
    document.querySelector(".pausa").innerHTML =
      '<i class="fa-solid fa-play"></i>';
    this.mover = false;
    clearInterval(this.loop);
    // musicaTetris.pause()
  }

  iniciarLoop() {
    this.loop = setInterval(() => {
      this.control("ArrowDown", false);
    }, this.velocidad);
  }

  obtenerColor(numero) {
    return numero === 0 ? "#c8c1c1" : this.colorFichas[numero - 1].color;
  }

  crearFicha() {
    const f = new Ficha();
    const ficha = f.crearFicha(this.idFicha);
    const numRandom = Math.floor(Math.random() * 6);
    this.globalX = 4;
    this.globalY = 0;
    this.indexRotacion = 0;
    this.indexFicha =
      this.indexFichaAnterior !== numRandom
        ? numRandom
        : this.indexFichaAnterior + 1;
    this.fichaActual = ficha[this.indexFicha];
    this.posicionesFicha = [];
    this.colorFichas.push({
      id: this.idFicha++,
      color: ficha[this.indexFicha].color,
    });
    this.indexFichaAnterior = this.indexFicha;
  }

  actualizarMejorPuntaje() {
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

  colocarFicha() {
    const posiciones = this.obtenerPosiciones();
    this.comprobarSiPerdio(posiciones);
    this.pintarFicha(posiciones);
    this.posicionesFicha = posiciones;
    // moverAudio.play()
  }

  sePuedeMoverAbajo(posiciones) {
    let mover = true;
    posiciones.forEach((caja) => {
      if (
        caja.y >= Tablero.FILAS - 1 ||
        (this.tablero[caja.y + 1][caja.x] !== 0 &&
          this.tablero[caja.y + 1][caja.x] !== caja.num)
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
      if (caja.x - 1 < 0) {
        moverIzquierda = false;
      } else if (caja.x + 1 >= Tablero.COLUMNAS) {
        moverDerecha = false;
      } else {
        // si esta adentro del tablero
        let anterior = this.tablero[caja.y][caja.x - 1];
        let siguiente = this.tablero[caja.y][caja.x + 1];

        if (anterior !== 0 && anterior !== caja.num) {
          moverIzquierda = false;
        }
        if (siguiente !== 0 && siguiente !== caja.num) {
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
        this.actualizarPuntaje(100);
        this.aumentarVelocidad();
      }
      contador = 0;
    }
  }

  aumentarVelocidad() {
    if (this.velocidad > 80) {
      this.velocidad -= 4;
    }
    clearInterval(this.loop);
    this.iniciarLoop();
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

  actualizarPuntaje(puntaje) {
    this.puntaje += puntaje;
    document.querySelector(".score").innerHTML = `SCORE ${this.puntaje}`;
    this.actualizarMejorPuntaje();
    this.pintarMejorPuntaje();
  }

  comprobarSiPerdio(posiciones) {
    let moverAbajo = this.sePuedeMoverAbajo(posiciones);
    posiciones.forEach((caja) => {
      if (caja.y <= 0 && !moverAbajo) {
        this.perder = true;
        this.perdio();
      }
    });
  }

  perdio() {
    this.crearFicha();
    clearInterval(this.loop);
    this.mover = false;
    this.pausarPartida();
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
        if (num !== 0) {
          posiciones.push({
            y: indexY + this.globalY,
            x: indexX + this.globalX,
            num: num,
          });
        }
      });
    });
    return posiciones;
  }

  control(key, precionarTecla) {
    let [moverIzquierda, moverDerecha] = this.sePuedeMoverCostados(
      this.posicionesFicha
    );
    let moverAbajo = this.sePuedeMoverAbajo(this.posicionesFicha);
    const adentroTablero = this.posicionesFicha.length >= 3;

    if (this.mover) {
      switch (key) {
        case "ArrowLeft":
          if (moverIzquierda && adentroTablero) {
            this.globalX--;
          } // izquierda
          break;
        case "ArrowRight":
          if (moverDerecha && adentroTablero) {
            this.globalX++;
          } //derecha
          break;
        case "ArrowDown": // abajo
          if (moverAbajo) {
            this.globalY++;
            if (precionarTecla) {
              this.actualizarPuntaje(1);
            }
          } else {
            this.crearFicha();
            this.filaCompletada();
          }
          break;
        case ",":
          this.indexRotacion <= 0
            ? (this.indexRotacion = 3)
            : this.indexRotacion--; // ,
          break;
        case ".":
          this.indexRotacion >= 3
            ? (this.indexRotacion = 0)
            : this.indexRotacion++; // .
          break;
      }
      this.descolocarFicha();
      this.colocarFicha();
    }
    if (key === "p" && !this.perder) {
      this.manejarPausa();
    }
  }
}

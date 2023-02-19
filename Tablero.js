class Tablero {
  static FILAS = 20;
  static COLUMNAS = 10;
  static CUBO_LARGO = 30;
  static VELOCIDAD = 300;

  constructor() {
    this.tablero = [];
    this.globalX = 4;
    this.globalY = 0;
    this.fichaActual = [];
    this.indexFicha = 3;
    this.indexRotacion = 0;
    this.posicionesFicha = [];
    this.direccion = false;
    this.perder = false;
    this.loop = setInterval(() => {
      this.bajarFicha();
    }, Tablero.VELOCIDAD);
  }

  crearTablero() {
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
    this.pintarTablero();
  }

  pintarTablero() {


    for (let x = 0; x < Tablero.FILAS; x++) {
      for (let y = 0; y < Tablero.COLUMNAS; y++) {
        ctx.beginPath();
        ctx.fillStyle = this.obtenerColor(this.tablero[x][y])
        ctx.fillRect(
          y * Tablero.CUBO_LARGO,
          x * Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO
        );
        ctx.strokeStyle = `#${((1<<24)*(Math.random()+1)|0).toString(16).substr(1)}44`
        ctx.strokeRect(
          y * Tablero.CUBO_LARGO,
          x * Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO,
          Tablero.CUBO_LARGO
        );
        
      }
    }
  }

  obtenerColor(numero) {
    return numero === 0 ? '#111' : '#fff';         
  }

  iniciar() {
    document.addEventListener("keydown", (e) => this.control(e));
    this.crearFicha();
    this.colocarFicha();
    this.loop;
  }

  crearFicha() {
    const f = new Ficha();
    const ficha = f.crearFicha(); 
    this.globalX = 4;
    this.globalY = 0;
    this.indexRotacion = 0;
    this.indexFicha >= 4 ? this.indexFicha = 0 : this.indexFicha++;
    this.fichaActual = ficha[this.indexFicha];
    this.posicionesFicha = [];
  }

  bajarFicha() {
    this.descolocarFicha();
    this.globalY++;
    this.colocarFicha();
  }

  perdio() {
    this.crearFicha() 
    const {posiciones} = this.obtenerPosiciones();
    this.pintarFicha(posiciones)  
    clearInterval(this.loop)
  }
  
  colocarFicha() {
    const {posiciones, adentroTablero} = this.obtenerPosiciones();
    let moverAbajo = this.sePuedeMoverAbajo(posiciones);
    let [moverIzquierda, moverDerecha] = this.sePuedeMoverCostados(posiciones);
    const perdio = this.comprobarSiPerdio(posiciones, moverAbajo);
    
    if(perdio) {
      this.pintarFicha(posiciones);
      this.perdio();      
    } else if(moverAbajo) {
      if (adentroTablero) {
        this.pintarFicha(posiciones)
        this.posicionesFicha = posiciones
      } else {
        this.pintarFicha(this.posicionesFicha)
        this.globalX < 0 ? this.globalX++ : this.globalX--;
      }   
    } else {
      this.pintarFicha(posiciones);
      this.crearFicha();
      this.globalY--;
    }
    this.filaCompletada()
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
    fichaActual.forEach( (array, indexY) => {
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
    return {posiciones:posiciones,adentroTablero: posiciones.length >=4};
  }

  descolocarFicha() {
    this.posicionesFicha.forEach((caja) => {
      this.tablero[caja.y][caja.x] = 0;
    });
    this.pintarTablero();
  }

  control(e) {
    switch (e.keyCode) {
      case 37: this.moverFicha(false); // izquierda
      break;
      case 39: this.moverFicha(true); // derecha
      break;
      case 40: this.bajarFicha(); //abajo
      break;
      case 82: this.rotarFicha(); // R        
      break;
    }
  }

  comprobarSiPerdio(posiciones, moverAbajo) {
    let perdio = false;
    posiciones.forEach(caja => {
      if (caja.y<=3 && !moverAbajo) {
        perdio = true; 
        this.perder = true                     
      }
    })
    return perdio;
  }

  sePuedeMoverAbajo(posiciones) {
    let mover = true;
    posiciones.forEach(caja => {
      if(caja.y >= 19 || this.tablero[caja.y+1][caja.x] !== 0) {             
        mover = false;
      }          
    })
    return mover;
  }

  sePuedeMoverCostados(posiciones) {
    let moverIzquierda = true;
    let moverDerecha = true;
    posiciones.forEach(caja => {
      if(caja.x+1 < Tablero.COLUMNAS && caja.x-1 >= 0) {
        if(this.tablero[caja.y][caja.x-1] !== 0) {
          moverIzquierda = false
        }
        if(this.tablero[caja.y][caja.x+1] !== 0) {   
          moverDerecha = false;
        }
      }       
    })
    return [moverIzquierda,moverDerecha];
  }

  filaCompletada() {
    let contador=0;
    for (let x = 0; x < Tablero.FILAS; x++) {
      for (let y = 0; y < Tablero.COLUMNAS; y++) {
        if(this.tablero[x][y] !== 0){
          contador++;
        }
      }
      if(contador===Tablero.COLUMNAS) {
        this.eliminarFila(x)
        break;
      } 
      contador = 0;
    }
  }

  eliminarFila(numFila) {
    this.tablero.slice(0, numFila);
    let newFila = []
    for (let i = 0; i < Tablero.COLUMNAS; i++) {
      newFila.push(0);
    }
    this.tablero.unshift(newFila);
  }

  moverFicha(direccion) {
    this.direccion = direccion;
    this.descolocarFicha();
    direccion ?  this.globalX++ : this.globalX-- ;
    // si direccion es true izquierda, sino es derecha
    this.colocarFicha();
  }


  rotarFicha() {
    this.descolocarFicha();
    this.indexRotacion >= 3 ? this.indexRotacion = 0 : this.indexRotacion++;
    this.colocarFicha(); //
  }
}
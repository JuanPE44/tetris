

const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

if(localStorage.getItem('puntos') === null) {
  let puntos = [];
  localStorage.setItem('puntos', JSON.stringify(puntos));
} 
const t = new Tablero();

document.querySelector('.pausa').addEventListener('click', ()=> t.manejarPausa())
document.querySelector('.move-izquierda').addEventListener('click',()=> t.moverFicha(false))
document.querySelector('.move-derecha').addEventListener('click',()=> t.moverFicha(true))
document.querySelector('.move-abajo').addEventListener('click',()=> t.bajarFicha())
document.querySelector('.rotar').addEventListener('click',()=> t.rotarFicha())
document.querySelector('.reiniciar').addEventListener('click',()=> location.reload())

t.crearTablero()

// <i class="fa-solid fa-pause"></i>
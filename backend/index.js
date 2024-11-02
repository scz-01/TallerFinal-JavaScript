const express = require("express");
const app = express();
const cors = require("cors");
const mongoose =  require("mongoose");
require("dotenv").config();

// Midleware
app.use(express.json());
app.use(cors());

// conexion a mongoDB
const mongoUri = process.env.MONGODB_URI;

try{
  mongoose.connect(mongoUri);
  console.log("Conectados a mongoDB");
}catch(error){
  console.error("Error de conexion",error);
}

const libroSchema = new mongoose.Schema({
  titulo: String,
  autor: String
});

const Libro = mongoose.model("Libro", libroSchema);

// Rutas de la API

// Traer o mostrar el listado de todos los libros
app.get("/libros", async (req,res) => {
  try {
    const libro = await Libro.find();
    res.json(libro)
  } catch (error) {
    res.status(500).send("Error al obtener los libros")
  }
})


// Token para autorizacion 
app.use((req,res,next) => {
  const authToken = req.headers["authorization"];
  if(authToken === "miTokenSecreto123"){
    next();
  }else{
    res.status(401).send("Acceso no autorizado")
  }
});


// Crear un nuevo libro
app.post("/libros", async(req, res) => {
  const libro = new Libro({
    titulo: req.body.titulo,
    autor: req.body.autor
  });

  try {
    await libro.save();
    res.json(libro);

  } catch (error) {
    res.status(500).send("Error al guardar el libro");
  }

});


// Traer un libro por ID
app.get("/libros/:id", async(req, res) => {
  try {
    const id = req.params.id;
    const libro = await Libro.findById(id);
    
    if(libro){
      res.json(libro)
    }else{
      res.status(404).send("Libro no encontrado");
    }

  } catch (error) {
    res.status(500).send("Error al buscar el libro")
  }
});


// Ruta para actualizar un libro - findbyidandupdate
app.put("/libros/:id", async (req, res) => {
  try {
    const idLibro = req.params.id;
    const libroActualizado = await Libro.findByIdAndUpdate(
      idLibro, 
      {titulo: req.body.titulo, 
        autor: req.body.autor
    }, {new:true});

    if (libroActualizado) {
      res.json(libroActualizado)
    } else {
      res.sendStatus(404).send("Libro no encontrado")
    }  
  
  } catch (error) {
    res.status(500).send("Error al actualizar el libro")
  }

});


// Ruta para eliminar un libro
app.delete("/libros/:id", async(req,res) => {
  try {
    const id_libro = req.params.id;
    const libro = await Libro.findByIdAndDelete(id_libro);

    if (libro) {
      res.json(libro);
    } else {
      res.status(500).send("Error al eliminar el libro");
    }
  } catch (error) {
    res.status(500).send("Error en el proceso de borrado");
  }
});

app.listen(3000, () => {
  console.log("Servidor ejecutandose en http://localhost:3000");
});
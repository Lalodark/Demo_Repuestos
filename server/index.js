const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;
const repuestos = require('./repuestos.json');

app.use(cors());
app.use(bodyParser.json());

app.post('/api/query', (req, res) => {
  const { message } = req.body;

  const match = message.match(/necesito (.*?) para .*?chasis (.*)/i);
  if (!match) return res.json({ text: 'No pude entender tu mensaje.' });

  const [_, nombreRepuesto, chasis] = match;

  const resultado = repuestos.find(r =>
    r.nombre.toLowerCase().includes(nombreRepuesto.toLowerCase()) &&
    r.chasis.toLowerCase() === chasis.toLowerCase()
  );

  if (!resultado) {
    return res.json({
      text: 'No encontré el repuesto solicitado para ese chasis.',
      numero_parte: null,
      precio: null,
      imagen_url: null,
      seguimiento: null
    });
  }

  return res.json({
    text: `Encontré el repuesto que buscás.`,
    numero_parte: resultado.numero_parte,
    precio: resultado.precio,
    imagen_url: resultado.imagen_url,
    seguimiento: "¿Este es el repuesto que buscabas? ¿Querés que lo agregue al carrito?"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
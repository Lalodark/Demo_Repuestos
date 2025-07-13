import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [lastFoundItem, setLastFoundItem] = useState(null);
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);
  const [esperandoOtraBusqueda, setEsperandoOtraBusqueda] = useState(false);

  useEffect(() => {
    const welcomeMsg = {
      sender: 'bot',
      text: '¡Hola! Soy tu asistente de repuestos.\n\nEscribí qué repuesto necesitás y el número de chasis del auto.\n\nEjemplo:\n"Necesito parrilla de suspensión delantera para auto con chasis 9BWAG4126FT599135"',
    };
    setMessages([welcomeMsg]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setWaiting(true);

    const res = await axios.post('http://localhost:3001/api/query', { message: input });
    //const res = await axios.post('/api/query', { message: input });

    setTimeout(() => {
      const botMsg = {
        sender: 'bot',
        text: res.data.text,
        numero_parte: res.data.numero_parte,
        precio: res.data.precio,
        imagen_url: res.data.imagen_url
      };

      const seguimientoMsg = res.data.seguimiento
        ? { sender: 'bot', text: res.data.seguimiento }
        : null;

      setMessages(prev => [...prev, botMsg, ...(seguimientoMsg ? [seguimientoMsg] : [])]);
      setLastFoundItem(botMsg);
      if (res.data.seguimiento) {
        setEsperandoConfirmacion(true);
      }
      setWaiting(false);
    }, 1000);
  };

  const handleConfirmacion = (respuesta) => {
    const userResp = { sender: 'user', text: respuesta === 'si' ? 'Sí' : 'No' };
    setMessages(prev => [...prev, userResp]);
    if (respuesta === 'si' && lastFoundItem) {
      setCarrito(prev => [...prev, lastFoundItem]);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Repuesto agregado al carrito. ¿Querés buscar otro repuesto?' }]);
    } else {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Entendido. ¿Querés buscar otro repuesto?' }]);
    }
    setEsperandoConfirmacion(false);
    setEsperandoOtraBusqueda(true);
  };

  const handleOtraBusqueda = (respuesta) => {
    const userResp = { sender: 'user', text: respuesta === 'si' ? 'Sí' : 'No' };
    setMessages(prev => [...prev, userResp]);
    if (respuesta === 'si') {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Perfecto, escribí el próximo repuesto y chasis.' }]);
    } else {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Gracias por usar el chat. ¡Hasta la próxima!' }]);
    }
    setEsperandoOtraBusqueda(false);
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">🛠️ Chat de Repuestos</h2>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
            <p>{msg.text}</p>
            {msg.numero_parte && <p><strong>N° Parte:</strong> {msg.numero_parte}</p>}
            {msg.precio && <p><strong>Precio:</strong> ${msg.precio}</p>}
            {msg.imagen_url && <img src={msg.imagen_url} alt="repuesto" />}
          </div>
        ))}

        {waiting && (
          <div className="message-bubble bot">
            <p><em>Escribiendo...</em></p>
          </div>
        )}

        {esperandoConfirmacion && (
          <div className="options-container">
            <button onClick={() => handleConfirmacion('si')}>Sí</button>
            <button onClick={() => handleConfirmacion('no')}>No</button>
          </div>
        )}

        {esperandoOtraBusqueda && (
          <div className="options-container">
            <button onClick={() => handleOtraBusqueda('si')}>Sí</button>
            <button onClick={() => handleOtraBusqueda('no')}>No</button>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          disabled={waiting || esperandoConfirmacion || esperandoOtraBusqueda}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Escribí tu consulta..."
        />
        <button
          onClick={sendMessage}
          disabled={waiting || esperandoConfirmacion || esperandoOtraBusqueda}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default App;

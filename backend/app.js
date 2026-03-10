const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Conexão com Banco de Dados
const conn = require("./database/conn");
conn();

// 2. Importar MQTT e Controller
const client = require("./services/mqttClient");
const sensorController = require("./controllers/SensorControllers");

// --- OUVINTE MQTT ---
// Quando o Mosquitto mandar mensagem, passamos para o Controller resolver
client.on('message', (topic, message) => {
    sensorController.processarMensagemMQTT(topic, message);
});

// 3. Rotas HTTP (Para o Site)
const routes = require("./routes/router");
app.use("/api", routes);

const port = 3000;

app.listen(port, function(){
    console.log("🚀 Servidor MVC + MQTT Online na porta 3000!");
});
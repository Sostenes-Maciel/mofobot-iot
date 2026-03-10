const mqtt = require('mqtt');

// Conecta ao Broker (igual ao seu código antigo)
const brokerUrl = "mqtt://test.mosquitto.org";
const client = mqtt.connect(brokerUrl);

const topicos = [
    "sensor_mofo/umidadeatual",
    "sensor_mofo/gasesatual",
    "sensor_mofo/alertasituacao"
];

client.on('connect', () => {
    console.log("✅ Conectado ao Broker MQTT!");
    client.subscribe(topicos, () => {
        console.log("📡 Ouvindo: Umidade, Gases e Alertas do MofoBot...");
    });
});

module.exports = client;
const SensorData = require("../models/SensorData");
const client = require("../services/mqttClient"); // Importa o MQTT

const sensorController = {
    
    // --- 1. LÓGICA DO SENSOR (MQTT) ---
    // Essa função é chamada automaticamente quando chega mensagem do MQTT
    processarMensagemMQTT: async (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            let valor = 0;
            let tipo = "";

            // Lógica original do seu código antigo
            if (topic === "sensor_mofo/umidadeatual") {
                tipo = "humidade";
                valor = data.umidade;
            } 
            else if (topic === "sensor_mofo/gasesatual") {
                tipo = "gas";
                valor = data.mq135_raw; // Mantivemos o nome original do seu sensor
            } 
            else if (topic === "sensor_mofo/alertasituacao") {
                console.log(`📢 STATUS ALERTA: ${data.status}`);
                return; 
            }

            if (tipo !== "") {
                const novoDado = { 
                    tipo: tipo, 
                    valor: valor,
                    localizacao: "Quarto" // Localização fixa conforme seu código antigo
                };

                await SensorData.create(novoDado);
                console.log(`[MQTT] Salvo: ${tipo.toUpperCase()} = ${valor}`);
            }

        } catch (error) {
            console.error("❌ Erro ao processar mensagem MQTT:", error);
        }
    },

    // --- 2. ROTAS DO SITE (HTTP) ---

    // Busca dados para o Gráfico
    getAll: async (req, res) => {
        try {
            const dados = await SensorData.find().sort({ timestamp: -1 }).limit(50);
            res.json(dados);
        } catch (error) {
            res.status(500).json({ msg: "Erro ao buscar dados." });
        }
    },

    // Envia configuração do Slider para o ESP32 via MQTT
    updateConfig: async (req, res) => {
        try {
            const { tipo, valor } = req.body;
            let topico = "";

            if (tipo === 'umidade') topico = "sensor_mofo/limiar_umidade";
            else if (tipo === 'gas') topico = "sensor_mofo/limiar_gases";

            if (topico !== "") {
                // Publica no MQTT igual ao seu código antigo
                client.publish(topico, valor.toString(), { qos: 1 }, () => {
                    console.log(`📤 [CONFIG] Enviado para ESP32: ${tipo} = ${valor}`);
                    res.json({ msg: "Configuração enviada com sucesso!" });
                });
            } else {
                res.status(400).json({ msg: "Tipo inválido" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Erro na configuração." });
        }
    }
};

module.exports = sensorController;
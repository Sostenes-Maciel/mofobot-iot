const mongoose = require('mongoose');

// Definimos a estrutura dos dados que o MofoBot vai guardar
const sensorSchema = new mongoose.Schema({
    tipo: { type: String, required: true }, // "temperatura", "humidade" ou "gas"
    valor: { type: Number, required: true },
    localizacao: { type: String, default: 'Quarto' },
    timestamp: { type: Date, default: Date.now } // Guarda automaticamente a hora da leitura
});

// Criamos o modelo baseado no Schema
const SensorData = mongoose.model('SensorData', sensorSchema);

module.exports = SensorData;
const mongoose = require("mongoose");

const { Schema } = mongoose;

const sensorSchema = new Schema({
    tipo: { type: String, required: true }, // 'humidade' ou 'gas'
    valor: { type: Number, required: true },
    localizacao: { type: String, required: true }, // 'Quarto', 'Sala', etc.
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const SensorData = mongoose.model("SensorData", sensorSchema);

module.exports = SensorData;
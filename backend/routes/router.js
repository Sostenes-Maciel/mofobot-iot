const router = require("express").Router();

// Importamos o controlador que acabamos de criar
const sensorController = require("../controllers/SensorControllers");

// Rota para salvar leitura do sensor
router.post("/dados", (req, res) => sensorController.create(req, res));

// Rota para o frontend buscar o histórico
router.get("/dados", (req, res) => sensorController.getAll(req, res));

// Rota para salvar configurações dos sliders
router.post("/config", (req, res) => sensorController.updateConfig(req, res));

module.exports = router;
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

// Probes e telemetria
app.get('/healthz', (req, res) => res.status(200).json({ status: 'healthy', service: 'estoque-service' }));
app.get('/metrics', (req, res) => res.type('text/plain').send('estoque_consultas_total 85\n'));

// Consulta de estoque
app.get('/estoque', (req, res) => {
  res.json({ item: 'Camiseta Tech', quantidade_disponivel: 150, status: 'DISPONIVEL' });
});

app.listen(PORT, () => console.log(`[Estoque Service] Rodando na porta ${PORT}`));
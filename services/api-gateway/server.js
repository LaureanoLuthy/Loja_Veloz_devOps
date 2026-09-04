const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const PEDIDOS_URL = process.env.PEDIDOS_URL || 'http://pedidos-service:3001';

// Rotas operacionais (probes e observabilidade)
app.get('/healthz', (req, res) => res.status(200).json({ status: 'healthy', service: 'api-gateway' }));
app.get('/metrics', (req, res) => res.type('text/plain').send('# HELP http_requests_total Total requests\nhttp_requests_total{app="gateway"} 100\n'));

// Roteamento para o servico de pedidos
app.use('/api/pedidos', createProxyMiddleware({ target: PEDIDOS_URL, changeOrigin: true }));

app.listen(PORT, () => console.log(`[API Gateway] Rodando na porta ${PORT}`));
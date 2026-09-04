const express = require('express');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 3002;
const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

async function processarEventos() {
  try {
    const conn = await amqp.connect(RABBIT_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue('pedidos_criados', { durable: true });
    
    console.log('[Pagamentos] Conectado e aguardando eventos...');
    channel.consume('pedidos_criados', (msg) => {
      if (msg !== null) {
        const pedido = JSON.parse(msg.content.toString());
        console.log(`[Pagamentos] Pedido #${pedido.id} aprovado com sucesso! Valor: R$ ${pedido.valor}`);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.log('[Pagamentos] Tentando conectar ao RabbitMQ em 5s...');
    setTimeout(processarEventos, 5000);
  }
}
processarEventos();

// Probes e telemetria
app.get('/healthz', (req, res) => res.status(200).json({ status: 'healthy', service: 'pagamentos-service' }));
app.get('/metrics', (req, res) => res.type('text/plain').send('pagamentos_processados_total 12\n'));

app.listen(PORT, () => console.log(`[Pagamentos Service] Rodando na porta ${PORT}`));
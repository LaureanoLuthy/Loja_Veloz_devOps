const express = require('express');
const amqp = require('amqplib');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:velozpassword123@postgres:5432/pedidos_db';

const pool = new Pool({ connectionString: DB_URL });
let rabbitChannel = null;

// Conexao com RabbitMQ resiliente
async function connectRabbit() {
  try {
    const conn = await amqp.connect(RABBIT_URL);
    rabbitChannel = await conn.createChannel();
    await rabbitChannel.assertQueue('pedidos_criados', { durable: true });
    console.log('[Pedidos] Conectado ao RabbitMQ');
  } catch (err) {
    console.log('[Pedidos] Aguardando RabbitMQ... tentando novamente em 5s');
    setTimeout(connectRabbit, 5000);
  }
}
connectRabbit();

// Rotas operacionais
app.get('/healthz', (req, res) => res.status(200).json({ status: 'healthy', service: 'pedidos-service' }));
app.get('/metrics', (req, res) => res.type('text/plain').send('# HELP pedidos_total Total pedidos\npedidos_total 42\n'));

// Criar Pedido
app.post(['/', '/api/pedidos'], async (req, res) => {
  const { cliente, item, valor } = req.body || { cliente: 'Cliente Padrao', item: 'Produto X', valor: 99.90 };
  try {
    const dbRes = await pool.query(
      'INSERT INTO pedidos(cliente, item, valor, status) VALUES($1, $2, $3, $4) RETURNING *',
      [cliente, item, valor, 'CRIADO']
    );
    const pedido = dbRes.rows[0];

    if (rabbitChannel) {
      rabbitChannel.sendToQueue('pedidos_criados', Buffer.from(JSON.stringify(pedido)), { persistent: true });
    }

    return res.status(201).json({ mensagem: 'Pedido criado com sucesso!', pedido });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Falha ao processar pedido' });
  }
});

// Listar Pedidos
app.get(['/', '/api/pedidos'], async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT * FROM pedidos ORDER BY id DESC LIMIT 10');
    return res.status(200).json(dbRes.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Falha ao buscar pedidos' });
  }
});

app.listen(PORT, () => console.log(`[Pedidos Service] Rodando na porta ${PORT}`));
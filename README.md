# Loja Veloz - Plataforma de Microsservicos & Cloud DevOps

Projeto de microsservicos aplicando conteinerizacao com Docker, orquestracao com Kubernetes e automacao de CI/CD com GitHub Actions.

## Arquitetura do Sistema
* **API Gateway (:3000):** Proxy reverso e roteamento.
* **Servico de Pedidos (:3001):** Persistencia no PostgreSQL e emissao de eventos no RabbitMQ.
* **Servico de Pagamentos (:3002):** Consumidor assincrono de eventos.
* **Servico de Estoque (:3003):** Gerenciamento de catalogo e estoque.
* **PostgreSQL (:5432):** Banco relacional transacional.
* **RabbitMQ (:5672 / :15672):** Message broker orientado a eventos.

## Tecnologias e DevOps
* **Docker Multi-Stage:** Imagens enxutas em Alpine Linux rodando com usuario nao-root.
* **Kubernetes (K8s):** Namespaces, Secrets, ConfigMaps, Deployments multi-replicas, Probes (/healthz) e Resource Limits.
* **CI/CD:** Pipeline automatizado com GitHub Actions validando manifestos e gerando builds paralelos.

## Como Executar Localmente
```bash
docker compose up --build -d
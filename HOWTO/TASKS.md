# Swift Delivery — Tasks de Sprint

---

## BANCO DE DADOS

---

### [DB-01] Criar estrutura do banco de dados

Descrição: Criar o banco SQL Server com todas as tabelas necessárias para o sistema, incluindo índices e constraints de integridade referencial.

Critérios de aceite:
- Tabelas criadas: usuarios, clientes, motoristas, lojas, produtos, pedidos, itens_pedido, cupons
- Chaves primárias e estrangeiras configuradas corretamente
- Script de criação versionado no repositório

---

### [DB-02] Criar seed de dados iniciais

Descrição: Popular o banco com os dados mockados necessários para o demo: 3 clientes, 5 motoristas, 3 lojas com seus produtos e cupons de exemplo.

Critérios de aceite:
- 3 clientes cadastrados com niveis de fidelidade diferentes (Bronze, Prata, Ouro), cada um com 1 endereço com coordenadas fixas
- 5 motoristas cadastrados com status DISPONIVEL
- 3 lojas cadastradas (Confeitaria, Pizzaria, Hamburgueria) com coordenadas fixas e 5 ou 6 produtos cada
- Pelo menos 3 cupons cadastrados com tipos diferentes (PERCENTUAL, VALOR_FIXO, FRETE_GRATIS)
- Script de seed versionado no repositório e executável de forma isolada

---

### [DB-03] Configurar conexão com SQL Server no projeto

Descrição: Configurar a string de conexão e o cliente de banco no projeto TypeScript, com suporte a variáveis de ambiente.

Critérios de aceite:
- Conexão com SQL Server funcionando localmente
- String de conexão lida via variável de ambiente (.env)
- Arquivo .env.example commitado no repositório
- .env no .gitignore

---

## BACKEND

---

### [BE-01] Modelar classe abstrata Usuario

Descrição: Implementar a classe abstrata Usuario com os atributos e métodos base que Cliente e Motorista vão herdar.

Critérios de aceite:
- Classe abstrata com id, nome, email e senha
- Nao pode ser instanciada diretamente

---

### [BE-02] Modelar classe Cliente

Descrição: Implementar a classe Cliente herdando de Usuario, com logica de fidelidade e desconto.

Critérios de aceite:
- Herda de Usuario
- Possui endereco, historicoPedidos e pontosFidelidade
- Método calcularNivelFidelidade() retorna Bronze, Prata, Ouro ou Diamante conforme os pontos
- Método acumularPontos(valorFinal) adiciona pontos corretamente (1 ponto a cada R$ 1,00)

---

### [BE-03] Modelar classe Motorista

Descrição: Implementar a classe Motorista herdando de Usuario, com controle de disponibilidade.

Critérios de aceite:
- Herda de Usuario
- Possui veiculo e status (DISPONIVEL | OCUPADO)
- Método aceitarEntrega() muda status para OCUPADO e lança erro se já estiver OCUPADO
- Método confirmarEntrega() muda status para DISPONIVEL

---

### [BE-04] Modelar entidade Loja

Descrição: Implementar a entidade Loja como classe independente, sem herança de Usuario.

Critérios de aceite:
- Possui id, nome, endereco, distanciaKm e cardapio (Produto[])
- Método calcularFrete() retorna o valor correto por faixa de distancia
- Método calcularTempoEstimado() retorna o tempo estimado em minutos
- Lança erro se distancia for acima de 12 km

---

### [BE-05] Modelar entidade Produto

Descrição: Implementar a entidade Produto com os atributos necessários.

Critérios de aceite:
- Possui id, nome, descricao, preco e referencia à loja
- Sem herança ou subclasses (produto generico para qualquer tipo de loja)

---

### [BE-06] Modelar entidade Cupom

Descrição: Implementar a entidade Cupom com os tipos e regras de validação.

Critérios de aceite:
- Possui codigo, tipo (PERCENTUAL | VALOR_FIXO | FRETE_GRATIS), valor e dataExpiracao
- Método validar() lança erro se cupom estiver expirado ou inativo
- Método aplicar(subtotal, taxaEntrega) retorna o valor do desconto calculado

---

### [BE-07] Modelar entidade ItemPedido

Descrição: Implementar a entidade ItemPedido como composição do Pedido.

Critérios de aceite:
- Possui produto, quantidade e precoUnitario (snapshot do preco no momento do pedido)
- Método calcularSubtotal() retorna quantidade x precoUnitario

---

### [BE-08] Modelar entidade Pedido e maquina de estados

Descrição: Implementar a entidade Pedido com o ciclo de vida completo e todas as regras de transicao de status.

Critérios de aceite:
- Possui cliente, loja, motorista (opcional), itens, cupom (opcional), status, taxaEntrega, desconto e total
- Método avancarStatus() respeita a sequencia: AGUARDANDO_ACEITE > EM_PREPARO > AGUARDANDO_MOTORISTA > A_CAMINHO > ENTREGUE
- Lança erro ao tentar pular um status
- Ao avançar para A_CAMINHO, um motorista disponível é escolhido automaticamente (aleatório) e atribuído ao pedido
- Método cancelar() funciona apenas em AGUARDANDO_ACEITE e lança erro nos demais
- Método calcularTotal() aplica a logica correta: subtotal, desconto do cupom (se aplicado), frete
- Ao confirmar entrega (motorista), status vai para ENTREGUE, pontos são creditados no cliente e motorista é liberado

---

### [BE-08b] Integrar API OpenRouteService para cálculo de distância

Descrição: Implementar o serviço que consulta a API do OpenRouteService para obter a distância real de percurso entre dois pontos (loja e endereço do cliente).

Critérios de aceite:
- Serviço recebe duas coordenadas (lat/lng de origem e destino) e retorna a distância em km e a geometria da rota (polyline GeoJSON)
- Chave de API lida via variável de ambiente (ORS_API_KEY no .env)
- Lança erro se a API retornar falha ou distância acima de 12 km
- Distância usada na criação do pedido para determinar a taxa de entrega
- Geometria retornada ao frontend para renderização no mapa Leaflet

---

### [BE-09] Implementar repositórios

Descrição: Implementar os repositórios de acesso ao banco para cada entidade principal.

Critérios de aceite:
- Repositórios para Usuario, Cliente, Motorista, Loja, Produto, Pedido e Cupom
- Métodos basicos: findById, findAll, save, update
- Repositório de Motorista tem método findAllDisponiveis()
- Repositório de Pedido tem método findByCliente() e findByLoja()

---

### [BE-10] Implementar endpoints da API REST

Descrição: Expor os endpoints necessários para o frontend consumir.

Critérios de aceite:
- POST /pedidos — criar pedido
- PATCH /pedidos/:id/status — avançar status
- PATCH /pedidos/:id/cancelar — cancelar pedido
- GET /pedidos/:id — buscar pedido por id
- GET /lojas — listar lojas
- GET /lojas/:id/produtos — listar produtos de uma loja
- GET /clientes/:id — buscar cliente com nivel de fidelidade
- GET /motoristas/disponiveis — listar motoristas disponíveis
- POST /pedidos/:id/confirmar-entrega — motorista confirma entrega, status vai para ENTREGUE
- GET /pedidos/:id/rota — retorna geometria da rota (GeoJSON) para exibir no mapa

---

## TESTES

---

### [TS-01] Testes da maquina de estados do Pedido

Descrição: Cobrir todas as transições de status e regras de cancelamento com testes automatizados.

Critérios de aceite:
- Testa transição válida em cada etapa
- Testa erro ao tentar pular status
- Testa cancelamento em AGUARDANDO_ACEITE (deve funcionar)
- Testa cancelamento em EM_PREPARO (deve lançar erro)
- Testa cancelamento em A_CAMINHO (deve lançar erro)

---

### [TS-02] Testes de cálculo do total do Pedido

Descrição: Cobrir todos os cenários de cálculo de total com desconto e frete.

Critérios de aceite:
- Testa pedido sem cupom e sem fidelidade
- Testa pedido com cupom PERCENTUAL
- Testa pedido com cupom VALOR_FIXO
- Testa pedido com cupom FRETE_GRATIS
- Testa que total nunca fica abaixo de R$ 1,00

---

### [TS-03] Testes de validação de Cupom

Descrição: Cobrir os cenários de erro na aplicação de cupons.

Critérios de aceite:
- Testa cupom expirado (deve lançar erro)
- Testa cupom com valor minimo nao atingido (deve lançar erro)
- Testa cupom FRETE_GRATIS zerando o frete corretamente

---

### [TS-04] Testes de fidelidade do Cliente

Descrição: Cobrir a logica de acumulo de pontos e classificação por nivel.

Critérios de aceite:
- Testa acumulo correto de pontos apos pedido ENTREGUE
- Testa que pedido cancelado nao acumula pontos
- Testa classificação Bronze (0-199 pontos)
- Testa classificação Prata (200-499 pontos)
- Testa classificação Ouro (500-999 pontos)
- Testa classificação Diamante (1000+ pontos)

---

### [TS-05] Testes de disponibilidade do Motorista

Descrição: Cobrir as regras de disponibilidade do motorista.

Critérios de aceite:
- Testa que motorista OCUPADO nao pode aceitar nova entrega (deve lançar erro)
- Testa que motorista volta para DISPONIVEL apos confirmar entrega
- Testa que motorista DISPONIVEL aceita entrega corretamente

---

### [TS-06] Testes de frete da Loja

Descrição: Cobrir o cálculo de frete por faixa de distância.

Critérios de aceite:
- Testa frete de R$ 5,00 para distancia até 3 km
- Testa frete de R$ 10,00 para distancia entre 3 e 7 km
- Testa frete de R$ 15,00 para distancia entre 7 e 12 km
- Testa erro para distancia acima de 12 km

---

## FRONTEND

---

### [FE-01] Criar estrutura base do frontend

Descrição: Configurar o projeto frontend com as duas abas principais: visao do cliente e visao da loja.

Critérios de aceite:
- Página unica com três abas funcionais: Cliente, Loja e Motorista
- Navegação entre abas sem recarregar a página
- Layout responsivo basico

---

### [FE-02] Aba do Cliente: selecionar cliente e ver lojas

Descrição: Implementar a tela inicial da aba do cliente com seleção de cliente e listagem de lojas.

Critérios de aceite:
- Dropdown para selecionar um dos 3 clientes cadastrados
- Exibe nivel de fidelidade e pontos do cliente selecionado
- Lista as 3 lojas disponiveis com nome e tipo de culinaria
- Ao clicar em uma loja, exibe o cardapio

---

### [FE-03] Aba do Cliente: montar e confirmar pedido

Descrição: Implementar o fluxo de montagem de pedido com calculo de total em tempo real.

Critérios de aceite:
- Cliente adiciona e remove produtos do carrinho
- Campo para inserir cupom de desconto com feedback de validade
- Exibe subtotal, desconto aplicado, frete e total final em tempo real
- Botão de confirmar pedido envia para a API e exibe confirmação com tempo estimado de entrega

---

### [FE-04] Aba do Cliente: acompanhar status do pedido

Descrição: Implementar a visualização do status atual do pedido após confirmação.

Critérios de aceite:
- Exibe o status atual do pedido de forma visual (linha do tempo ou badge)
- Atualiza o status ao clicar em um botão de refresh (ou automaticamente via polling)
- Exibe nome do motorista atribuído quando disponível

---

### [FE-05] Aba da Loja: gerenciar pedidos recebidos

Descrição: Implementar a visao da loja com listagem e gerenciamento de pedidos.

Critérios de aceite:
- Dropdown para selecionar qual loja está sendo visualizada
- Lista os pedidos recebidos com status atual e detalhes dos itens
- Botão para aceitar pedido em AGUARDANDO_ACEITE
- Botão para avançar para EM_PREPARO e depois AGUARDANDO_MOTORISTA
- Exibe motorista atribuído automaticamente ao mudar para AGUARDANDO_MOTORISTA

---

### [FE-06] Aba do Motorista: pedido em andamento e confirmação

Descrição: Implementar a aba do motorista com o pedido atribuído, mapa da rota e botão de confirmação de entrega.

Critérios de aceite:
- Dropdown para selecionar qual motorista está logado
- Exibe o pedido atual atribuído ao motorista (status A_CAMINHO), com endereço de entrega e itens
- Mapa (Leaflet) com marcador da loja, marcador do endereço do cliente e rota desenhada entre os dois pontos
- Botão "Confirmar entrega" chama POST /pedidos/:id/confirmar-entrega
- Após confirmação, mapa some e motorista aparece como disponível novamente

---

### [FE-07] Integração do mapa com Leaflet e OpenRouteService

Descrição: Configurar o Leaflet.js no frontend React e renderizar a rota retornada pelo backend.

Critérios de aceite:
- Leaflet instalado e configurado no projeto React
- Componente de mapa reutilizável que recebe GeoJSON e renderiza a rota
- Tiles do OpenStreetMap carregando corretamente
- Marcadores distintos para loja (origem) e cliente (destino)

---

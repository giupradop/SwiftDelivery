-- Limpar dados existentes em ordem reversa de dependência
DELETE FROM itens_pedido
DELETE FROM pedidos
DELETE FROM enderecos
DELETE FROM produtos
DELETE FROM motoristas
DELETE FROM clientes
DELETE FROM lojas
DELETE FROM cupons
GO

-- Clientes
INSERT INTO clientes (id, nome, email, senha_hash, telefone, data_cadastro, pontos_fidelidade, nivel_fidelidade) VALUES
('aa000000-0000-0000-0000-000000000001', 'Ana Costa',      'ana@email.com',      'sem_auth', '(11) 91111-1111', '2024-01-10', 50,  'BRONZE'),
('aa000000-0000-0000-0000-000000000002', 'Pedro Lima',     'pedro@email.com',    'sem_auth', '(11) 92222-2222', '2024-02-15', 300, 'PRATA'),
('aa000000-0000-0000-0000-000000000003', 'Mariana Souza',  'mariana@email.com',  'sem_auth', '(11) 93333-3333', '2024-03-20', 650, 'OURO')
GO

-- Motoristas (todos disponíveis)
INSERT INTO motoristas (id, nome, email, senha_hash, telefone, data_cadastro, cnh, veiculo, disponivel) VALUES
('bb000000-0000-0000-0000-000000000001', 'Lucas Santos',   'lucas@email.com',   'sem_auth', '(11) 94444-4444', '2024-01-05', '12345678901', 'Honda CG 160 - Preta',     1),
('bb000000-0000-0000-0000-000000000002', 'Rafael Oliveira','rafael@email.com',  'sem_auth', '(11) 95555-5555', '2024-01-06', '23456789012', 'Yamaha Factor 150 - Vermelha', 1),
('bb000000-0000-0000-0000-000000000003', 'Thiago Costa',   'thiago@email.com',  'sem_auth', '(11) 96666-6666', '2024-01-07', '34567890123', 'Honda Biz 125 - Branca',   1),
('bb000000-0000-0000-0000-000000000004', 'Bruno Ferreira', 'bruno@email.com',   'sem_auth', '(11) 97777-7777', '2024-01-08', '45678901234', 'Suzuki Yes 125 - Azul',    1),
('bb000000-0000-0000-0000-000000000005', 'Carlos Mendes',  'carlos@email.com',  'sem_auth', '(11) 98888-8888', '2024-01-09', '56789012345', 'Honda Pop 110i - Cinza',   1)
GO

-- Lojas (coordenadas em São Paulo)
INSERT INTO lojas (id, nome, tipo, descricao, imagem_url, aberta, horario_abertura, horario_fechamento, avaliacao_media, total_avaliacoes, latitude, longitude) VALUES
('cc000000-0000-0000-0000-000000000001', 'Belle Patisserie',  'CONFEITARIA',  'Confeitaria artesanal com doces finos e bolos especiais', '', 1, '08:00', '22:00', 4.8, 120, -23.5629, -46.6544),
('cc000000-0000-0000-0000-000000000002', 'La Bella Pizza',    'PIZZARIA',     'Pizzas artesanais com ingredientes selecionados',          '', 1, '11:00', '23:00', 4.6, 98,  -23.5489, -46.6388),
('cc000000-0000-0000-0000-000000000003', 'Smash Burger Co.',  'HAMBURGUERIA', 'Smash burgers artesanais no estilo americano',             '', 1, '11:00', '23:00', 4.7, 210, -23.5875, -46.6823)
GO

-- Cupons
INSERT INTO cupons (id, codigo, tipo, valor, validade, uso_maximo, uso_atual, ativo) VALUES
('ff000000-0000-0000-0000-000000000001', 'PROMO10',    'PERCENTUAL',  10.00, '2027-12-31', 100, 0, 1),
('ff000000-0000-0000-0000-000000000002', 'DESCONTO15', 'VALOR_FIXO',  15.00, '2027-12-31', 50,  0, 1),
('ff000000-0000-0000-0000-000000000003', 'FRETEFREE',  'FRETE_GRATIS', 0.00, '2027-12-31', 80,  0, 1)
GO

-- Endereços (1 por cliente, coordenadas em SP para cálculo de distância via ORS)
INSERT INTO enderecos (id, cliente_id, apelido, cep, rua, numero, complemento, bairro, cidade, latitude, longitude, principal) VALUES
('ee000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Casa', '01310-100', 'Rua Augusta',           '1500', 'Ap 42',  'Consolação',   'São Paulo', -23.5558, -46.6611, 1),
('ee000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', 'Casa', '05406-000', 'Rua Teodoro Sampaio',   '800',  'Ap 12',  'Pinheiros',    'São Paulo', -23.5660, -46.6803, 1),
('ee000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'Casa', '05433-000', 'Rua Girassol',          '320',  'Casa',   'Vila Madalena','São Paulo', -23.5590, -46.6905, 1)
GO

-- Produtos — Belle Patisserie
INSERT INTO produtos (id, loja_id, nome, descricao, preco, imagem_url, disponivel, categoria) VALUES
('dd000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000001', 'Tiramisu',           'Clássico italiano com mascarpone e café',        18.90, '', 1, 'Sobremesa'),
('dd000000-0000-0000-0000-000000000002', 'cc000000-0000-0000-0000-000000000001', 'Cinnamon Roll',      'Enrolado de canela com cobertura de cream cheese', 12.50, '', 1, 'Salgado Doce'),
('dd000000-0000-0000-0000-000000000003', 'cc000000-0000-0000-0000-000000000001', 'Brigadeiro Gourmet', 'Brigadeiro belga com granulado crocante',          8.90, '', 1, 'Docinho'),
('dd000000-0000-0000-0000-000000000004', 'cc000000-0000-0000-0000-000000000001', 'Cookie Recheado',    'Cookie crocante recheado com Nutella',             9.50, '', 1, 'Cookie'),
('dd000000-0000-0000-0000-000000000005', 'cc000000-0000-0000-0000-000000000001', 'Fatia de Bolo',      'Bolo do dia com cobertura especial',              14.00, '', 1, 'Bolo'),
('dd000000-0000-0000-0000-000000000006', 'cc000000-0000-0000-0000-000000000001', 'Brownie',            'Brownie fudge de chocolate belga',                11.00, '', 1, 'Sobremesa')
GO

-- Produtos — La Bella Pizza
INSERT INTO produtos (id, loja_id, nome, descricao, preco, imagem_url, disponivel, categoria) VALUES
('dd000000-0000-0000-0000-000000000007', 'cc000000-0000-0000-0000-000000000002', 'Pizza Margherita',       'Molho de tomate, mussarela e manjericão fresco',  45.90, '', 1, 'Pizza'),
('dd000000-0000-0000-0000-000000000008', 'cc000000-0000-0000-0000-000000000002', 'Pizza Calabresa',        'Calabresa artesanal com cebola e azeitona',       47.90, '', 1, 'Pizza'),
('dd000000-0000-0000-0000-000000000009', 'cc000000-0000-0000-0000-000000000002', 'Frango com Catupiry',    'Frango desfiado cremoso com catupiry original',   49.90, '', 1, 'Pizza'),
('dd000000-0000-0000-0000-000000000010', 'cc000000-0000-0000-0000-000000000002', '4 Queijos',              'Mussarela, provolone, gorgonzola e parmesão',     52.90, '', 1, 'Pizza'),
('dd000000-0000-0000-0000-000000000011', 'cc000000-0000-0000-0000-000000000002', 'Portuguesa',             'Presunto, ovos, cebola, azeitona e pimentão',     54.90, '', 1, 'Pizza'),
('dd000000-0000-0000-0000-000000000012', 'cc000000-0000-0000-0000-000000000002', 'Pepperoni',              'Pepperoni importado com mussarela especial',       56.90, '', 1, 'Pizza')
GO

-- Produtos — Smash Burger Co.
INSERT INTO produtos (id, loja_id, nome, descricao, preco, imagem_url, disponivel, categoria) VALUES
('dd000000-0000-0000-0000-000000000013', 'cc000000-0000-0000-0000-000000000003', 'Classic Smash',   'Blend 180g, queijo cheddar, alface e tomate',        32.90, '', 1, 'Burger'),
('dd000000-0000-0000-0000-000000000014', 'cc000000-0000-0000-0000-000000000003', 'Bacon Lovers',    'Blend 180g, bacon crocante, queijo e molho especial', 38.90, '', 1, 'Burger'),
('dd000000-0000-0000-0000-000000000015', 'cc000000-0000-0000-0000-000000000003', 'Veggie Smash',    'Blend de legumes, queijo, alface e tomate',           34.90, '', 1, 'Burger'),
('dd000000-0000-0000-0000-000000000016', 'cc000000-0000-0000-0000-000000000003', 'Double Smash',    'Dois blends 180g, queijo duplo e molho da casa',      44.90, '', 1, 'Burger'),
('dd000000-0000-0000-0000-000000000017', 'cc000000-0000-0000-0000-000000000003', 'Chicken Smash',   'Frango crocante, queijo, alface e maionese defumada', 36.90, '', 1, 'Burger'),
('dd000000-0000-0000-0000-000000000018', 'cc000000-0000-0000-0000-000000000003', 'Smash Kids',      'Blend 120g, queijo e batata palha',                   28.90, '', 1, 'Burger')
GO

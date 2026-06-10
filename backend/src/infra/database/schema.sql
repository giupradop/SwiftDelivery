-- Criação do banco (rodar separado se necessário)
-- CREATE DATABASE SwiftDelivery
-- GO
-- USE SwiftDelivery
-- GO

-- Drop em ordem reversa de dependência
IF OBJECT_ID('itens_pedido', 'U') IS NOT NULL DROP TABLE itens_pedido
IF OBJECT_ID('pedidos', 'U') IS NOT NULL DROP TABLE pedidos
IF OBJECT_ID('enderecos', 'U') IS NOT NULL DROP TABLE enderecos
IF OBJECT_ID('produtos', 'U') IS NOT NULL DROP TABLE produtos
IF OBJECT_ID('motoristas', 'U') IS NOT NULL DROP TABLE motoristas
IF OBJECT_ID('clientes', 'U') IS NOT NULL DROP TABLE clientes
IF OBJECT_ID('lojas', 'U') IS NOT NULL DROP TABLE lojas
IF OBJECT_ID('cupons', 'U') IS NOT NULL DROP TABLE cupons
GO

CREATE TABLE clientes (
  id            NVARCHAR(36)  PRIMARY KEY,
  nome          NVARCHAR(100) NOT NULL,
  email         NVARCHAR(100) NOT NULL UNIQUE,
  senha_hash    NVARCHAR(255) NOT NULL,
  telefone      NVARCHAR(20),
  data_cadastro DATETIME2     DEFAULT GETDATE(),
  pontos_fidelidade INT       DEFAULT 0,
  nivel_fidelidade  NVARCHAR(20) DEFAULT 'BRONZE'
)
GO

-- pedido_atual_id sem FK para evitar referência circular com pedidos
CREATE TABLE motoristas (
  id              NVARCHAR(36)  PRIMARY KEY,
  nome            NVARCHAR(100) NOT NULL,
  email           NVARCHAR(100) NOT NULL UNIQUE,
  senha_hash      NVARCHAR(255) NOT NULL,
  telefone        NVARCHAR(20),
  data_cadastro   DATETIME2     DEFAULT GETDATE(),
  cnh             NVARCHAR(20)  NOT NULL,
  veiculo         NVARCHAR(100) NOT NULL,
  disponivel      BIT           DEFAULT 1,
  pedido_atual_id NVARCHAR(36)  NULL
)
GO

CREATE TABLE lojas (
  id                 NVARCHAR(36)  PRIMARY KEY,
  nome               NVARCHAR(100) NOT NULL,
  tipo               NVARCHAR(20)  NOT NULL,
  descricao          NVARCHAR(500),
  imagem_url         NVARCHAR(500),
  aberta             BIT           DEFAULT 1,
  horario_abertura   NVARCHAR(5)   NOT NULL,
  horario_fechamento NVARCHAR(5)   NOT NULL,
  avaliacao_media    FLOAT         DEFAULT 0,
  total_avaliacoes   INT           DEFAULT 0,
  latitude           FLOAT         NOT NULL,
  longitude          FLOAT         NOT NULL
)
GO

CREATE TABLE cupons (
  id         NVARCHAR(36)   PRIMARY KEY,
  codigo     NVARCHAR(50)   NOT NULL UNIQUE,
  tipo       NVARCHAR(20)   NOT NULL,
  valor      DECIMAL(10,2)  NOT NULL,
  validade   DATETIME2      NOT NULL,
  uso_maximo INT            NOT NULL,
  uso_atual  INT            DEFAULT 0,
  ativo      BIT            DEFAULT 1
)
GO

CREATE TABLE enderecos (
  id          NVARCHAR(36)  PRIMARY KEY,
  cliente_id  NVARCHAR(36)  NOT NULL REFERENCES clientes(id),
  apelido     NVARCHAR(50),
  cep         NVARCHAR(10),
  rua         NVARCHAR(200),
  numero      NVARCHAR(20),
  complemento NVARCHAR(100),
  bairro      NVARCHAR(100),
  cidade      NVARCHAR(100),
  latitude    FLOAT         NOT NULL,
  longitude   FLOAT         NOT NULL,
  principal   BIT           DEFAULT 0
)
GO

CREATE TABLE produtos (
  id         NVARCHAR(36)  PRIMARY KEY,
  loja_id    NVARCHAR(36)  NOT NULL REFERENCES lojas(id),
  nome       NVARCHAR(100) NOT NULL,
  descricao  NVARCHAR(500),
  preco      DECIMAL(10,2) NOT NULL,
  imagem_url NVARCHAR(500),
  disponivel BIT           DEFAULT 1,
  categoria  NVARCHAR(50)
)
GO

CREATE TABLE pedidos (
  id                  NVARCHAR(36)  PRIMARY KEY,
  cliente_id          NVARCHAR(36)  NOT NULL REFERENCES clientes(id),
  loja_id             NVARCHAR(36)  NOT NULL REFERENCES lojas(id),
  motorista_id        NVARCHAR(36)  NULL REFERENCES motoristas(id),
  status              NVARCHAR(30)  NOT NULL DEFAULT 'AGUARDANDO_ACEITE',
  endereco_entrega_id NVARCHAR(36)  NOT NULL REFERENCES enderecos(id),
  subtotal            DECIMAL(10,2) NOT NULL,
  taxa_entrega        DECIMAL(10,2) NOT NULL,
  desconto            DECIMAL(10,2) DEFAULT 0,
  total               DECIMAL(10,2) NOT NULL,
  cupom_id            NVARCHAR(36)  NULL REFERENCES cupons(id),
  data_criacao        DATETIME2     DEFAULT GETDATE(),
  data_atualizacao    DATETIME2     DEFAULT GETDATE(),
  observacao          NVARCHAR(500)
)
GO

CREATE TABLE itens_pedido (
  id            NVARCHAR(36)  PRIMARY KEY,
  pedido_id     NVARCHAR(36)  NOT NULL REFERENCES pedidos(id),
  produto_id    NVARCHAR(36)  NOT NULL REFERENCES produtos(id),
  nome_produto  NVARCHAR(100) NOT NULL,
  preco_produto DECIMAL(10,2) NOT NULL,
  quantidade    INT           NOT NULL,
  observacao    NVARCHAR(500)
)
GO

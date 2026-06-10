# Swift Delivery — Especificação do Projeto

Plataforma de delivery multi-restaurante em TypeScript. Backend com Node.js + SQL Server, frontend web com três abas (visão do cliente, visão da loja e visão do motorista).

---

## Stack

- **Linguagem:** TypeScript
- **Backend:** Node.js (framework a definir)
- **Banco de dados:** SQL Server (Dapper ou query manual)
- **Frontend:** React + TypeScript
- **Mapa:** Leaflet.js + OpenStreetMap (tiles gratuitos) + OpenRouteService (geometria da rota)
- **Testes:** Jest

---

## Domínio: Entidades e Classes

### `Usuario` (classe abstrata)

Base para todos os usuários do sistema.

**Atributos:**
- `id: string`
- `nome: string`
- `email: string`
- `senhaHash: string`
- `telefone: string`
- `dataCadastro: Date`

**Métodos:**
- `abstract getNivelAcesso(): string`
- `validarEmail(): boolean`

---

### `Cliente extends Usuario`

Usuário que faz pedidos.

**Atributos adicionais:**
- `enderecos: Endereco[]`
- `pontosFidelidade: number`
- `nivelFidelidade: NivelFidelidade` (enum)
- `historicosPedidos: string[]` (ids)
- `cuponsAtivos: Cupom[]`

**Métodos:**
- `getNivelAcesso(): string` — retorna `"CLIENTE"`
- `adicionarEndereco(endereco: Endereco): void`
- `calcularNivelFidelidade(): NivelFidelidade`
- `adicionarPontos(quantidade: number): void`
- `resgatarCupom(cupom: Cupom): boolean`

---

### `Motorista extends Usuario`

Entregador cadastrado na plataforma.

**Atributos adicionais:**
- `cnh: string`
- `veiculo: string`
- `disponivel: boolean`
- `pedidoAtualId: string | null`
- `totalEntregas: number`

**Métodos:**
- `getNivelAcesso(): string` — retorna `"MOTORISTA"`
- `ficardisponivel(): void`
- `ficarIndisponivel(): void`
- `aceitarPedido(pedidoId: string): boolean` — só aceita se `disponivel === true`

---

### `Loja` (classe independente, fora da hierarquia de Usuario)

Representa um restaurante cadastrado na plataforma.

**Atributos:**
- `id: string`
- `nome: string`
- `tipo: TipoLoja` (enum: CONFEITARIA, PIZZARIA, HAMBURGUERIA)
- `descricao: string`
- `imagemUrl: string`
- `aberta: boolean`
- `horarioAbertura: string`
- `horarioFechamento: string`
- `avaliacaoMedia: number`
- `totalAvaliacoes: number`
- `cardapio: Produto[]`
- `latitude: number`
- `longitude: number`

**Métodos:**
- `estaAberta(): boolean` — verifica horário atual vs horário da loja
- `adicionarProduto(produto: Produto): void`
- `removerProduto(produtoId: string): void`
- `calcularAvaliacao(novaNota: number): void`
- `getProdutosDisponiveis(): Produto[]`

---

### `Produto`

Item do cardápio de uma loja.

**Atributos:**
- `id: string`
- `lojaId: string`
- `nome: string`
- `descricao: string`
- `preco: number`
- `imagemUrl: string`
- `disponivel: boolean`
- `categoria: string`

**Métodos:**
- `aplicarDesconto(percentual: number): number`

---

### `Pedido`

Núcleo das regras de negócio. Implementa máquina de estados.

**Atributos:**
- `id: string`
- `clienteId: string`
- `lojaId: string`
- `motoristaId: string | null`
- `itens: ItemPedido[]`
- `status: StatusPedido` (enum)
- `enderecoEntrega: Endereco`
- `subtotal: number`
- `taxaEntrega: number`
- `desconto: number`
- `total: number`
- `cupomAplicado: Cupom | null`
- `dataCriacao: Date`
- `dataAtualizacao: Date`
- `observacao: string`

**Métodos:**
- `calcularSubtotal(): number`
- `calcularTaxaEntrega(distanciaKm: number): number`
- `aplicarCupom(cupom: Cupom): boolean`
- `avancarStatus(): void` — só avança se transição for válida
- `cancelar(): boolean` — só cancela em status permitidos
- `calcularPontosGerados(): number` — regra: 1 ponto por R$1,00 gasto

**Transições de status válidas:**
```
AGUARDANDO_ACEITE → EM_PREPARO
EM_PREPARO → AGUARDANDO_MOTORISTA
AGUARDANDO_MOTORISTA → A_CAMINHO
A_CAMINHO → ENTREGUE
AGUARDANDO_ACEITE → CANCELADO
```

---

### `ItemPedido`

Linha de item dentro de um pedido.

**Atributos:**
- `produtoId: string`
- `nomeProduto: string` (snapshot no momento do pedido)
- `precoProduto: number` (snapshot)
- `quantidade: number`
- `observacao: string`

**Métodos:**
- `calcularSubtotal(): number` — `precoProduto * quantidade`

---

### `Cupom`

Desconto aplicável a um pedido.

**Atributos:**
- `id: string`
- `codigo: string`
- `tipo: TipoCupom` (enum)
- `valor: number` — percentual (0–100) ou valor fixo em R$
- `validade: Date`
- `usoMaximo: number`
- `usoAtual: number`
- `ativo: boolean`

**Métodos:**
- `estaValido(): boolean` — verifica validade + uso + ativo
- `calcularDesconto(subtotal: number, taxaEntrega: number): number`
- `incrementarUso(): void`

---

### `Endereco`

Endereço de entrega do cliente.

**Atributos:**
- `id: string`
- `clienteId: string`
- `apelido: string` (ex: "Casa", "Trabalho")
- `cep: string`
- `rua: string`
- `numero: string`
- `complemento: string`
- `bairro: string`
- `cidade: string`
- `latitude: number`
- `longitude: number`
- `principal: boolean`

**Métodos:**
- `calcularDistanciaAte(lat: number, lng: number): Promise<number>` — consulta a API OpenRouteService e retorna a distância real de percurso em km

---

## Enums

```typescript
enum StatusPedido {
  AGUARDANDO_ACEITE = "AGUARDANDO_ACEITE",
  EM_PREPARO = "EM_PREPARO",
  AGUARDANDO_MOTORISTA = "AGUARDANDO_MOTORISTA",
  A_CAMINHO = "A_CAMINHO",
  ENTREGUE = "ENTREGUE",
  CANCELADO = "CANCELADO"
}

enum TipoCupom {
  PERCENTUAL = "PERCENTUAL",
  VALOR_FIXO = "VALOR_FIXO",
  FRETE_GRATIS = "FRETE_GRATIS"
}

enum NivelFidelidade {
  BRONZE = "BRONZE",    // 0–199 pontos
  PRATA = "PRATA",      // 200–499 pontos
  OURO = "OURO",        // 500–999 pontos
  DIAMANTE = "DIAMANTE" // 1000+ pontos
}

enum TipoLoja {
  CONFEITARIA = "CONFEITARIA",
  PIZZARIA = "PIZZARIA",
  HAMBURGUERIA = "HAMBURGUERIA"
}
```

---

## Interfaces

```typescript
interface IRepositorio<T> {
  buscarPorId(id: string): Promise<T | null>
  listar(): Promise<T[]>
  salvar(entidade: T): Promise<void>
  atualizar(entidade: T): Promise<void>
  deletar(id: string): Promise<void>
}

interface ICalculadoraFrete {
  calcular(distanciaKm: number): number
}

interface ISerializavel {
  toJSON(): Record<string, unknown>
}
```

---

## Regras de Negócio

### Taxa de entrega
- Distância obtida via API OpenRouteService (distância real de percurso por rua)
- Até 3 km: R$ 5,00 (fixo)
- 3–7 km: R$ 10,00 (fixo)
- 7–12 km: R$ 15,00 (fixo)
- Acima de 12 km: não atendido (lança erro)
- Cupom FRETE_GRATIS zera a taxa

### Fidelidade
- 1 ponto a cada R$ 1,00 gasto (arredondado para baixo)
- Pontos só são creditados quando pedido chega a `ENTREGUE`
- Nível é recalculado automaticamente ao adicionar pontos

### Cupons
- PERCENTUAL: desconto sobre o subtotal (ex: 10% off)
- VALOR_FIXO: desconto fixo em R$ sobre o subtotal
- FRETE_GRATIS: taxa de entrega vai a zero
- Só um cupom por pedido
- Cupom com `usoAtual >= usoMaximo` é considerado inválido

### Motoristas
- Sistema tem exatamente 5 motoristas cadastrados (seed)
- Ao pedido avançar para `A_CAMINHO`, um motorista disponível é escolhido automaticamente (aleatório)
- `disponivel` vai para `false` e `pedidoAtualId` é preenchido na atribuição
- Ao pedido chegar em `ENTREGUE`, motorista volta para `disponivel = true` e `pedidoAtualId = null`

### Confirmação de entrega
- O motorista confirma a entrega pela aba do motorista
- Quando o pedido está `A_CAMINHO`, o motorista pode clicar em "Confirmar entrega"
- Isso avança o status para `ENTREGUE`, credita os pontos de fidelidade do cliente e libera o motorista
- A aba do motorista exibe um mapa com a rota da loja até o endereço do cliente (Leaflet + geometria do OpenRouteService)

### Cancelamento
- Pedido só pode ser cancelado em `AGUARDANDO_ACEITE`
- Qualquer outro status lança erro
- Pontos de fidelidade não são gerados para pedidos cancelados

---

## Estrutura de Pastas (Clean Architecture)

```
src/
  domain/
    entities/
      Usuario.ts
      Cliente.ts
      Motorista.ts
      Loja.ts
      Produto.ts
      Pedido.ts
      ItemPedido.ts
      Cupom.ts
      Endereco.ts
    enums/
      StatusPedido.ts
      TipoCupom.ts
      NivelFidelidade.ts
      TipoLoja.ts
    interfaces/
      IRepositorio.ts
      ICalculadoraFrete.ts
      ISerializavel.ts

  application/
    use-cases/
      pedido/
        CriarPedido.ts
        AvancarStatusPedido.ts
        CancelarPedido.ts
        AplicarCupom.ts
      cliente/
        CadastrarCliente.ts
        AdicionarEndereco.ts
      motorista/
        AceitarPedido.ts
        FinalizarEntrega.ts
      loja/
        ListarLojas.ts
        BuscarCardapio.ts

  infra/
    database/
      connection.ts
      repositories/
        ClienteRepository.ts
        PedidoRepository.ts
        LojaRepository.ts
        MotoristaRepository.ts
        CupomRepository.ts
    http/
      routes/
        pedidoRoutes.ts
        clienteRoutes.ts
        lojaRoutes.ts
        motoristaRoutes.ts
      controllers/
        PedidoController.ts
        ClienteController.ts
        LojaController.ts
        MotoristaController.ts

  frontend/
    index.html
    styles.css
    app.ts (ou componentes React)

  tests/
    pedido.test.ts
    cupom.test.ts
    fidelidade.test.ts
    frete.test.ts
```

---

## Lojas Cadastradas (Seed)

| Loja | Tipo | Produtos sugeridos |
|---|---|---|
| Belle Patisserie | CONFEITARIA | Tiramisu, Cinnamon roll, Brigadeiro gourmet, Cookie recheado, Fatia de bolo, Brownie |
| La Bella Pizza | PIZZARIA | Pizza Margherita, Calabresa, Frango c/ catupiry, 4 queijos, Portuguesa, Pepperoni |
| Smash Burger Co. | HAMBURGUERIA | Classic smash, Bacon lovers, Veggie smash, Double smash, Chicken smash, Smash kids |

---

## Casos de Teste Esperados

- Pedido com cupom FRETE_GRATIS deve ter `taxaEntrega = 0`
- Pedido não pode avançar de `ENTREGUE` para nenhum status
- Cancelamento em `AGUARDANDO_ACEITE` deve funcionar
- Cancelamento em `EM_PREPARO` deve lançar erro
- Cancelamento em `A_CAMINHO` deve lançar erro
- Pontos só são somados quando status é `ENTREGUE`
- `calcularNivelFidelidade()` retorna DIAMANTE para >= 1000 pontos
- Motorista indisponível não pode aceitar pedido
- Cupom expirado deve retornar `estaValido() === false`
- Cupom com uso esgotado deve retornar `estaValido() === false`
- `calcularSubtotal()` em ItemPedido deve multiplicar preço x quantidade corretamente

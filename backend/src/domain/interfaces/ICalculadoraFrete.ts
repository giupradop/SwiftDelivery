// Contrato para qualquer coisa que saiba calcular um frete a partir da distância.
// A Loja implementa esta interface.
export interface ICalculadoraFrete {
  calcularFrete(distanciaKm: number): number
}

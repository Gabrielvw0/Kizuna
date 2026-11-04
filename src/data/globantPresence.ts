/**
 * Presença internacional da Globant usada no globo da tela 01.
 *
 * Fonte: Globant S.A., Form 20-F do exercício de 2025 (SEC, arquivado em 27/02/2026).
 *  - Item 4.B "Facilities and Infrastructure": 91 locais e os principais centros operacionais.
 *  - Item 4.B: "operations through subsidiaries with offices and employees in 31 countries".
 *  - Exhibit 8.1 "List of Subsidiaries": subsidiárias por país (39 jurisdições).
 *
 * Categorias (não misturar):
 *  - 'principal': principais centros de desenvolvimento/entrega e gestão de clientes (tabela do 20-F).
 *  - 'subsidiaria': país com subsidiária registrada no Exhibit 8.1. Indica presença societária;
 *    o 20-F não lista quais desses países têm escritório, por isso não chamamos de escritório.
 *  - Mercados atendidos: o 20-F só informa regiões de receita (América do Norte, América Latina,
 *    Europa e "New Markets"), sem lista de países. Por isso não aparecem como países no globo.
 *
 * Japão: não há subsidiária da Globant no Japão no Exhibit 8.1. O 20-F registra apenas uma
 * participação minoritária de 28% na Genexus Japan (método de equivalência). No globo, o Japão
 * aparece em vermelho como DESTINO do projeto Kizuna, não como presença da Globant.
 */

export const GLOBANT_SOURCE = {
  title: 'Globant S.A. — Form 20-F, exercício 2025 (Item 4.B e Exhibit 8.1)',
  url: 'https://www.sec.gov/Archives/edgar/data/1557860/000162828026012910/glob-20251231.htm',
  exhibitUrl: 'https://www.sec.gov/Archives/edgar/data/1557860/000162828026012910/globex8112312025.htm',
  date: '31/12/2025'
};

export type PresenceKind = 'principal' | 'subsidiaria';

/** Nome do país como aparece em src/data/world.geojson → categoria. */
export const GLOBANT_PRESENCE: Record<string, PresenceKind> = {
  // Principais centros (20-F, Facilities and Infrastructure)
  Argentina: 'principal',
  India: 'principal',
  Colombia: 'principal',
  Spain: 'principal',
  Uruguay: 'principal',
  // Subsidiárias registradas (Exhibit 8.1)
  Brazil: 'subsidiaria',
  Chile: 'subsidiaria',
  Ecuador: 'subsidiaria',
  Peru: 'subsidiaria',
  'Costa Rica': 'subsidiaria',
  Mexico: 'subsidiaria',
  Panama: 'subsidiaria',
  Canada: 'subsidiaria',
  USA: 'subsidiaria',
  Belarus: 'subsidiaria',
  Bulgaria: 'subsidiaria',
  Denmark: 'subsidiaria',
  England: 'subsidiaria', // Exhibit 8.1: "England & Wales"
  France: 'subsidiaria',
  Germany: 'subsidiaria',
  Ireland: 'subsidiaria',
  Italy: 'subsidiaria',
  Luxembourg: 'subsidiaria', // sede societária da Globant S.A.
  Moldova: 'subsidiaria',
  Netherlands: 'subsidiaria',
  Poland: 'subsidiaria',
  Portugal: 'subsidiaria',
  Romania: 'subsidiaria',
  China: 'subsidiaria',
  Vietnam: 'subsidiaria',
  Philippines: 'subsidiaria',
  Australia: 'subsidiaria',
  'South Africa': 'subsidiaria',
  Morocco: 'subsidiaria',
  'Saudi Arabia': 'subsidiaria',
  'United Arab Emirates': 'subsidiaria',
  Jordan: 'subsidiaria' // filial (branch) listada no Exhibit 8.1
};

/** Jurisdições pequenas demais para o mapa base: desenhadas como ponto. */
export const GLOBANT_PRESENCE_POINTS: { name: string; lat: number; lng: number; kind: PresenceKind }[] = [
  { name: 'Singapura', lat: 1.35, lng: 103.82, kind: 'subsidiaria' },
  { name: 'Hong Kong', lat: 22.32, lng: 114.17, kind: 'subsidiaria' }
];

export const JAPAN = { name: 'Japan', lat: 36.2, lng: 138.25 };

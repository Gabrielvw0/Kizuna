import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Transição entre CENAS da mesma tela (Etapa 8 • correção das transições internas).
 *
 * A troca de TELA já remonta o conteúdo inteiro (App: <main key={currentIndex}> + sectionCinema).
 * A troca de CENA não remontava nada: o conteúdo era trocado no lugar, sem saída e quase sem entrada.
 * Este componente dá às cenas a mesma qualidade, sem remontar a tela:
 * - o conteúdo anterior sai na direção da navegação (para trás ao avançar, para frente ao voltar);
 * - o novo entra do lado oposto, com um pequeno atraso, profundidade (escala) e easing natural;
 * - a camada que sai fica sobreposta e sem interação até terminar; nada de fade preto.
 * Na primeira montagem (entrada na tela) não anima: quem anima é a transição de tela.
 * Movimento reduzido: só opacidade, curta (ver index.css).
 */
export const SceneStage: React.FC<{ index: number; className?: string; children: React.ReactNode }> = ({ index, className = '', children }) => {
  const last = useRef<{ index: number; node: React.ReactNode }>({ index, node: children });
  const [outgoing, setOutgoing] = useState<{ index: number; node: React.ReactNode; dir: number } | null>(null);
  const [dir, setDir] = useState(0);

  useLayoutEffect(() => {
    const prev = last.current;
    if (prev.index !== index) {
      const d = index > prev.index ? 1 : -1;
      setOutgoing({ index: prev.index, node: prev.node, dir: d });
      setDir(d);
    }
    last.current = { index, node: children };
  });

  useEffect(() => {
    if (!outgoing) return;
    const t = window.setTimeout(() => setOutgoing(null), 360);
    return () => window.clearTimeout(t);
  }, [outgoing]);

  return (
    <div className={`relative ${className}`}>
      {outgoing && (
        <div
          key={'out-' + outgoing.index}
          className="scene-exit absolute inset-0 overflow-hidden pointer-events-none"
          // a camada que sai fica contida na área da cena (se for mais alta, não cria barra de rolagem)
          style={
            {
              '--scene-dir': outgoing.dir,
              maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)'
            } as React.CSSProperties
          }
          aria-hidden
        >
          {outgoing.node}
        </div>
      )}
      <div key={'in-' + index} className={dir !== 0 ? 'scene-enter' : ''} style={{ '--scene-dir': dir } as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
};

export default SceneStage;

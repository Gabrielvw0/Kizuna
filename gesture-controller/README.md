# 🎥 KIZUNA 絆 — Stage Gesture Controller (V3)

Controlador externo em Python (`OpenCV + MediaPipe + pynput/PyAutoGUI`) projetado para apresentação em palco diante da banca avaliadora.

## Arquitetura Desacoplada
```text
CÂMERA WEBCAM
     ↓
Python + MediaPipe Hands (gesture-controller/main.py)
     ↓
Eventos de Teclado (→, ←, SPACE, P)
     ↓
Navegador (Kizuna V3 Presentation Engine)
```
O navegador do Kizuna permanece **100% limpo no projetor**, enquanto a pequena janela `KIZUNA GESTURE CONTROL` fica aberta apenas na tela auxiliar do apresentador.

## Gestos Suportados (Com Confirmação de Estabilidade + Cooldown de 0.85s)

| Gesto | Nome no HUD | Tecla Enviada | Ação no Kizuna |
| :--- | :--- | :--- | :--- |
| ✋ **Mão aberta** | `OPEN_PALM` | `→` (`Right`) | Avança para a próxima cena / seção |
| 👉 **Indicador p/ direita** | `POINT_RIGHT` | `→` (`Right`) | Avança para a próxima cena / seção |
| 👈 **Indicador p/ esquerda (ou 2 dedos ✌️)** | `POINT_LEFT` | `←` (`Left`) | Volta para a cena / seção anterior |
| 🤏 **Pinça (Polegar + Indicador)** | `PINCH` | `SPACE` | Avança / interage com o palco |
| ✊ **Punho fechado** | `FIST` | *(Nenhuma)* | **HOLD / Rearma o gatilho** (evita disparos acidentais) |
| ✋✋ **Duas mãos abertas** | `TWO_HANDS_OPEN` | `P` | Alterna **Stage Mode** (oculta toda a interface) |

## Proteção Anti-Disparo Contínuo
1. **Confirmação de Estabilidade (`5 frames`)**: O gesto precisa permanecer estável antes de disparar.
2. **Cooldown Obrigatório (`0.85s`)**: Impede múltiplos disparos em sequência.
3. **Trava de Rearme (`FIST` / Neutro)**: Após avançar uma cena com `✋`, o controlador aguarda você fechar a mão (`✊`) ou baixá-la antes de permitir o próximo avanço.

## Como Executar
Basta dar duplo clique em [`Iniciar_Gesture_Control.bat`](./Iniciar_Gesture_Control.bat) ou executar no terminal:
```bash
cd gesture-controller
pip install -r requirements.txt
python main.py
```

"""
KIZUNA 絆 — External Camera Gesture Controller (V4.0)
WebSocket Real-Time Broadcast + Redundant Keyboard Bridge
Gestures:
  👉 SWIPE_RIGHT  -> NEXT (→)
  👈 SWIPE_LEFT   -> PREV (←)
  🤏 PINCH        -> INTERACT / SELECIONAR (ENTER)
  ✋ OPEN_PALM    -> REVEAL / MOSTRAR INTERFACE (P)
  ✊ FIST         -> CONFIRM / CONFIRMAR (ENTER)

Broadcasts normalized (x, y) coordinates and gesture decisions to ws://127.0.0.1:8765
"""

import asyncio
import json
import os
import sys
import threading
import time

import cv2
import mediapipe as mp
import websockets

from gesture_engine import GestureEngine
from keyboard_controller import KeyboardBridge

# Connected WebSocket clients
CONNECTED_CLIENTS = set()
ASYNC_LOOP = None


async def ws_handler(websocket):
    CONNECTED_CLIENTS.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        CONNECTED_CLIENTS.remove(websocket)


def start_websocket_server(host: str, port: int):
    global ASYNC_LOOP
    ASYNC_LOOP = asyncio.new_event_loop()
    asyncio.set_event_loop(ASYNC_LOOP)

    async def run():
        async with websockets.serve(ws_handler, host, port):
            print(f"[KIZUNA WS] WebSocket Server ativo em ws://{host}:{port}")
            await asyncio.Future()

    ASYNC_LOOP.run_until_complete(run())


def broadcast_state(data: dict):
    if not CONNECTED_CLIENTS or ASYNC_LOOP is None:
        return
    message = json.dumps(data)
    for ws in list(CONNECTED_CLIENTS):
        try:
            asyncio.run_coroutine_threadsafe(ws.send(message), ASYNC_LOOP)
        except Exception:
            pass


def load_config() -> dict:
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def draw_hud(frame, decision, config: dict, last_action_label: str, last_action_age: float, clients_count: int):
    h, w, _ = frame.shape

    # Stage Activation Zone
    zone = config.get("activation_zone", {})
    zx1 = int(float(zone.get("x_min", 0.12)) * w)
    zx2 = int(float(zone.get("x_max", 0.88)) * w)
    zy1 = int(float(zone.get("y_min", 0.10)) * h)
    zy2 = int(float(zone.get("y_max", 0.78)) * h)

    zone_color = (72, 29, 225) if decision.in_activation_zone else (100, 116, 139)
    cv2.rectangle(frame, (zx1, zy1), (zx2, zy2), zone_color, 1)
    cv2.putText(
        frame,
        "ZONA DE ATIVACAO DE PALCO",
        (zx1 + 8, zy2 - 8),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.4,
        zone_color,
        1,
        cv2.LINE_AA,
    )

    # Top dark translucent banner
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 142), (13, 8, 5), -1)
    cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)

    cv2.line(frame, (0, 142), (w, 142), (72, 29, 225), 2)

    # Title & WS Status
    cv2.putText(
        frame,
        "KIZUNA GESTURE CONTROL [V4.0]",
        (16, 26),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.58,
        (248, 250, 252),
        2,
        cv2.LINE_AA,
    )

    ws_status = f"WS CONECTADO ({clients_count})" if clients_count > 0 else "WS AGUARDANDO NAVEGADOR"
    ws_color = (52, 211, 153) if clients_count > 0 else (148, 163, 184)
    cv2.putText(
        frame,
        ws_status,
        (w - 240, 26),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        ws_color,
        1,
        cv2.LINE_AA,
    )

    # Command + Gesture
    cmd_color = (72, 29, 225) if decision.stability_progress >= 1.0 else (248, 189, 56)
    if decision.gesture_name == "FIST":
        cmd_color = (52, 211, 153)

    cv2.putText(
        frame,
        f"{decision.short_cmd}   [{decision.gesture_name}]",
        (16, 58),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        cmd_color,
        2,
        cv2.LINE_AA,
    )

    # Visual slots
    slots = 10
    filled_slots = int(round(decision.stability_progress * slots))
    slot_x = 16
    slot_y = 70
    slot_w = 18
    slot_h = 16
    slot_gap = 4

    for i in range(slots):
        bx = slot_x + i * (slot_w + slot_gap)
        is_filled = i < filled_slots
        color = (72, 29, 225) if is_filled else (45, 55, 72)
        cv2.rectangle(frame, (bx, slot_y), (bx + slot_w, slot_y + slot_h), color, -1)
        cv2.rectangle(frame, (bx, slot_y), (bx + slot_w, slot_y + slot_h), (100, 116, 139), 1)

    # Status / Cooldown
    status_str = (
        f"DISPARADO: {last_action_label}"
        if last_action_age < 1.1
        else f"COOLDOWN: {decision.cooldown_remaining:.2f}s"
        if decision.cooldown_remaining > 0
        else "AGUARDANDO GESTO NA ZONA DE ATIVACAO"
    )
    status_color = (129, 185, 16) if last_action_age < 1.1 else (203, 213, 225)
    cv2.putText(
        frame,
        status_str,
        (16, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.46,
        status_color,
        1,
        cv2.LINE_AA,
    )

    # Bottom Legend
    cv2.rectangle(frame, (0, h - 32), (w, h), (13, 8, 5), -1)
    cv2.putText(
        frame,
        "Deslizar Dir: NEXT | Deslizar Esq: PREV | Pinca: INTERACT | Mao Aberta: REVEAL | Punho: CONFIRM",
        (12, h - 11),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.38,
        (203, 213, 225),
        1,
        cv2.LINE_AA,
    )


def main():
    config = load_config()
    cam_idx = int(config.get("camera_index", 0))
    win_title = config.get("window_title", "KIZUNA GESTURE CONTROL [V4.0]")

    ws_host = config.get("websocket_host", "127.0.0.1")
    ws_port = int(config.get("websocket_port", 8765))

    # Start WebSocket Server in daemon thread
    ws_thread = threading.Thread(target=start_websocket_server, args=(ws_host, ws_port), daemon=True)
    ws_thread.start()

    cap = cv2.VideoCapture(cam_idx)
    if not cap.isOpened():
        print(f"[ERRO] Nao foi possivel abrir a camera no indice {cam_idx}.")
        sys.exit(1)

    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=float(config.get("min_detection_confidence", 0.75)),
        min_tracking_confidence=float(config.get("min_tracking_confidence", 0.75)),
    )

    engine = GestureEngine(config)
    kb = KeyboardBridge()

    last_action_label = "NENHUM"
    last_action_time = 0.0

    print("=========================================================")
    print("  KIZUNA 絆 — GESTURE CONTROLLER V4.0 ATIVO")
    print(f"  WebSocket Server: ws://{ws_host}:{ws_port}")
    print("  5 Gestos de Palco:")
    print("    👉 Deslizar direita  -> NEXT (→)")
    print("    👈 Deslizar esquerda -> PREV (←)")
    print("    🤏 Pinça             -> INTERACT / SELECIONAR")
    print("    ✋ Mão aberta        -> REVEAL (P)")
    print("    ✊ Punho             -> CONFIRM (Enter)")
    print("  Pressione 'Q' ou 'ESC' na janela da camera para sair.")
    print("=========================================================")

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        multi_landmarks = results.multi_hand_landmarks or []
        norm_x, norm_y = 0.5, 0.5

        for hand_lms in multi_landmarks:
            mp_draw.draw_landmarks(
                frame,
                hand_lms,
                mp_hands.HAND_CONNECTIONS,
                mp_draw.DrawingSpec(color=(248, 189, 56), thickness=2, circle_radius=2),
                mp_draw.DrawingSpec(color=(72, 29, 225), thickness=2, circle_radius=2),
            )
            # Index tip landmark (8) or wrist (0)
            norm_x = hand_lms.landmark[8].x
            norm_y = hand_lms.landmark[8].y

        decision = engine.process_hands(multi_landmarks)

        # Broadcast real-time coordinates and gesture decision to React frontend
        broadcast_state({
            "type": "GESTURE",
            "x": norm_x,
            "y": norm_y,
            "gesture": decision.gesture_name,
            "cmd": decision.short_cmd,
            "progress": decision.stability_progress,
            "triggered": bool(decision.triggered_key)
        })

        if decision.triggered_key:
            kb.send_key(decision.triggered_key)
            last_action_label = f"{decision.short_cmd} ({decision.triggered_key.upper()})"
            last_action_time = time.time()
            print(f"\n{decision.short_cmd}\n{decision.bar_text} -> DISPARADO [{decision.triggered_key}]")

        draw_hud(frame, decision, config, last_action_label, time.time() - last_action_time, len(CONNECTED_CLIENTS))

        cv2.imshow(win_title, frame)
        key = cv2.waitKey(1) & 0xFF
        if key in (27, ord("q"), ord("Q")):
            break

    hands.close()
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

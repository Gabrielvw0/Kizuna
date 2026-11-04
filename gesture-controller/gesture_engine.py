"""
Kizuna V3.1 Gesture Classification, Activation Zone & Imaginary-Click Engine
Focuses on 4 core stage gestures + Pinch for specific interactions:
  1. OPEN_PALM   (✋ Mão aberta)        -> NEXT (→)
  2. SWIPE_RIGHT (👉 Deslizar direita)  -> NEXT (→)
  3. SWIPE_LEFT  (👈 Deslizar esquerda) -> PREVIOUS (←)
  4. FIST        (✊ Punho)             -> HOLD / Bloqueio
  +  PINCH       (🤏 Pinça)             -> INTERACT (ENTER)

Includes an upper-stage Activation Zone to ignore casual hand gesticulation
while speaking, and a progressive visual confirmation bar ("NEXT ███████░░░")
for the "imaginary click" feel.
"""

from collections import deque
import math
import time
from dataclasses import dataclass


@dataclass
class GestureDecision:
    gesture_name: str
    short_cmd: str             # e.g. "NEXT", "PREVIOUS", "HOLD", "IDLE"
    bar_text: str              # e.g. "███████░░░"
    stability_progress: float  # 0.0 to 1.0
    cooldown_remaining: float  # seconds
    triggered_action: str | None
    triggered_key: str | None
    is_armed: bool
    in_activation_zone: bool


class GestureEngine:
    def __init__(self, config: dict):
        self.cooldown_seconds: float = float(config.get("cooldown_seconds", 0.9))
        self.stability_frames: int = int(config.get("stability_frames", 7))
        self.pinch_threshold: float = float(config.get("pinch_threshold", 0.044))
        self.gesture_map: dict = config.get("gestures", {})

        zone = config.get("activation_zone", {})
        self.zone_x_min: float = float(zone.get("x_min", 0.12))
        self.zone_x_max: float = float(zone.get("x_max", 0.88))
        self.zone_y_min: float = float(zone.get("y_min", 0.10))
        self.zone_y_max: float = float(zone.get("y_max", 0.78))

        self._candidate_gesture: str = "NONE"
        self._consecutive_frames: int = 0
        self._last_trigger_time: float = 0.0
        self._armed: bool = True
        self._last_fired_gesture: str = "NONE"
        self._wrist_x_history: deque[float] = deque(maxlen=6)

    @staticmethod
    def _dist(lm1, lm2) -> float:
        return math.hypot(lm1.x - lm2.x, lm1.y - lm2.y)

    @staticmethod
    def _build_bar_text(progress: float, slots: int = 10) -> str:
        filled = max(0, min(slots, int(round(progress * slots))))
        return ("█" * filled) + ("░" * (slots - filled))

    def _is_in_activation_zone(self, landmarks) -> bool:
        wrist = landmarks.landmark[0]
        mcp_mid = landmarks.landmark[9]
        cx = (wrist.x + mcp_mid.x) * 0.5
        cy = (wrist.y + mcp_mid.y) * 0.5
        return (
            self.zone_x_min <= cx <= self.zone_x_max
            and self.zone_y_min <= cy <= self.zone_y_max
        )

    def _classify_single_hand(self, landmarks) -> str:
        lm = landmarks.landmark

        # Track horizontal wrist movement for SWIPE_RIGHT / SWIPE_LEFT
        self._wrist_x_history.append(lm[9].x)
        swipe_dx = (
            self._wrist_x_history[-1] - self._wrist_x_history[0]
            if len(self._wrist_x_history) >= 4
            else 0.0
        )

        # Finger extension states
        index_up = lm[8].y < lm[6].y - 0.02
        middle_up = lm[12].y < lm[10].y - 0.02
        ring_up = lm[16].y < lm[14].y - 0.02
        pinky_up = lm[20].y < lm[18].y - 0.02
        up_count = sum([index_up, middle_up, ring_up, pinky_up])

        # 1. FIST (✊ Punho -> HOLD / Bloqueio imediato)
        if up_count == 0:
            return "FIST"

        # 2. Dynamic Horizontal Swipe (👉 Deslizar direita / 👈 Deslizar esquerda)
        if abs(swipe_dx) > 0.11:
            return "SWIPE_RIGHT" if swipe_dx > 0 else "SWIPE_LEFT"

        # 3. Directional Index/Two-Finger Pointing -> mapped to SWIPE_RIGHT / SWIPE_LEFT
        if not middle_up and not ring_up and not pinky_up:
            dx = lm[8].x - lm[5].x
            dy = abs(lm[8].y - lm[5].y)
            if abs(dx) > 0.065 and abs(dx) > dy * 0.75:
                return "SWIPE_RIGHT" if dx > 0 else "SWIPE_LEFT"

        if index_up and middle_up and not ring_up and not pinky_up:
            return "SWIPE_LEFT"

        # 4. PINCH (🤏 Pinça -> INTERACT / ENTER, only when ring & pinky folded)
        pinch_dist = self._dist(lm[4], lm[8])
        if pinch_dist < self.pinch_threshold and not ring_up and not pinky_up:
            return "PINCH"

        # 5. OPEN_PALM (✋ Mão aberta -> NEXT)
        if up_count == 4:
            return "OPEN_PALM"

        return "NEUTRAL"

    def process_hands(self, multi_hand_landmarks) -> GestureDecision:
        now = time.time()
        cooldown_rem = max(0.0, self.cooldown_seconds - (now - self._last_trigger_time))

        if not multi_hand_landmarks:
            self._candidate_gesture = "NONE"
            self._consecutive_frames = 0
            self._wrist_x_history.clear()
            self._armed = True
            return GestureDecision(
                gesture_name="NONE",
                short_cmd="IDLE",
                bar_text=self._build_bar_text(0.0),
                stability_progress=0.0,
                cooldown_remaining=cooldown_rem,
                triggered_action=None,
                triggered_key=None,
                is_armed=self._armed,
                in_activation_zone=False,
            )

        hand_lms = multi_hand_landmarks[0]
        in_zone = self._is_in_activation_zone(hand_lms)

        if not in_zone:
            self._candidate_gesture = "OUTSIDE_ZONE"
            self._consecutive_frames = 0
            return GestureDecision(
                gesture_name="OUTSIDE_ZONE",
                short_cmd="ZONA INATIVA",
                bar_text=self._build_bar_text(0.0),
                stability_progress=0.0,
                cooldown_remaining=cooldown_rem,
                triggered_action=None,
                triggered_key=None,
                is_armed=self._armed,
                in_activation_zone=False,
            )

        detected = self._classify_single_hand(hand_lms)

        # Re-arm when presenter closes hand (FIST) or returns to NEUTRAL
        if detected in ("FIST", "NEUTRAL", "NONE"):
            self._armed = True
            self._last_fired_gesture = "NONE"

        if detected != self._last_fired_gesture and detected not in ("NEUTRAL", "NONE"):
            self._armed = True

        # Update stability counter for the "imaginary click" progress bar
        if detected == self._candidate_gesture and detected not in ("NEUTRAL", "NONE"):
            self._consecutive_frames += 1
        else:
            self._candidate_gesture = detected
            self._consecutive_frames = 1 if detected not in ("NEUTRAL", "NONE") else 0

        progress = (
            1.0
            if detected == "FIST"
            else min(1.0, self._consecutive_frames / max(1, self.stability_frames))
        )

        spec = self.gesture_map.get(detected, {})
        short_cmd = spec.get("short_cmd", detected)
        bar_text = self._build_bar_text(progress)

        triggered_action = None
        triggered_key = None

        if (
            detected in self.gesture_map
            and spec.get("key") is not None
            and self._consecutive_frames >= self.stability_frames
            and cooldown_rem <= 0.0
            and self._armed
        ):
            triggered_key = spec["key"]
            triggered_action = spec["label"]
            self._last_trigger_time = now
            self._armed = False
            self._last_fired_gesture = detected
            cooldown_rem = self.cooldown_seconds

        return GestureDecision(
            gesture_name=detected,
            short_cmd=short_cmd,
            bar_text=bar_text,
            stability_progress=progress,
            cooldown_remaining=cooldown_rem,
            triggered_action=triggered_action,
            triggered_key=triggered_key,
            is_armed=self._armed,
            in_activation_zone=True,
        )

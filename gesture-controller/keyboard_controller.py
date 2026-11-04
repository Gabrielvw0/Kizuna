"""
Kizuna Stage Keyboard Bridge
Dispatches low-latency keystrokes to the active browser window running Kizuna.
"""

import time

try:
    from pynput.keyboard import Controller, Key
    HAS_PYNPUT = True
except ImportError:
    HAS_PYNPUT = False

try:
    import pyautogui
    pyautogui.FAILSAFE = False
    HAS_PYAUTOGUI = True
except ImportError:
    HAS_PYAUTOGUI = False


class KeyboardBridge:
    def __init__(self):
        self._controller = Controller() if HAS_PYNPUT else None
        self.last_triggered_key = "NONE"
        self.last_triggered_time = 0.0

    def send_key(self, key_name: str | None) -> bool:
        if not key_name:
            return False

        key_lower = key_name.lower().strip()

        if HAS_PYNPUT and self._controller is not None:
            key_map = {
                "right": Key.right,
                "left": Key.left,
                "space": Key.space,
                "esc": Key.esc,
            }
            target = key_map.get(key_lower, key_lower)
            self._controller.press(target)
            self._controller.release(target)
        elif HAS_PYAUTOGUI:
            pyautogui.press(key_lower)
        else:
            print(f"[WARN] Neither pynput nor pyautogui is installed. Simulated key: {key_lower}")

        self.last_triggered_key = key_lower.upper()
        self.last_triggered_time = time.time()
        return True

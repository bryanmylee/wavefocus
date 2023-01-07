#include <Arduino.h>

// GPIO Pins
// =========

#define DISPLAY_RIGHT_DP 12
#define DISPLAY_RIGHT_A 18
#define DISPLAY_RIGHT_B 5
#define DISPLAY_RIGHT_C 14
#define DISPLAY_RIGHT_D 27
#define DISPLAY_RIGHT_E 26
#define DISPLAY_RIGHT_F 19
#define DISPLAY_RIGHT_G 21
#define DISPLAY_LEFT_A 1
#define DISPLAY_LEFT_B 3
#define DISPLAY_LEFT_C 25
#define DISPLAY_LEFT_D 33
#define DISPLAY_LEFT_E 32
#define DISPLAY_LEFT_F 22
#define DISPLAY_LEFT_G 23
#define BUTTON_POWER 4
#define BUTTON_INPUT 35

void configurePins() {
  pinMode(DISPLAY_RIGHT_DP, OUTPUT);
  pinMode(DISPLAY_RIGHT_A, OUTPUT);
  pinMode(DISPLAY_RIGHT_B, OUTPUT);
  pinMode(DISPLAY_RIGHT_C, OUTPUT);
  pinMode(DISPLAY_RIGHT_D, OUTPUT);
  pinMode(DISPLAY_RIGHT_E, OUTPUT);
  pinMode(DISPLAY_RIGHT_F, OUTPUT);
  pinMode(DISPLAY_RIGHT_G, OUTPUT);
  pinMode(DISPLAY_LEFT_A, OUTPUT);
  pinMode(DISPLAY_LEFT_B, OUTPUT);
  pinMode(DISPLAY_LEFT_C, OUTPUT);
  pinMode(DISPLAY_LEFT_D, OUTPUT);
  pinMode(DISPLAY_LEFT_E, OUTPUT);
  pinMode(DISPLAY_LEFT_F, OUTPUT);
  pinMode(DISPLAY_LEFT_G, OUTPUT);
  pinMode(BUTTON_POWER, OUTPUT);
  // Use an output pin to provide the button with high voltage.
  digitalWrite(BUTTON_POWER, HIGH);
  pinMode(BUTTON_INPUT, INPUT_PULLDOWN);
}

// Constants
// =========

struct SegmentDisplay {
  uint8_t A;
  uint8_t B;
  uint8_t C;
  uint8_t D;
  uint8_t E;
  uint8_t F;
  uint8_t G;
};

const SegmentDisplay DISPLAY_LEFT = {
  A : DISPLAY_LEFT_A,
  B : DISPLAY_LEFT_B,
  C : DISPLAY_LEFT_C,
  D : DISPLAY_LEFT_D,
  E : DISPLAY_LEFT_E,
  F : DISPLAY_LEFT_F,
  G : DISPLAY_LEFT_G,
};

const SegmentDisplay DISPLAY_RIGHT = {
  A : DISPLAY_RIGHT_A,
  B : DISPLAY_RIGHT_B,
  C : DISPLAY_RIGHT_C,
  D : DISPLAY_RIGHT_D,
  E : DISPLAY_RIGHT_E,
  F : DISPLAY_RIGHT_F,
  G : DISPLAY_RIGHT_G,
};

const uint32_t MAX_DURATION_SECONDS = 25 * 60;

#define NO_DIGIT 10

// Timer
// =====

hw_timer_t *timer = NULL;
volatile SemaphoreHandle_t timerSemaphore;
portMUX_TYPE timerMutex = portMUX_INITIALIZER_UNLOCKED;
volatile uint32_t timerSecondsRemaining = 0;
volatile bool isTimerActive = false;

void IRAM_ATTR perSecondInterrupt() {
  portENTER_CRITICAL_ISR(&timerMutex);
  if (timerSecondsRemaining == 0) {
    timerEnd(timer);
  } else {
    timerSecondsRemaining--;
  }
  portEXIT_CRITICAL_ISR(&timerMutex);

  xSemaphoreGiveFromISR(timerSemaphore, NULL);
}

void configureTimer() {
  timerSemaphore = xSemaphoreCreateBinary();

  // Use the 1st out of 4 hardware timers.
  // Set 80 divider for prescaler (see ESP32 Technical Reference Manual).
  timer = timerBegin(0, 80, true);

  timerAttachInterrupt(timer, &perSecondInterrupt, true);

  // Interrupt the timer every second and repeat.
  timerAlarmWrite(timer, 1000000, true);
}

// Setup
// =====

void setup() {
  // TX0 and RX0 are used for Serial, which is used by DISPLAY_RIGHT_A and
  // DISPLAY_RIGHT_B.
  // Therefore, Serial cannot be used.
  configureTimer();
  configurePins();
}

// Display
// =======

void clearDisplay(const SegmentDisplay &display) {
  digitalWrite(display.A, LOW);
  digitalWrite(display.B, LOW);
  digitalWrite(display.C, LOW);
  digitalWrite(display.D, LOW);
  digitalWrite(display.E, LOW);
  digitalWrite(display.F, LOW);
  digitalWrite(display.G, LOW);
}

void writeDigitToDisplay(const SegmentDisplay &display, uint8_t digit) {
  switch (digit) {
  case 0:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, HIGH);
    digitalWrite(display.E, HIGH);
    digitalWrite(display.F, HIGH);
    digitalWrite(display.G, LOW);
    break;
  case 1:
    digitalWrite(display.A, LOW);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, LOW);
    digitalWrite(display.E, LOW);
    digitalWrite(display.F, LOW);
    digitalWrite(display.G, LOW);
    break;
  case 2:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, LOW);
    digitalWrite(display.D, HIGH);
    digitalWrite(display.E, HIGH);
    digitalWrite(display.F, LOW);
    digitalWrite(display.G, HIGH);
    break;
  case 3:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, HIGH);
    digitalWrite(display.E, LOW);
    digitalWrite(display.F, LOW);
    digitalWrite(display.G, HIGH);
    break;
  case 4:
    digitalWrite(display.A, LOW);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, LOW);
    digitalWrite(display.E, LOW);
    digitalWrite(display.F, HIGH);
    digitalWrite(display.G, HIGH);
    break;
  case 5:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, LOW);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, HIGH);
    digitalWrite(display.E, LOW);
    digitalWrite(display.F, HIGH);
    digitalWrite(display.G, HIGH);
    break;
  case 6:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, LOW);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, HIGH);
    digitalWrite(display.E, HIGH);
    digitalWrite(display.F, HIGH);
    digitalWrite(display.G, HIGH);
    break;
  case 7:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, LOW);
    digitalWrite(display.E, LOW);
    digitalWrite(display.F, LOW);
    digitalWrite(display.G, LOW);
    break;
  case 8:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, HIGH);
    digitalWrite(display.E, HIGH);
    digitalWrite(display.F, HIGH);
    digitalWrite(display.G, HIGH);
    break;
  case 9:
    digitalWrite(display.A, HIGH);
    digitalWrite(display.B, HIGH);
    digitalWrite(display.C, HIGH);
    digitalWrite(display.D, HIGH);
    digitalWrite(display.E, LOW);
    digitalWrite(display.F, HIGH);
    digitalWrite(display.G, HIGH);
    break;
  default:
    clearDisplay(display);
  }
}

// Button events
// =============

void startTimer() {
  timerWrite(timer, 0);
  timerAlarmEnable(timer);
}

void endTimer() {
  timerAlarmDisable(timer);
  digitalWrite(DISPLAY_RIGHT_DP, LOW);
}

void onButtonUp() {
  bool localIsTimerActive = false;
  portENTER_CRITICAL(&timerMutex);
  if (timerSecondsRemaining == 0) {
    timerSecondsRemaining = MAX_DURATION_SECONDS;
  }
  isTimerActive = !isTimerActive;
  localIsTimerActive = isTimerActive;
  portEXIT_CRITICAL(&timerMutex);
  if (localIsTimerActive) {
    startTimer();
  } else {
    endTimer();
  }
}

uint8_t previousButton = LOW;

void pollButton() {
  uint8_t button = digitalRead(BUTTON_INPUT);
  if (previousButton == button) {
    return;
  }
  previousButton = button;
  if (button == LOW) {
    onButtonUp();
  }
}

// Timer events
// ============

uint8_t previousLeftDigit = NO_DIGIT;
uint8_t previousRightDigit = NO_DIGIT;

void writeTimeToDisplay(uint32_t secondsRemaining) {
  uint32_t minutesRemaining = secondsRemaining / 60 + 1;
  uint8_t leftDigit = minutesRemaining / 10;
  uint8_t rightDigit = minutesRemaining % 10;
  if (leftDigit == 0) {
    leftDigit = NO_DIGIT;
  }
  if (leftDigit != previousLeftDigit) {
    writeDigitToDisplay(DISPLAY_LEFT, leftDigit);
  }
  if (rightDigit != previousRightDigit) {
    writeDigitToDisplay(DISPLAY_RIGHT, rightDigit);
  }
  previousLeftDigit = leftDigit;
  previousRightDigit = rightDigit;
}

void blinkLed(uint32_t secondsRemaining) {
  uint8_t light = secondsRemaining % 2 == 0 ? HIGH : LOW;
  digitalWrite(DISPLAY_RIGHT_DP, light);
}

void pollSemaphore() {
  if (xSemaphoreTake(timerSemaphore, 0) == pdTRUE) {
    uint32_t localTimerSecondsRemaining = 0;
    bool localIsTimerActive = false;

    portENTER_CRITICAL(&timerMutex);
    localTimerSecondsRemaining = timerSecondsRemaining;
    localIsTimerActive = isTimerActive;
    portEXIT_CRITICAL(&timerMutex);

    writeTimeToDisplay(localTimerSecondsRemaining);
    blinkLed(localTimerSecondsRemaining);
  }
}

// Loop
// ====

void loop() {
  pollButton();
  pollSemaphore();
}

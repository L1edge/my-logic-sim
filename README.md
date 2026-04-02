Ось твій файл `README.md`, підготовлений одразу трьома мовами: англійською, українською та польською. Ти можеш скопіювати весь цей текст і вставити його у свій репозиторій — на GitHub дуже популярна практика робити багатомовні README (кожна мова йде одна за одною або розділена лінками).

-----

# ⚡ LogicSim - Web-based Digital Logic Simulator

🌎 **Languages:** [English](https://www.google.com/search?q=%23english) | [Українська](https://www.google.com/search?q=%23%D1%83%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0) | [Polski](https://www.google.com/search?q=%23polski)

-----

## \<a id="english"\>\</a\> 🇬🇧 English

**LogicSim** is a modern, cross-platform web environment for automated design, interactive simulation, and analysis of digital logic circuits. The project was created as a lightweight, fast, and accessible alternative to heavyweight desktop EDA (Electronic Design Automation) software like Active-HDL or Quartus.

🎓 *The project was developed as part of a Bachelor's thesis.*

### ✨ Key Features

  * 🖱️ **Interactive Graphical Editor:** Drag-and-Drop circuit building on an infinite canvas (React Flow).
  * ⚙️ **Real-time Simulation:** Discrete-event simulation using optimized bitwise operations. Instant visualization of signal flow (neon wire animation) and gate states.
  * 📦 **Rich Component Library:** Basic logic gates (AND, OR, XOR, NAND, NOR, XNOR, NOT) with a dynamic number of inputs (1 to 8), signal generators, constants, and indicators.
  * 📝 **HDL Export:** Automatic translation of the visual circuit graph into professional structural **Verilog** and **VHDL** code.
  * 🧪 **Testbench Generation:** Automatic creation of an exhaustive Testbench for external verification of the designed circuits.
  * 📈 **Waveform Analyzer:** Built-in diagnostic tool based on HTML5 Canvas for real-time signal timing tracking.
  * 🎨 **Modern UI/UX:** Adaptive UI themes, including a unique "Liquid Glass" theme with frosted glass effects (`backdrop-filter`).
  * 💾 **Project Saving:** Serialization of the graph state into JSON format for saving and sharing circuits.

### 🛠 Tech Stack

  * **Frontend Framework:** React.js (v18+)
  * **State Management:** Zustand (high-performance state management without unnecessary re-renders)
  * **Graph Engine:** React Flow (hardware-accelerated node transformations and rendering)
  * **Styling:** Tailwind CSS + CSS Custom Properties
  * **Build Tool:** Vite
  * **Others:** HTML5 Canvas API (for Waveform), HTML5 Drag-and-Drop API

### 🚀 Installation and Setup (Local Development)

To run the project locally on your computer, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/username/my-logic-sim.git
    cd my-logic-sim
    ```
2.  **Install dependencies:**
    Make sure you have [Node.js](https://www.google.com/search?q=https://nodejs.org/) installed.
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  **Open your browser** and navigate to: `http://localhost:5173`

-----

## \<a id="українська"\>\</a\> 🇺🇦 Українська

**LogicSim** — це сучасне кросплатформне веб-середовище для автоматизованого проєктування, інтерактивного моделювання та аналізу цифрових логічних схем. Проєкт створений як легка, швидка та доступна альтернатива важковаговим десктопним САПР (EDA), таким як Active-HDL чи Quartus.

🎓 *Проєкт розроблено в рамках бакалаврської кваліфікаційної роботи.*

### ✨ Головні можливості

  * 🖱️ **Інтерактивний графічний редактор:** Побудова схем за допомогою Drag-and-Drop на базі нескінченного полотна (React Flow).
  * ⚙️ **Симуляція в реальному часі:** Дискретно-подієве моделювання з використанням оптимізованих побітових операцій. Миттєва візуалізація руху сигналу (неонова анімація дротів) та станів вентилів.
  * 📦 **Багата бібліотека компонентів:** Базові логічні вентилі (AND, OR, XOR, NAND, NOR, XNOR, NOT) з динамічною кількістю входів (від 1 до 8), генератори сигналів, константи та індикатори.
  * 📝 **Експорт у HDL:** Автоматична трансляція візуального графа схеми у професійний структурний код **Verilog** та **VHDL**.
  * 🧪 **Генерація Testbench:** Автоматичне створення вичерпного тестового оточення (Testbench) для зовнішньої верифікації розроблених схем.
  * 📈 **Аналізатор часових діаграм (Waveform):** Вбудований інструмент діагностики на базі HTML5 Canvas для відстеження таймінгів сигналів у реальному часі.
  * 🎨 **Сучасний UI/UX:** Адаптивні теми оформлення, включаючи унікальну тему "Liquid Glass" з ефектами матового скла (`backdrop-filter`).
  * 💾 **Збереження проєктів:** Серіалізація стану графа у формат JSON для збереження та обміну схемами.

### 🛠 Технологічний стек

  * **Frontend Framework:** React.js (v18+)
  * **State Management:** Zustand (високопродуктивне управління станом без зайвих ре-рендерів)
  * **Graph Engine:** React Flow (апаратне прискорення трансформацій та рендерингу вузлів)
  * **Styling:** Tailwind CSS + CSS Custom Properties
  * **Build Tool:** Vite
  * **Others:** HTML5 Canvas API (для Waveform), HTML5 Drag-and-Drop API

### 🚀 Встановлення та запуск (Local Development)

Щоб запустити проєкт локально на вашому комп'ютері, виконайте наступні кроки:

1.  **Клонуйте репозиторій:**
    ```bash
    git clone https://github.com/ВАШ_ЮЗЕРНЕЙМ/my-logic-sim.git
    cd my-logic-sim
    ```
2.  **Встановіть залежності:**
    Переконайтеся, що у вас встановлений [Node.js](https://www.google.com/search?q=https://nodejs.org/).
    ```bash
    npm install
    ```
3.  **Запустіть сервер розробки:**
    ```bash
    npm run dev
    ```
4.  **Відкрийте браузер** і перейдіть за адресою: `http://localhost:5173`

-----

## \<a id="polski"\>\</a\> 🇵🇱 Polski

**LogicSim** to nowoczesne, wieloplatformowe środowisko webowe do zautomatyzowanego projektowania, interaktywnej symulacji i analizy cyfrowych układów logicznych. Projekt powstał jako lekka, szybka i przystępna alternatywa dla ciężkich, desktopowych programów EDA (Electronic Design Automation), takich jak Active-HDL czy Quartus.

🎓 *Projekt został zrealizowany w ramach pracy inżynierskiej / licencjackiej.*

### ✨ Główne możliwości

  * 🖱️ **Interaktywny edytor graficzny:** Budowanie układów metodą Drag-and-Drop na nieskończonym płótnie (React Flow).
  * ⚙️ **Symulacja w czasie rzeczywistym:** Symulacja zdarzeń dyskretnych z wykorzystaniem zoptymalizowanych operacji bitowych. Błyskawiczna wizualizacja przepływu sygnału (neonowa animacja przewodów) i stanów bramek.
  * 📦 **Bogata biblioteka komponentów:** Podstawowe bramki logiczne (AND, OR, XOR, NAND, NOR, XNOR, NOT) z dynamiczną liczbą wejść (od 1 do 8), generatory sygnałów, stałe i wskaźniki.
  * 📝 **Eksport do HDL:** Automatyczne tłumaczenie wizualnego grafu układu na profesjonalny kod strukturalny **Verilog** i **VHDL**.
  * 🧪 **Generowanie Testbench:** Automatyczne tworzenie kompleksowego środowiska testowego (Testbench) do zewnętrznej weryfikacji zaprojektowanych układów.
  * 📈 **Analizator przebiegów czasowych (Waveform):** Wbudowane narzędzie diagnostyczne oparte na HTML5 Canvas do śledzenia synchronizacji sygnałów w czasie rzeczywistym.
  * 🎨 **Nowoczesny UI/UX:** Adaptacyjne motywy interfejsu, w tym unikalny motyw "Liquid Glass" z efektem matowego szkła (`backdrop-filter`).
  * 💾 **Zapisywanie projektów:** Serializacja stanu grafu do formatu JSON w celu zapisywania i udostępniania układów.

### 🛠 Stos technologiczny

  * **Frontend Framework:** React.js (v18+)
  * **State Management:** Zustand (wysokowydajne zarządzanie stanem bez zbędnych ponownych renderowań)
  * **Graph Engine:** React Flow (akceleracja sprzętowa transformacji i renderowania węzłów)
  * **Styling:** Tailwind CSS + CSS Custom Properties
  * **Build Tool:** Vite
  * **Inne:** HTML5 Canvas API (dla Waveform), HTML5 Drag-and-Drop API

### 🚀 Instalacja i uruchomienie (Local Development)

Aby uruchomić projekt lokalnie na swoim komputerze, wykonaj następujące kroki:

1.  **Sklonuj repozytorium:**
    ```bash
    git clone https://github.com/username/my-logic-sim.git
    cd my-logic-sim
    ```
2.  **Zainstaluj zależności:**
    Upewnij się, że masz zainstalowanego [Node.js](https://www.google.com/search?q=https://nodejs.org/).
    ```bash
    npm install
    ```
3.  **Uruchom serwer deweloperski:**
    ```bash
    npm run dev
    ```
4.  **Otwórz przeglądarkę** i przejdź pod adres: `http://localhost:5173`

-----

*Не забудь замінити `ВАШ_ЮЗЕРНЕЙМ` у посиланнях `git clone` на свій логін.*

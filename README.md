# Backlog.gg

Projekt semestralny – Game Tracker / Game Library Manager.

## 📁 Struktura projektu

```
Backlog.gg/
├── .venv/            # virtual environment (nie commitowany)
├── backend/          # Django backend
└── frontend/         # React / Next.js frontend
```

---

## Wymagania wstępne

- Python 3.10+  
- Node.js 18+ (lub LTS)  
- npm lub yarn  

---

## Backend – Django

1. **Utwórz virtual environment** (jeśli jeszcze nie istnieje):

```bash
cd Backlog.gg
python -m venv .venv
```

2. **Aktywuj środowisko**:

- Windows (PowerShell):

```powershell
.\.venv\Scripts\activate
```

- Linux / macOS:

```bash
source .venv/bin/activate
```

3. **Zainstaluj zależności**:

```bash
cd backend
pip install -r requirements.txt
```

4. **Wykonaj migracje bazy danych**:

```bash
python manage.py migrate
```

5. **Uruchom serwer deweloperski**:

```bash
python manage.py runserver
```

Strona backendu dostępna jest pod: [http://127.0.0.1:8000](http://127.0.0.1:8000)

> Plik SQLite (`db.sqlite3`) tworzony jest lokalnie i nie jest commitowany.

---

## ⚛️ Frontend – Next.js

1. Przejdź do folderu frontend:

```bash
cd frontend
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Uruchom serwer deweloperski:

```bash
npm run dev
```

Strona frontendowa dostępna jest pod: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Dodatkowe informacje

- `.venv` oraz pliki środowiskowe `.env` **nie są commitowane** – każdy dev powinien utworzyć własne.  
- Wystarczy:  
  1. Utworzyć `.venv`  
  2. Zainstalować zależności  
  3. Wykonać migracje Django  
  4. Uruchomić backend i frontend  
- Wszystkie zmiany w bazie danych powinny być wykonywane przez **migracje Django** (`makemigrations` + `migrate`) – plik `db.sqlite3` **nie jest commitowany**.

---
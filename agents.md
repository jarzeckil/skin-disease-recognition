# Skin Disease Recognition - Agent Rules & Source of Truth

> **Ten dokument jest absolutnym zrodlem prawdy dla wszystkich AI agentow i narzedzi generujacych kod w tym projekcie.**  
> Kazda generacja kodu MUSI byc zgodna z ponizszymi zasadami.

---

## 1. Architektura Repozytorium (Monorepo)

### 1.1 Struktura katalogow

```
skin-disease-recognition/
├── src/                          # [BACKEND/ML] - NIE MODYFIKOWAC PODCZAS PRAC NAD UI
│   └── skin_disease_recognition/
│       ├── core/                 # Konfiguracja, stale
│       ├── data/                 # Dataset, factory
│       ├── modeling/             # Trening, engine
│       ├── serving/              # FastAPI app (app.py)
│       └── utils/                # Narzedzia pomocnicze
├── models/                       # [ML ARTIFACTS] - NIE MODYFIKOWAC PODCZAS PRAC NAD UI
├── data/                         # [ML DATA] - NIE MODYFIKOWAC PODCZAS PRAC NAD UI
├── outputs/                      # [ML OUTPUTS] - NIE MODYFIKOWAC PODCZAS PRAC NAD UI
├── frontend/                     # [FRONTEND] - CALY KOD UI TRAFIA TUTAJ
│   ├── src/
│   │   ├── components/           # Komponenty React
│   │   ├── hooks/                # Custom hooks (API, logika)
│   │   ├── services/             # Warstwa API (fetch, axios)
│   │   ├── types/                # TypeScript interfaces/types
│   │   ├── utils/                # Funkcje pomocnicze
│   │   └── App.tsx
│   ├── public/
│   ├── dist/                     # Build produkcyjny (serwowany przez backend)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── Dockerfile                    # Wspolny obraz Docker (backend + frontend)
├── docker-compose.yaml
└── pyproject.toml
```

### 1.2 Zasady granic modulow

| Katalog | Dozwolone operacje podczas prac nad UI |
|---------|----------------------------------------|
| `frontend/` | **TAK** - caly kod UI |
| `src/` | **NIE** - tylko odczyt w celach referencyjnych |
| `models/` | **NIE** - artefakty ML |
| `data/` | **NIE** - dane treningowe |
| `outputs/` | **NIE** - wyniki eksperymentow |
| `Dockerfile` | **TAK** - przy integracji frontend buildu |

---

## 2. Stos Technologiczny Frontendu

### 2.1 Wymagane technologie

| Technologia | Wersja | Przeznaczenie |
|-------------|--------|---------------|
| React | 18.x | Biblioteka UI |
| Vite | 5.x | Build tool i dev server |
| TypeScript | 5.x | Typowanie statyczne |
| Tailwind CSS | 3.x | Stylowanie |

### 2.2 Zasady pisania kodu React

```typescript
// POPRAWNIE - Komponent funkcyjny z hookami
const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  
  return <div>...</div>;
};

// NIEPOPRAWNIE - Komponent klasowy
class ImageUploader extends React.Component { } // ZABRONIONE
```

**Wymagania:**
- **TYLKO** komponenty funkcyjne (Function Components)
- **TYLKO** React Hooks do zarzadzania stanem i efektami
- **ZABRONIONE** komponenty klasowe (Class Components)
- **ZABRONIONE** Higher-Order Components (HOC) - preferuj custom hooks
- **WYMAGANE** typowanie TypeScript dla wszystkich props i state

---

## 3. Konfiguracja Srodowiska Deweloperskiego

### 3.1 Architektura produkcyjna vs deweloperska

```
PRODUKCJA (jeden kontener):
┌─────────────────────────────────┐
│         Docker Container        │
│  ┌───────────────────────────┐  │
│  │   Python FastAPI :8000    │  │
│  │   - /predict              │  │
│  │   - /info                 │  │
│  │   - /* (static files)     │◄─┼── frontend/dist/
│  └───────────────────────────┘  │
└─────────────────────────────────┘

DEVELOPMENT (dwa procesy):
┌─────────────────┐     ┌─────────────────┐
│  Vite :5173     │────►│  FastAPI :8000  │
│  (frontend dev) │proxy│  (backend dev)  │
└─────────────────┘     └─────────────────┘
```

### 3.2 Konfiguracja Vite Proxy (WYMAGANE)

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/predict': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/info': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

### 3.3 Zasady URL-i API

```typescript
// POPRAWNIE - wzgledne sciezki
const response = await fetch('/predict', { ... });
const info = await fetch('/info');

// NIEPOPRAWNIE - hardkodowane URL-e
const response = await fetch('http://localhost:8000/predict'); // ZABRONIONE
const response = await fetch('http://api.example.com/predict'); // ZABRONIONE
```

**BEZWZGLEDNIE ZABRONIONE:**
- Hardkodowanie `localhost:8000` w kodzie komponentow
- Hardkodowanie jakichkolwiek pelnych URL-i backendu
- Uzycie zmiennych srodowiskowych dla URL-a API w produkcji (same-origin)

---

## 4. Architektura Kodu Frontendu

### 4.1 Separacja warstw

```
┌─────────────────────────────────────────────────────┐
│                    KOMPONENTY UI                     │
│         (renderowanie, obsluga zdarzen DOM)          │
└─────────────────────────┬───────────────────────────┘
                          │ uzywa
┌─────────────────────────▼───────────────────────────┐
│                   CUSTOM HOOKS                       │
│    (logika biznesowa, zarzadzanie stanem API)        │
└─────────────────────────┬───────────────────────────┘
                          │ wywoluje
┌─────────────────────────▼───────────────────────────┐
│                 WARSTWA SERVICES                     │
│           (fetch/axios, serializacja)                │
└─────────────────────────────────────────────────────┘
```

### 4.2 Przyklad struktury plikow

```
frontend/src/
├── components/
│   ├── ImageUploader/
│   │   ├── ImageUploader.tsx       # Tylko UI
│   │   ├── ImageUploader.types.ts  # Typy props
│   │   └── index.ts                # Export
│   └── PredictionResults/
│       └── ...
├── hooks/
│   ├── usePrediction.ts            # Hook do /predict
│   └── useModelInfo.ts             # Hook do /info
├── services/
│   └── api.ts                      # Funkcje fetch
├── types/
│   ├── api.ts                      # Typy odpowiedzi API
│   └── domain.ts                   # Typy domenowe
└── utils/
    └── validation.ts               # Walidacja plikow
```

### 4.3 Przykladowa implementacja warstw

```typescript
// services/api.ts - WARSTWA SERVICES
export const predictDisease = async (file: File): Promise<PredictionResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/predict', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.status}`);
  }
  
  return response.json();
};

// hooks/usePrediction.ts - CUSTOM HOOK
export const usePrediction = () => {
  const [state, setState] = useState<PredictionState>({
    status: 'idle',
    data: null,
    error: null,
  });

  const predict = async (file: File) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await predictDisease(file);
      setState({ status: 'success', data, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: error as Error });
    }
  };

  return { ...state, predict };
};

// components/ImageUploader.tsx - KOMPONENT UI
const ImageUploader: React.FC = () => {
  const { status, data, error, predict } = usePrediction();
  
  // Komponent TYLKO renderuje UI i wywoluje predict()
  // NIE zawiera logiki fetch ani obslugi bledow API
};
```

---

## 5. Kontrakty API (Source of Truth)

### 5.1 POST /predict

**Request:**
```
Content-Type: multipart/form-data

FormData:
  - key: "file"
  - value: File (image/jpeg, image/png, image/webp)
```

**Response (200 OK):**
```typescript
interface PredictionResponse {
  predictions: Record<string, number>;
}
```

```json
{
  "predictions": {
    "Acne": 0.00966980867087841,
    "Actinic_Keratosis": 0.02458641491830349,
    "Benign_tumors": 0.005707488860934973,
    "Eczema": 0.012345678901234567,
    "...": "..."
  }
}
```

**Typy TypeScript:**
```typescript
// types/api.ts
export interface PredictionResponse {
  predictions: Record<string, number>;
}

// Opcjonalnie - bardziej restrykcyjne typowanie
export interface PredictionResponse {
  predictions: {
    [diseaseName: string]: number; // Wartosc 0.0 - 1.0 (prawdopodobienstwo)
  };
}
```

### 5.2 GET /info

**Request:**
```
GET /info
(brak body)
```

**Response (200 OK):**
```typescript
interface ModelInfoResponse {
  model_name: string;
  model_version: string;
}
```

```json
{
  "model_name": "EFFICIENTNET-B0",
  "model_version": "v1.0.0"
}
```

**Typy TypeScript:**
```typescript
// types/api.ts
export interface ModelInfoResponse {
  model_name: string;
  model_version: string;
}
```

### 5.3 GET /report

**Request:**
```
GET /report
(brak body)
```

**Response (200 OK):**
```typescript
interface ClassMetricsData {
  precision: number;
  recall: number;
  'f1-score': number;
  support: number;
}

interface ClassificationReportResponse {
  [className: string]: ClassMetricsData;
  // Zawiera rowniez klucze specjalne:
  // 'accuracy': number
  // 'macro avg': ClassMetricsData
  // 'weighted avg': ClassMetricsData
}
```

```json
{
  "Acne": {
    "precision": 0.897,
    "recall": 0.938,
    "f1-score": 0.917,
    "support": 65.0
  },
  "Eczema": {
    "precision": 0.766,
    "recall": 0.759,
    "f1-score": 0.762,
    "support": 112.0
  },
  "accuracy": 0.806,
  "macro avg": {
    "precision": 0.783,
    "recall": 0.783,
    "f1-score": 0.781,
    "support": 1546.0
  },
  "weighted avg": {
    "precision": 0.808,
    "recall": 0.806,
    "f1-score": 0.805,
    "support": 1546.0
  }
}
```

**Typy TypeScript:**
```typescript
// types/api.ts
export interface ClassMetricsData {
  precision: number;
  recall: number;
  'f1-score': number;
  support: number;
}

export interface ClassificationReportResponse {
  [className: string]: ClassMetricsData;
}
```

---

## 6. Obsluga Stanow i Bledow

### 6.1 Wymagane stany dla operacji API

Kazdy custom hook obslugujacy API MUSI implementowac nastepujace stany:

```typescript
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface ApiState<T> {
  status: RequestStatus;
  data: T | null;
  error: Error | null;
}
```

**Przyklad implementacji:**
```typescript
// hooks/usePrediction.ts
export const usePrediction = () => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const predict = async (file: File) => {
    setStatus('loading');
    setData(null);
    setError(null);

    try {
      const result = await predictDisease(file);
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setData(null);
    setError(null);
  };

  return { status, data, error, predict, reset };
};
```

### 6.2 Wymagana walidacja plikow (Client-Side)

**PRZED wyslaniem zadania na `/predict` WYMAGANA jest walidacja:**

```typescript
// utils/validation.ts

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validateImageFile = (file: File): ValidationResult => {
  // Walidacja typu MIME
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return {
      isValid: false,
      error: `Niedozwolony typ pliku: ${file.type}. Dozwolone: JPEG, PNG, WebP.`,
    };
  }

  // Walidacja rozmiaru
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Plik jest za duzy (${(file.size / 1024 / 1024).toFixed(2)} MB). Maksymalny rozmiar: ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { isValid: true, error: null };
};
```

**Uzycie w komponencie:**
```typescript
const handleFileSelect = (file: File) => {
  const validation = validateImageFile(file);
  
  if (!validation.isValid) {
    setValidationError(validation.error);
    return;
  }
  
  // Dopiero po walidacji wywolaj API
  predict(file);
};
```

---

## 7. Checklist dla Agentow AI

Przed wygenerowaniem JAKIEGOKOLWIEK kodu, agent MUSI zweryfikowac:

### 7.1 Struktura plikow
- [ ] Kod UI trafia WYLACZNIE do `frontend/`
- [ ] NIE modyfikuje plikow w `src/`, `models/`, `data/`, `outputs/`
- [ ] Nowe komponenty maja wlasciwa strukture folderow

### 7.2 Kod React
- [ ] Uzywa TYLKO komponentow funkcyjnych
- [ ] Uzywa TYLKO React Hooks
- [ ] Wszystkie props i state sa otypowane (TypeScript)
- [ ] NIE uzywa komponentow klasowych ani HOC

### 7.3 Architektura
- [ ] Logika API jest w custom hookach (NIE w komponentach)
- [ ] Wywolania fetch sa w warstwie services
- [ ] Typy API sa w `types/api.ts`

### 7.4 API i CORS
- [ ] URL-e API sa WZGLEDNE (`/predict`, `/info`)
- [ ] NIE zawiera hardkodowanych `localhost` ani pelnych URL-i
- [ ] Vite proxy jest skonfigurowane dla endpointow API

### 7.5 Obsluga stanow
- [ ] Hook API obsluguje stany: `idle`, `loading`, `success`, `error`
- [ ] Bledy sa przechwytywane i przechowywane w stanie
- [ ] Komponent wyswietla odpowiedni UI dla kazdego stanu

### 7.6 Walidacja
- [ ] Walidacja typu pliku (JPEG, PNG, WebP) PRZED wyslaniem
- [ ] Walidacja rozmiaru pliku PRZED wyslaniem
- [ ] Komunikaty bledow walidacji sa wyswietlane uzytkownikowi

---

## 8. Przyklady Blednych Implementacji (ZABRONIONE)

### 8.1 Hardkodowane URL-e
```typescript
// NIEPOPRAWNIE
fetch('http://localhost:8000/predict', { ... });
fetch(`${process.env.REACT_APP_API_URL}/predict`, { ... }); // niepotrzebne na produkcji

// POPRAWNIE
fetch('/predict', { ... });
```

### 8.2 Logika API w komponencie
```typescript
// NIEPOPRAWNIE - logika fetch w komponencie
const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    const response = await fetch('/predict', { ... }); // ZABRONIONE w komponencie
    // ...
  };
};

// POPRAWNIE - uzycie custom hooka
const MyComponent = () => {
  const { status, predict } = usePrediction();
  
  const handleSubmit = () => {
    predict(file); // Hook obsluguje cala logike
  };
};
```

### 8.3 Brak walidacji przed wyslaniem
```typescript
// NIEPOPRAWNIE - brak walidacji
const handleUpload = (file: File) => {
  predict(file); // Od razu wysyla!
};

// POPRAWNIE - walidacja przed wyslaniem
const handleUpload = (file: File) => {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    setError(validation.error);
    return;
  }
  predict(file);
};
```

### 8.4 Komponent klasowy
```typescript
// NIEPOPRAWNIE
class ImageUploader extends React.Component {
  render() { ... }
}

// POPRAWNIE
const ImageUploader: React.FC<Props> = ({ ... }) => {
  return ...;
};
```

---

## 9. Referencje Backend

> **Uwaga:** Ponizsze informacje sluza WYLACZNIE jako referencja.  
> NIE MODYFIKUJ tych plikow podczas prac nad frontendem.

### 9.1 Lokalizacja serwera API
- **Plik:** `src/skin_disease_recognition/serving/app.py`
- **Framework:** FastAPI
- **Port produkcyjny:** 8000

### 9.2 Istniejace endpointy
| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/predict` | POST | Klasyfikacja obrazu choroby skory |
| `/info` | GET | Informacje o modelu i metryki |
| `/report` | GET | Classification report - metryki per klasa |

### 9.3 Dockerfile (do rozszerzenia o frontend)
- **Plik:** `Dockerfile`
- **Obecna konfiguracja:** Tylko backend
- **Do dodania:** Multi-stage build z frontendem

---

## 10. Wersjonowanie tego dokumentu

| Wersja | Data | Autor | Zmiany |
|--------|------|-------|--------|
| 1.0.0 | 2026-02-24 | Principal Engineer | Inicjalna wersja |

---

**Ten dokument jest wiazacy dla wszystkich agentow AI pracujacych nad tym projektem.**

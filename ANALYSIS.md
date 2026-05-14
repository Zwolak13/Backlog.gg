# Analiza inżynierska systemu Backlog.gg

## 1. System Overview

### Cel systemu

Backlog.gg jest aplikacją webową do katalogowania, oceniania i przeglądania gier wideo. System pełni rolę serwisu podobnego do IMDb/Filmweb, ale skoncentrowanego na grach: użytkownik może odkrywać gry, sprawdzać szczegóły, dodawać tytuły do własnej biblioteki, oznaczać status ukończenia, wystawiać oceny oraz obserwować aktywność znajomych.

### Główne funkcje

- Rejestracja, logowanie, wylogowanie i obsługa bieżącej sesji użytkownika.
- Zarządzanie profilem: nazwa użytkownika, avatar, bio, hasło, usunięcie konta.
- Przeglądanie gier z danych zewnętrznych Steam.
- Wyszukiwanie gier z paginacją i filtrem bezpiecznej zawartości.
- Wyświetlanie szczegółów gry: opis, gatunki, platformy, screeny, cena, wydawcy, deweloperzy, Metacritic.
- Zarządzanie osobistą biblioteką gier.
- Statusy gry w bibliotece: `backlog`, `playing`, `completed`, `wishlist`.
- Ocena gry przez użytkownika w skali 1-10.
- Oznaczanie gry jako ulubionej.
- Statystyki biblioteki użytkownika.
- Publiczny profil i publiczna biblioteka użytkownika.
- Relacje społeczne: znajomi, zaproszenia do znajomych, lista znajomych.
- Aktywność znajomych: dodanie gry, ocena gry, dodanie do ulubionych.
- Podgląd ocen znajomych dla konkretnej gry.
- Oferty i bundle gier z integracją Steam oraz GG.deals.
- Obecność online przez WebSocket.

### Granice systemu

- Frontend działa jako aplikacja Next.js i prezentuje interfejs użytkownika.
- Backend Django udostępnia API REST, autoryzację sesyjną, logikę domenową i integracje zewnętrzne.
- Baza SQLite przechowuje użytkowników, gry zapisane lokalnie, wpisy biblioteki oraz relacje znajomych.
- System nie przechowuje pełnego katalogu Steam; pobiera dane na żądanie z API Steam.
- System nie zawiera obecnie pełnych recenzji tekstowych, komentarzy, moderacji treści ani ról innych niż standardowy użytkownik/admin Django.

## 2. Aktorzy

### Aktorzy ludzcy

- Gość:
  - przegląda publiczne dane, ekran logowania/rejestracji i publiczne profile;
  - może rozpocząć rejestrację lub logowanie.
- Zarejestrowany użytkownik:
  - zarządza profilem;
  - wyszukuje i przegląda gry;
  - dodaje gry do biblioteki;
  - zmienia status gry;
  - ocenia gry;
  - oznacza gry jako ulubione;
  - przegląda statystyki i aktywność;
  - zarządza znajomymi.
- Administrator Django:
  - ma dostęp do panelu `/admin/`;
  - zarządza danymi modeli Django;
  - pełni techniczną rolę utrzymaniową, bez rozbudowanego modułu moderacji domenowej.
- Moderator, aktor inferowany:
  - nie jest zaimplementowany jako osobna rola;
  - logicznie potrzebny dla systemu typu IMDb/Filmweb w przypadku dodania recenzji, komentarzy i zgłoszeń treści.

### Systemy zewnętrzne

- Steam Store API:
  - wyszukiwanie gier;
  - sekcje wyróżnione;
  - szczegóły gry;
  - obrazy okładek i screeny.
- GG.deals API:
  - ceny, promocje i bundle;
  - wykorzystywane warunkowo przez `GG_DEALS_API_KEY`.
- DiceBear:
  - generowanie domyślnych avatarów w frontendzie.

## 3. Use Cases

| Nazwa przypadku użycia | Aktor | Krótki opis |
|---|---|---|
| Rejestracja konta | Gość | Utworzenie konta użytkownika na podstawie nazwy, e-maila i hasła. |
| Logowanie | Gość | Uwierzytelnienie użytkownika i utworzenie sesji Django. |
| Wylogowanie | Użytkownik | Zakończenie sesji użytkownika. |
| Pobranie bieżącego użytkownika | Użytkownik | Odczyt danych zalogowanego użytkownika. |
| Aktualizacja profilu | Użytkownik | Zmiana nazwy, bio i adresu avatara. |
| Zmiana hasła | Użytkownik | Zmiana hasła po podaniu aktualnego hasła. |
| Usunięcie konta | Użytkownik | Trwałe usunięcie konta i danych zależnych. |
| Przeglądanie katalogu gier | Gość/Użytkownik | Pobranie sekcji Steam: top sellers, new releases, specials, coming soon. |
| Wyszukiwanie gry | Gość/Użytkownik | Wyszukanie gier po frazie z paginacją i filtrem safe mode. |
| Wyświetlenie szczegółów gry | Gość/Użytkownik | Pobranie danych szczegółowych gry po identyfikatorze Steam appid. |
| Dodanie gry do biblioteki | Użytkownik | Utworzenie wpisu `UserGame` dla użytkownika i gry. |
| Aktualizacja wpisu biblioteki | Użytkownik | Zmiana statusu, oceny, ulubionych lub godzin gry. |
| Usunięcie gry z biblioteki | Użytkownik | Usunięcie wpisu `UserGame`. |
| Sprawdzenie obecności gry w bibliotece | Użytkownik | Weryfikacja, czy dana gra jest już przypisana do użytkownika. |
| Wyświetlenie statystyk biblioteki | Użytkownik | Zliczenie gier według statusów. |
| Wyświetlenie publicznej biblioteki | Gość/Użytkownik | Odczyt biblioteki innego użytkownika. |
| Dodanie znajomego bezpośrednio | Użytkownik | Utworzenie relacji `Friendship` z innym użytkownikiem. |
| Wysłanie zaproszenia do znajomych | Użytkownik | Utworzenie rekordu `FriendRequest` ze statusem `pending`. |
| Akceptacja zaproszenia | Użytkownik | Zmiana statusu zaproszenia na `accepted` i utworzenie relacji znajomości. |
| Odrzucenie zaproszenia | Użytkownik | Zmiana statusu zaproszenia na `declined`. |
| Przeglądanie znajomych | Użytkownik/Gość | Odczyt listy znajomych własnej lub publicznej. |
| Wyszukiwanie użytkowników | Użytkownik | Wyszukanie użytkowników po nazwie i sprawdzenie relacji społecznej. |
| Przeglądanie aktywności znajomych | Użytkownik | Pobranie ostatnich akcji znajomych na podstawie wpisów biblioteki. |
| Podgląd ocen znajomych | Użytkownik | Sprawdzenie, jak znajomi ocenili konkretną grę. |
| Podgląd promocji i bundli | Użytkownik | Pobranie ofert z integracji Steam/GG.deals. |
| Monitorowanie obecności online | Użytkownik | Otrzymywanie listy online przez WebSocket. |

## 4. Functional Requirements

### Uwierzytelnianie i konto

- System powinien umożliwiać rejestrację użytkownika z unikalnym adresem e-mail.
- System powinien umożliwiać logowanie za pomocą nazwy użytkownika i hasła.
- System powinien utrzymywać sesję użytkownika za pomocą mechanizmu sesji Django.
- System powinien udostępniać token CSRF przed operacjami modyfikującymi dane.
- System powinien umożliwiać wylogowanie użytkownika.
- System powinien umożliwiać pobranie danych aktualnie zalogowanego użytkownika.
- System powinien umożliwiać zmianę bio, avatara i nazwy użytkownika.
- System powinien umożliwiać zmianę hasła po weryfikacji starego hasła.
- System powinien umożliwiać trwałe usunięcie konta.

### Gry i katalog

- System powinien umożliwiać przeglądanie sekcji gier pobranych ze Steam.
- System powinien umożliwiać wyszukiwanie gier po frazie.
- System powinien obsługiwać paginację wyników wyszukiwania.
- System powinien filtrować treści potencjalnie nieodpowiednie, gdy aktywny jest safe mode.
- System powinien umożliwiać pobranie szczegółów gry po identyfikatorze Steam.
- System powinien zwracać dane gry w jednolitym formacie niezależnie od źródła.
- System powinien korzystać z lokalnego modelu `Game` jako zapisu gier dodanych do bibliotek.

### Biblioteka użytkownika

- System powinien umożliwiać dodanie gry do biblioteki użytkownika.
- System powinien wymagać podania `game_id` i statusu przy dodawaniu gry.
- System powinien uniemożliwiać duplikację tej samej gry w bibliotece jednego użytkownika.
- System powinien umożliwiać zmianę statusu gry.
- System powinien obsługiwać statusy: backlog, playing, completed, wishlist.
- System powinien umożliwiać zapis oceny użytkownika dla gry.
- System powinien umożliwiać oznaczenie gry jako ulubionej.
- System powinien umożliwiać zapis liczby godzin gry.
- System powinien umożliwiać usunięcie gry z biblioteki.
- System powinien umożliwiać filtrowanie biblioteki po statusie.
- System powinien udostępniać statystyki liczby gier według statusów.
- System powinien udostępniać listę ostatnio aktualizowanych gier.
- System powinien udostępniać listę ulubionych gier.

### Profile i funkcje społeczne

- System powinien udostępniać publiczny profil użytkownika.
- System powinien udostępniać publiczną bibliotekę użytkownika.
- System powinien umożliwiać wyszukiwanie użytkowników po nazwie.
- System powinien informować o relacji z wyszukanym użytkownikiem: brak, znajomy, zaproszenie wysłane, zaproszenie odebrane.
- System powinien umożliwiać wysłanie zaproszenia do znajomych.
- System powinien uniemożliwiać wysłanie zaproszenia do samego siebie.
- System powinien uniemożliwiać wysłanie zaproszenia do istniejącego znajomego.
- System powinien umożliwiać akceptację zaproszenia.
- System powinien umożliwiać odrzucenie zaproszenia.
- System powinien umożliwiać usunięcie znajomego.
- System powinien umożliwiać pobranie aktywności znajomych.
- System powinien umożliwiać pobranie ocen znajomych dla konkretnej gry.
- System powinien udostępniać obecność online przez WebSocket dla zalogowanych użytkowników.

### Dashboard i integracje zewnętrzne

- System powinien pobierać aktualne promocje gier.
- System powinien pobierać bundle gier, jeśli dostępna jest konfiguracja GG.deals.
- System powinien degradować działanie integracji zewnętrznych bez zatrzymywania głównej aplikacji.
- System powinien ograniczać limity danych dashboardu do kontrolowanego maksimum.

### Wymagania inferowane dla systemu typu IMDb/Filmweb

- System powinien umożliwiać tworzenie recenzji tekstowych dla gier.
- System powinien umożliwiać komentowanie recenzji lub stron gier.
- System powinien umożliwiać tworzenie własnych list gier, np. top 10, planowane, ukończone w danym roku.
- System powinien umożliwiać agregację ocen użytkowników na poziomie gry.
- System powinien umożliwiać zgłaszanie treści do moderacji.

## 5. Non-Functional Requirements

### Performance

- Odpowiedzi API dla biblioteki powinny wykorzystywać `select_related("game")`, aby ograniczać liczbę zapytań SQL.
- Wyszukiwanie Steam powinno obsługiwać paginację i limit wyników, obecnie `PAGE_SIZE = 40`.
- Endpointy dashboardu powinny ograniczać liczbę zwracanych rekordów, obecnie maksymalnie 24 promocje, 18 bundli i 50 aktywności.
- Frontend powinien stosować ładowanie asynchroniczne, skeletony i ograniczone porcje danych.
- Integracje Steam/GG.deals powinny mieć timeouty, obecnie 10 sekund.

### Scalability

- SQLite jest wystarczające dla środowiska lokalnego/semestralnego, ale produkcyjnie powinno zostać zastąpione PostgreSQL.
- Warstwa WebSocket nie powinna używać `InMemoryChannelLayer` w środowisku wieloinstancyjnym; produkcyjnie wymagany jest Redis Channel Layer.
- Dane zewnętrzne Steam powinny być cache'owane, aby zmniejszyć opóźnienia i zależność od API zewnętrznego.
- Często odczytywane agregaty, np. średnia ocena gry, powinny być obliczane okresowo lub materializowane.
- Integracje cenowe powinny być wykonywane przez zadania asynchroniczne, np. Celery/RQ, zamiast blokować request.

### Security

- System powinien wymagać uwierzytelnienia dla operacji na bibliotece, profilu i znajomych.
- System powinien używać CSRF dla mutacji wykonywanych przez sesję Django.
- System powinien ograniczać CORS do zaufanych originów.
- Hasła powinny być przechowywane wyłącznie przez mechanizm hashujący Django.
- Endpointy publiczne nie powinny ujawniać adresu e-mail użytkownika.
- Produkcyjnie `DEBUG` powinno być wyłączone, `SECRET_KEY` powinien pochodzić ze zmiennych środowiskowych, a `ALLOWED_HOSTS` nie powinno być `["*"]`.
- System powinien walidować zakres oceny, np. 1-10, po stronie backendu.
- System powinien walidować status biblioteki zgodnie z `STATUS_CHOICES`.
- System powinien wprowadzić rate limiting dla logowania, rejestracji i wyszukiwania.

### Usability

- Interfejs powinien umożliwiać szybkie wyszukiwanie gier i szybkie dodanie do biblioteki.
- System powinien dawać natychmiastową informację zwrotną przez toasty.
- Dashboard powinien prezentować istotne sygnały: promocje, aktywność znajomych, rekomendacje.
- Profil powinien jasno rozdzielać gry, bibliotekę, aktywność, statystyki i znajomych.
- Safe mode powinien być łatwo dostępny w preferencjach i zapamiętywany lokalnie.

## 6. Domain Model (for Class Diagram)

### User

Attributes:

- `id: Integer`
- `username: String`
- `email: Email`
- `password: HashedPassword`
- `avatar_url: URL?`
- `bio: Text`
- `created_at: DateTime`
- `is_staff: Boolean`
- `is_superuser: Boolean`

Relationships:

- `User 1..* UserGame`
- `User 1..* FriendRequest` jako nadawca
- `User 1..* FriendRequest` jako odbiorca
- `User 1..* Friendship` jako `from_user`
- `User 1..* Friendship` jako `to_user`
- `User 1..* Review` inferowane
- `User 1..* Comment` inferowane
- `User 1..* GameList` inferowane

### Game

Attributes:

- `id: Integer` - identyfikator Steam appid
- `slug: Slug`
- `name: String`
- `background_image: URL?`
- `released: Date?`
- `metacritic: Integer?`
- `updated_at: DateTime`

Relationships:

- `Game 1..1 GameDetailsCache`
- `Game 1..* UserGame`
- `Game 1..* Review` inferowane
- `Game 1..* Comment` inferowane
- `Game *..* GameList` inferowane przez `GameListItem`
- `Game *..* Genre` inferowane
- `Game *..* Platform` inferowane
- `Game *..* Company` inferowane jako developer/publisher

### GameDetailsCache

Attributes:

- `id: Integer`
- `raw_json: JSON`
- `updated_at: DateTime`

Relationships:

- `GameDetailsCache 1..1 Game`

Uwagi:

- Model istnieje w kodzie, ale aktualny flow szczegółów gry pobiera dane bezpośrednio ze Steam i nie zapisuje cache w widoku.

### UserGame

Attributes:

- `id: Integer`
- `status: Enum(backlog, playing, completed, wishlist)`
- `rating: Integer?`
- `is_favourite: Boolean`
- `hours_played: Float?`
- `created_at: DateTime`
- `updated_at: DateTime`

Relationships:

- `UserGame *..1 User`
- `UserGame *..1 Game`

Constraints:

- `unique(user, game)`
- `rating` logicznie powinien mieć zakres 1-10.
- `hours_played` logicznie powinno być `>= 0`.

### Friendship

Attributes:

- `id: Integer`
- `created_at: DateTime`

Relationships:

- `Friendship *..1 User` jako `from_user`
- `Friendship *..1 User` jako `to_user`

Constraints:

- `unique(from_user, to_user)`

Uwagi:

- Po akceptacji zaproszenia system tworzy dwie relacje kierunkowe, aby odwzorować znajomość jako relację obustronną.

### FriendRequest

Attributes:

- `id: Integer`
- `status: Enum(pending, accepted, declined)`
- `created_at: DateTime`

Relationships:

- `FriendRequest *..1 User` jako `from_user`
- `FriendRequest *..1 User` jako `to_user`

Constraints:

- `unique(from_user, to_user)`

### Review, inferowane

Attributes:

- `id: Integer`
- `title: String`
- `body: Text`
- `rating: Integer?`
- `spoiler: Boolean`
- `status: Enum(draft, published, hidden, deleted)`
- `created_at: DateTime`
- `updated_at: DateTime`

Relationships:

- `Review *..1 User`
- `Review *..1 Game`
- `Review 1..* Comment`
- `Review 1..* ModerationReport`

### Comment, inferowane

Attributes:

- `id: Integer`
- `body: Text`
- `status: Enum(visible, hidden, deleted)`
- `created_at: DateTime`
- `updated_at: DateTime`

Relationships:

- `Comment *..1 User`
- `Comment *..1 Game` albo `Comment *..1 Review`
- `Comment 0..1 Comment` jako komentarz nadrzędny

### GameList, inferowane

Attributes:

- `id: Integer`
- `name: String`
- `description: Text?`
- `visibility: Enum(public, private, friends)`
- `created_at: DateTime`
- `updated_at: DateTime`

Relationships:

- `GameList *..1 User`
- `GameList 1..* GameListItem`

### GameListItem, inferowane

Attributes:

- `id: Integer`
- `position: Integer`
- `note: Text?`
- `created_at: DateTime`

Relationships:

- `GameListItem *..1 GameList`
- `GameListItem *..1 Game`

### ModerationReport, inferowane

Attributes:

- `id: Integer`
- `target_type: Enum(review, comment, profile, game)`
- `target_id: Integer`
- `reason: String`
- `status: Enum(open, accepted, rejected)`
- `created_at: DateTime`
- `resolved_at: DateTime?`

Relationships:

- `ModerationReport *..1 User` jako zgłaszający
- `ModerationReport *..1 User` jako moderator, opcjonalnie

## 7. System Architecture

### Architektura wysokiego poziomu

System ma architekturę warstwową:

- Frontend:
  - Next.js 16;
  - React 19;
  - Tailwind v4;
  - shadcn/ui;
  - route handlers jako proxy do Django.
- Backend:
  - Django 6;
  - Django REST Framework;
  - Django sessions i CSRF;
  - Django Channels dla obecności online.
- Baza danych:
  - SQLite;
  - modele domenowe w aplikacjach `users` i `games`.
- Integracje:
  - Steam Store API;
  - GG.deals API;
  - DiceBear po stronie frontendowej.

### Komponenty backendu

#### `config`

Responsibilities:

- konfiguracja Django;
- routing HTTP;
- routing ASGI/WebSocket;
- konfiguracja CORS, CSRF, sesji i DRF.

Interactions:

- dołącza `users.auth_urls`, `users.profile_urls`, `games.urls`;
- przekierowuje WebSocket `/ws/presence/` do `PresenceConsumer`.

#### `users`

Responsibilities:

- model użytkownika;
- rejestracja, logowanie, wylogowanie;
- profil użytkownika;
- zmiana hasła;
- usunięcie konta;
- znajomi i zaproszenia;
- obecność online.

Interactions:

- korzysta z sesji Django;
- udostępnia API pod `/api/auth/` oraz `/api/user/`;
- udostępnia dane użytkownika dla `games`, np. w relacji `UserGame`.

#### `games`

Responsibilities:

- lokalny model gry;
- wpisy biblioteki użytkownika;
- wyszukiwanie i szczegóły gier;
- statystyki biblioteki;
- publiczne biblioteki;
- aktywność znajomych;
- integracje Steam i GG.deals.

Interactions:

- korzysta z `users.friendships.get_friend_ids`;
- pobiera dane zewnętrzne przez `requests`;
- udostępnia API pod `/api/games/`.

### Komponenty frontendu

#### `app/(auth)`

Responsibilities:

- strony logowania i rejestracji.

Interactions:

- używa `lib/api.ts`;
- pobiera CSRF i wykonuje POST do Django.

#### `app/dashboard`

Responsibilities:

- główny obszar aplikacji po zalogowaniu;
- dashboard, gry, profil, ustawienia.

Interactions:

- pobiera dane przez `/api/...` Next.js;
- używa komponentów `components/dashboard` i hooków `hooks`.

#### `app/api`

Responsibilities:

- proxy między frontendem a Django;
- przekazywanie cookies `sessionid` i `csrftoken`;
- dołączanie `X-CSRFToken` dla mutacji;
- normalizacja błędów backendu.

Interactions:

- odczytuje cookies przez `next/headers`;
- komunikuje się z `DJANGO_API_URL`.

#### `hooks`

Responsibilities:

- stan danych profilu, biblioteki, statystyk i obecności online.

Interactions:

- `usePresence` łączy się z WebSocket `/ws/presence/`;
- `useLibrary` pobiera wpisy biblioteki i statystyki.

## 8. Data Flow / Key Processes

### Flow 1: Dodanie lub aktualizacja gry w bibliotece

1. Użytkownik otwiera stronę szczegółów gry `/dashboard/games/{appid}`.
2. Frontend pobiera szczegóły gry przez `GET /api/games/{appid}`.
3. Route handler Next.js przekazuje zapytanie do Django `GET /api/games/{appid}/`.
4. Backend pobiera dane ze Steam przez `steam.get_game_details(appid)`.
5. Frontend sprawdza stan biblioteki przez `GET /api/games/library/check/{gameId}`.
6. Użytkownik wybiera status, opcjonalnie ocenę i ulubione.
7. Frontend wysyła `POST /api/games/library` z `game_id`, statusem i metadanymi gry.
8. Next.js proxy przekazuje cookies i CSRF do Django.
9. Django wykonuje `Game.objects.get_or_create(...)`.
10. Django wykonuje `UserGame.objects.update_or_create(user, game, defaults=...)`.
11. Backend zwraca serializowany `UserGame`.
12. Frontend aktualizuje lokalny stan i pokazuje toast sukcesu.

### Flow 2: Wyszukiwanie i przeglądanie gier

1. Użytkownik otwiera stronę `/dashboard/games`.
2. Frontend bez frazy wyszukiwania wysyła `GET /api/games?safe=1`.
3. Django rozpoznaje tryb browse i wywołuje `steam.get_featured_sections`.
4. Steam API zwraca sekcje wyróżnione.
5. Backend filtruje DLC, edycje i treści adult, jeżeli safe mode jest aktywny.
6. Backend zwraca sekcje: top sellers, new releases, specials, coming soon.
7. Frontend renderuje carousel i półki gier.
8. Po wpisaniu frazy frontend wysyła `GET /api/games?q={query}&page={page}&safe=1`.
9. Django wywołuje `steam.search_games`.
10. Backend zwraca wyniki i flagę `has_more`.
11. Frontend używa `IntersectionObserver`, aby pobrać kolejne strony wyników.

### Flow 3: Zaproszenie do znajomych i aktywność społeczna

1. Użytkownik wyszukuje innego użytkownika przez `GET /api/user/search?q={text}`.
2. Backend zwraca użytkowników wraz z relacją: `none`, `friend`, `request_sent`, `request_received`.
3. Użytkownik wysyła zaproszenie przez `POST /api/user/friends/request/send`.
4. Backend sprawdza, czy użytkownik nie zaprasza siebie i czy nie istnieje już relacja.
5. Backend tworzy lub aktualizuje `FriendRequest` ze statusem `pending`.
6. Odbiorca pobiera zaproszenia przez `GET /api/user/friends/requests`.
7. Odbiorca akceptuje zaproszenie przez `POST /api/user/friends/request/{id}/accept`.
8. Backend zmienia status zaproszenia na `accepted`.
9. Backend tworzy dwie relacje `Friendship`, po jednej dla każdego kierunku.
10. Dashboard zalogowanego użytkownika pobiera `GET /api/dashboard/activity`.
11. Django pobiera identyfikatory znajomych i ich wpisy `UserGame`.
12. Backend generuje zdarzenia aktywności: dodanie do biblioteki, ocena, ulubione.
13. Frontend prezentuje najnowsze zdarzenia znajomych.

## 9. Mapping to Design Questions

### Czy system powinien analizować treść na poziomie obiektu czy całej encji?

System powinien analizować treść na poziomie obiektu domenowego. Obecnie podstawowym obiektem jest `UserGame`, a nie tylko cała encja `Game`. Ocena, status, ulubione i godziny gry są zależne od użytkownika, więc analiza globalna gry nie wystarcza. Dla przyszłych recenzji i komentarzy analiza powinna dotyczyć konkretnych obiektów `Review` i `Comment`.

### Czy powinna istnieć wielopoziomowa ewaluacja?

Tak. Aktualnie istnieje ocena numeryczna użytkownika oraz zewnętrzny wynik `metacritic`. Dla systemu typu IMDb/Filmweb warto rozdzielić:

- ocenę użytkownika;
- średnią ocen użytkowników;
- ocenę krytyków lub źródeł zewnętrznych;
- sentyment recenzji tekstowych;
- status moderacji treści.

### Czy system powinien porównywać wiele źródeł?

Tak. System już korzysta z wielu źródeł: Steam dla katalogu i szczegółów, GG.deals dla cen oraz Metacritic jako zewnętrzny wynik krytyczny. W modelu docelowym należy porównywać oceny użytkowników, oceny znajomych, Metacritic oraz ewentualne dane z innych agregatorów.

### Czy powinien istnieć audit/logging?

Tak. Aktualnie aktywność znajomych jest inferowana z pól `created_at` i `updated_at` w `UserGame`, ale nie istnieje trwały dziennik zdarzeń. Dla systemu produkcyjnego należy dodać `ActivityLog` lub `AuditLog` dla operacji: zmiana oceny, zmiana statusu, usunięcie wpisu, zmiana profilu, akcje moderacyjne i logowanie.

### Czy role powinny mieć hierarchiczne uprawnienia?

Tak, jeśli system zostanie rozszerzony o recenzje, komentarze i moderację. Obecnie wystarczają role Django: użytkownik, staff, superuser. Dla docelowego systemu należy rozważyć hierarchię:

- Gość;
- Użytkownik;
- Zweryfikowany użytkownik;
- Moderator;
- Administrator;
- Superadministrator.

Uprawnienia powinny obejmować zarządzanie treściami, ukrywanie recenzji, blokowanie kont i zarządzanie słownikami domenowymi.

## 10. Suggestions for UML Diagrams

### Use Case Diagram

Diagram powinien zawierać aktorów:

- Gość;
- Zarejestrowany użytkownik;
- Administrator;
- Moderator, jako aktor docelowy;
- Steam API;
- GG.deals API.

Diagram powinien zawierać przypadki użycia:

- rejestracja;
- logowanie;
- zarządzanie profilem;
- wyszukiwanie gier;
- przeglądanie szczegółów gry;
- dodanie gry do biblioteki;
- ocena gry;
- zmiana statusu gry;
- zarządzanie ulubionymi;
- przeglądanie publicznego profilu;
- zarządzanie znajomymi;
- przeglądanie aktywności znajomych;
- pobieranie promocji;
- moderacja recenzji, jako rozszerzenie docelowe.

### Class Diagram

Diagram powinien zawierać klasy istniejące:

- `User`;
- `Game`;
- `GameDetailsCache`;
- `UserGame`;
- `Friendship`;
- `FriendRequest`.

Diagram powinien zawierać klasy docelowe/inferowane:

- `Review`;
- `Comment`;
- `GameList`;
- `GameListItem`;
- `ModerationReport`;
- `ActivityLog`;
- `Genre`;
- `Platform`;
- `Company`.

Relacje kluczowe:

- `User` 1..* `UserGame`;
- `Game` 1..* `UserGame`;
- `Game` 1..1 `GameDetailsCache`;
- `User` *..* `User` przez `Friendship`;
- `User` *..* `User` przez `FriendRequest`;
- `User` 1..* `Review`;
- `Game` 1..* `Review`;
- `Review` 1..* `Comment`;
- `User` 1..* `GameList`;
- `GameList` 1..* `GameListItem`;
- `Game` 1..* `GameListItem`.

### Sequence Diagrams

Należy utworzyć sekwencje:

- Dodanie gry do biblioteki:
  - `User -> Next.js Page -> Next.js API Route -> Django library_view -> Game/UserGame -> Database`.
- Wyszukiwanie gry:
  - `User -> GamesPage -> Next.js API Route -> Django list_games_view -> Steam API -> Django -> Next.js -> UI`.
- Akceptacja zaproszenia do znajomych:
  - `User -> FriendsPanel -> Next.js API Route -> Django accept_request_view -> FriendRequest/Friendship -> Database`.
- Pobranie aktywności znajomych:
  - `Dashboard -> Next.js API Route -> Django friends_activity_view -> Friendship/UserGame -> Database -> UI`.
- Obecność online:
  - `Browser WebSocket -> ASGI -> PresenceConsumer -> ChannelLayer -> Browser WebSocket`.

### Component Diagram

Diagram powinien zawierać komponenty:

- `Next.js Frontend`;
- `Next.js API Proxy`;
- `Django REST API`;
- `Django Auth/Session`;
- `Users Module`;
- `Games Module`;
- `Django Channels Presence`;
- `SQLite Database`;
- `Steam API`;
- `GG.deals API`;
- `DiceBear Avatar Service`.

Połączenia:

- Frontend komunikuje się z Next.js API Proxy przez `/api/...`.
- Next.js API Proxy komunikuje się z Django przez HTTP i przekazuje cookies/CSRF.
- Frontend komunikuje się bezpośrednio z WebSocket Django dla obecności.
- Django komunikuje się z SQLite przez ORM.
- Django komunikuje się z Steam i GG.deals przez HTTP.

## 11. Optional Improvements

- Zastąpić SQLite bazą PostgreSQL i dodać indeksy dla `UserGame(user, status)`, `UserGame(game)`, `Friendship(from_user, to_user)` oraz `FriendRequest(to_user, status)`.
- Dodać trwały cache danych Steam w `GameDetailsCache` i strategię odświeżania po czasie TTL.
- Dodać modele `Review`, `Comment`, `GameList` i `ActivityLog`, aby system był pełniejszym odpowiednikiem IMDb/Filmweb.
- Dodać walidację backendową zakresu `rating`, poprawności `status` i nieujemnych `hours_played`.
- Ujednolicić endpoint szczegółów gry: obecny backend oczekuje `appid`, podczas gdy część nazw frontendowych używa pojęcia `slug`.
- Przenieść pobieranie ofert GG.deals i danych Steam do zadań asynchronicznych.
- Zastąpić `InMemoryChannelLayer` produkcyjnym Redis Channel Layer.
- Dodać role i uprawnienia domenowe: moderator, administrator treści, administrator systemu.
- Dodać audit log dla zmian profilu, biblioteki, ocen, znajomych i moderacji.
- Dodać agregaty ocen gry: średnia, mediana, liczba ocen, rozkład ocen oraz średnia ocen znajomych.
- Dodać rate limiting dla logowania, rejestracji, wyszukiwania i endpointów integracji zewnętrznych.
- Dodać testy API dla autoryzacji, biblioteki, znajomych i integracji fallback.
- Dodać OpenAPI/Swagger jako kontrakt między Next.js i Django.
- Dodać mechanizm prywatności profilu i biblioteki: publiczne, tylko znajomi, prywatne.

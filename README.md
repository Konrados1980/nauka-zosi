# Nauka Zosi

Interaktywne powtórki przed sprawdzianami: quiz ABCD, prawda/fałsz na czas, łączenie w pary i pytania otwarte z samooceną.

Strona: **https://konrados1980.github.io/nauka-zosi/**

## Struktura

```
index.html          strona główna z kafelkami testów
test.html           odtwarzacz testu (test.html?t=polski/biblia)
silnik/gra.js       wspólny silnik gry
silnik/styl.css     wspólny wygląd
testy/katalog.js    lista testów na stronie głównej
testy/<przedmiot>/<temat>.js   pytania jednego testu
```

## Jak dodać nowy test

1. Utwórz plik, np. `testy/polski/antyk.js`:

```js
NaukaZosi.test({
  tytul: "Antyk",
  przedmiot: "Język polski",
  zakres: "Ponad słowami 1.1 · s. 10–60",
  opis: "Mitologia, Homer, tragedia grecka.",
  abcd:    [ { t: "Mitologia", q: "Pytanie?", a: "dobra", w: ["zła 1", "zła 2", "zła 3"], e: "wyjaśnienie" } ],
  pf:      [ { q: "Zdanie.", a: true, e: "wyjaśnienie" } ],
  pary:    [ { name: "Bogowie", pairs: [["Zeus", "władca bogów"], ["Posejdon", "morze"]] } ],
  otwarte: [ { q: "Pytanie otwarte?", model: ["akapit wzorcowej odpowiedzi"], pts: ["element 1", "element 2"] } ]
});
```

Każda sekcja jest opcjonalna. Pominięty etap po prostu się nie pojawi.

2. Dopisz linijkę w `testy/katalog.js`:

```js
{ plik: "polski/antyk", przedmiot: "Język polski", tytul: "Antyk", zakres: "s. 10–60", data: "12.11.2026" },
```

Najlepszy wynik zapisuje się w przeglądarce na danym urządzeniu i pokazuje na kafelku.

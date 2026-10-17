# MusicFest — страница загрузки

Публичный репозиторий для распространения игры **MusicFest**: статичная страница
загрузки и архивы релизов.

- Страница: https://nivhuril.github.io/MusicFest-Releases/
- Скачать: https://github.com/Nivhuril/MusicFest-Releases/releases

Исходный код игры здесь не публикуется — только собранная игра и файлы страницы.

## Файлы

| Файл | Назначение |
|------|------------|
| `index.html`, `styles.css`, `app.js` | статичная страница загрузки (без сборки и бэкенда) |
| `releases.json` | **единый манифест**: актуальная версия, ссылка на архив, SHA-256, «что нового», расписание встреч |
| `.nojekyll` | отключает обработку Jekyll на GitHub Pages |

`releases.json` формируется из Unity при публикации релиза
(**MusicFest → Publish → Release Publisher…**) и управляет сразу двумя вещами:
страницей и проверкой обновлений внутри игры.

Здесь **не** хранятся архивы: `.zip` публикуются как assets в
[Releases](https://github.com/Nivhuril/MusicFest-Releases/releases), а на них
указывает `downloadUrl` в манифесте.

## Расписание встреч

Расписание — обычный массив `schedule` в `releases.json`, правится вручную:

```json
"schedule": [
  { "date": "2026-10-24", "time": "20:00", "tz": "МСК",
    "title": "Вечер у костра", "host": "Сергей", "note": "площадка №3" }
]
```

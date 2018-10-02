# Open Product Evaluation Server [![Build Status](https://travis-ci.org/th-koeln/open-product-evaluation-server.svg?branch=master)](https://travis-ci.org/th-koeln/open-product-evaluation-server)

Installation:
* Repository in ein beliebiges Verzeichnis clonen
* Im Projektordner `npm install` über die Konsole ausführen
* Um den Playground / Voyager sehen zu können `npm run playground` über die Konsole ausführen

Aktuell gibt es zwei Möglichkeiten um die Datenstrukturen zu betrachten:

* http://localhost:4000 - Der Playground
* http://localhost:4000/voyager - Darstellung der Struktur über Voyager

Für das Backend-Team wird ganz normal der Befehl `npm run dev` verwendet. Der Playground läuft hier, wie auch der eigentliche Server, auf Port 3000.

## Developer Setup

Zu Beginn müssen einige Konfigurationen vorgenommen werden um mit dem Projekt zu arbeiten.
Dazu muss eine `.env` Datei im Hauptverzeichnis erstellt werden. Mit Hilfe dieser Datei können Umgebungsvariablen 
für Node.js definiert werden. Die Datei `config.js` übernimmt diese Daten, daher muss diese Datei nur angepasst werden,
wenn neue Variablen auftauchen, oder die Standardwerte geändert werden sollen.

Die `.env` Datei sieht dabei aktuell wie folgt aus:

```
DEV_DB_NAME = 'openproductevaluation'
NODE_ENV = 'dev'
DEV_SECRET = 'enterYourTestKeyHere'
```

Sofern Node.js und MongoDB auf den Standardports laufen müssen aktuell keine weiteren Werte geändert oder angegeben werden.
So kann jeder Entwickler seine eigene Konfiguration angeben ohne die Konfiguration des Projekts zu ändern.

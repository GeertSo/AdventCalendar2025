// Die Konstante für die Millisekunden pro Tag (24 Stunden * 60 Minuten * 60 Sekunden * 1000 Millisekunden)
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Berechnet die Anzahl der vollen Tage zwischen zwei Datumsangaben.
 * @param {Date} date1 Das frühere Datum (Date-Objekt).
 * @param {Date} date2 Das spätere Datum (Date-Objekt).
 * @returns {number} Die Anzahl der Tage als ganze Zahl.
 */
export function calculateDaysBetweenDates(date1, date2) {
  // 1. Umwandlung der Datumsobjekte in Millisekunden seit der Epoche (1. Jan 1970)
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

  // 2. Berechnung der Differenz in Millisekunden
  const diffInMs = Math.abs(utc2 - utc1);

  // 3. Umrechnung der Millisekunden-Differenz in Tage und Runden zur Ganzzahl
  // Math.floor() stellt sicher, dass nur volle Tage gezählt werden.
  return Math.floor(diffInMs / MS_PER_DAY);
}
<?php
header("Access-Control-Allow-Origin: *");
// Setzt den CORS-Header, um Anfragen von JEDEM Ursprung (*) zuzulassen.

// Optional: Setzt andere Header, die für komplexere Anfragen nötig sein könnten (z.B. bei POST/PUT)
//header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
//header("Access-Control-Allow-Headers: Content-Type, Authorization");

  
// Version 1.0
// 19.11.2023

 // es werden folgende Variablen fuer GET erwartet:
 // Command
 // weitere Parameter sind abhängig von dem ausgewählten command
 // create: <questionnumber> <question> <answerA> <answerB> <answerC> <explanation> <correctAnswer>
 // delete: <questionnumber>
 // readquestion: <questionnumber>



// Returnvalues
// returncode : OK oder NOTOK
// weitere Parameter für OK:
//      readquestion <questionnumber>: JSON object with {questionText: 'text for question', answerA: 'text for answer A', 
//                                                          answerB: 'text for answer B', answerC: 'text for answer C', explanation: 'text for explanation', correctAnswer: 'A' or 'B' or 'C'}
//
// weitere Parameter für NOTOK: errorcode
//      "missing command parameter"
//      "invalid command"

 // aktuelles Datum und Uhrzeit ermitteln
 $datum = date("d.m.Y");
 $timestamp = date('Y-m-d H:i:s');
 $uhrzeit = date("H:i");
 
 include "database2025.php";

 if ( empty ( $_GET) || !isset($_GET["Command"]) || $_GET["Command"] == "") {
    // keine Parameter übergeben
    // echo 'ERROR Eingabeparameter war leer oder Command Parameter mit Folgeparameter fehlte\n<br>';
    $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'missing command parameter');
} else {
    // Command als erster Parameter angegeben
    //echo "Es wurden ". count($_GET). " Parameter uebergeben\n<br>";
    $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'no command');
    switch ($_GET["Command"]):

    // *********************** readquestion *********************************
    case "readquestion":
        // echo "Es wurde ein READQUESTION Command erkannt.\n <br>";
        // liest den Eintrag für eine Frage mit Antwortoptionen, Erklärung der richtigen Antwort sowie Buchstabe der richtigen Antwort
        // Beispiel URL= https://URL-PREFIX/advdb_QA_v1.php?Command=readquestion&Questionnumber=4

        if (isset($_GET["Mode"]) && ($_GET["Mode"] == "test" || $_GET["Mode"] == "production")) {
            if (isset($_GET["Questionnumber"]) || $_GET["Questionnumber"] !="") {
                //echo "Questionnumber wurde angegeben als: ".$_GET["Questionnumber"]."\n<br>";

                $questionNumber = $_GET["Questionnumber"];
                if ($_GET["Mode"] == "production") {
                    $usetable = $tablequestionsanswers;
                } else {
                    $usetable = $testtablequestionsanswers;
                }

                $mysqlconnection = mysqli_connect($server,$user,$pw,$databasename);

                if ($err = mysqli_connect_errno()) {
                    $errstr = mysqli_connect_error();
                    //echo "Error beim Öffnen der MySQL DB: ".$err." ".$errstr."\n<br>";
                    $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'DB Error '.$err);
                } else {
                    //echo "DB erfolgreich geöffnet\n<br>";

                    $sqlStmt = "SELECT * FROM ".$usetable." WHERE Day = $questionNumber;";

                    if ($result = $mysqlconnection->query($sqlStmt)) {
                        //echo "Antwort von select query erhalten\n<br>";

                        $row = mysqli_fetch_assoc($result);

                        if ($row != []) {
                            //echo "Eintrag für Questionnumber $questionnumber gefunden \n<br>";
                            $question = $row["Question"];
                            $answerA = $row["AnswerA"];
                            $answerB = $row["AnswerB"];
                            $answerC = $row["AnswerC"];
                            $explanation = $row["Explanation"];
                            $correctAnswer = $row["CorrectAnswer"];

                            $resultArray = array('returncode' => 'OK', "question" => $question, "answerA" => $answerA, "answerB" => $answerB, "answerC" => $answerC, "explanation" => $explanation, "correctAnswer" => $correctAnswer);
                        } else {
                            //echo "Questionnumber existiert nicht in der DB!!!\n<br>";
                            $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'questionnumber not existing');
                            // Das Objekt wieder freigeben.
                            $result->free();
                        }    
                    } else {
                        //echo "Error auf select query erhalten ".mysqli_errno($mysqlconnection)." - ".mysqli_error($mysqlconnection)."\n<br>";
                        $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'internal error '.mysqli_errno($mysqlconnection));
                    }
                    mysqli_close($mysqlconnection);
                    //echo "Datenbank geschlossen\n<br>";
                }
            } else {
                //echo "Parameter Questionnumber fehlt\n<br>";
                $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'parameter Questionnumber missing');
            }
        } else {
                //echo "Parameter Mode fehlt oder fehlerhaft\n<br>";
                $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'parameter Mode missing or wrong');
        } 

        break;

    // *********************** insertupdatequestion *********************************
    case "insertupdatequestion":
        //echo "Es wurde ein INSERTUPDATEQUESTION Command erkannt.\n <br>";
        // (über)schreibt den Eintrag für eine Frage mit Antwortoptionen, Erklärung der richtigen Antwort sowie Buchstabe der richtigen Antwort
        // Beispiel URL= 
        // https://URL-PRÄFIX/advdb_QA_v1.php?Command=insertupdatequestion&Questionnumber=4&Data={"question": "Dieses ist eine Fage", "answera": "AntwortOptionA", "answerb": "AntwortOptionB", "answerc": "AntwortOptionC", "explanation": "Hier die Erklärung", "correctanswer": "C"}

        if (isset($_GET["Mode"]) && ($_GET["Mode"] == "test" || $_GET["Mode"] == "production")) {

            if (isset($_GET["Questionnumber"]) && $_GET["Questionnumber"] !="" && $_GET["Data"]) {
                //echo "Questionnumber wurde angegeben als: ".$_GET["Questionnumber"]."\n<br>";

                $questionNumber = $_GET["Questionnumber"];
                $jsonString = $_GET["Data"];
                if ($_GET["Mode"] == "production") {
                    $usetable = $tablequestionsanswers;
                } else {
                    $usetable = $testtablequestionsanswers;
                }

                $jsonObject = json_decode($jsonString);

                if ($jsonObject === null && json_last_error() !== JSON_ERROR_NONE) {
                    // Überprüfen, ob die JSON-Dekodierung fehlgeschlagen ist
                    $err = json_last_error();
                    // echo "FEHLER: Ungültiges JSON-Format übergeben. Fehlercode: " . $err . "\n<br>";
                    // echo "jsonString = {$jsonString}\n<br>";
                    $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'JSON Error '.$err);
                } else {
                    // echo "Question: " . $jsonObject->question . "\n<br>";
                    // echo "AnswerA: " . $jsonObject->answera . "\n<br>";
                    // echo "AnswerB: " . $jsonObject->answerb . "\n<br>";
                    // echo "AnswerC: " . $jsonObject->answerc . "\n<br>";
                    // echo "Explanation: " . $jsonObject->explanation . "\n<br>";
                    // echo "CorrectAnswer: " . $jsonObject->correctanswer . "\n<br>";

                    $newQuestion = $jsonObject->question;
                    $newAnswerA = $jsonObject->answera;
                    $newAnswerB = $jsonObject->answerb;
                    $newAnswerC = $jsonObject->answerc;
                    $newExplanation = $jsonObject->explanation;
                    $newCorrectAnswer = $jsonObject->correctanswer;
                
                    if ($newQuestion == "" || $newAnswerA == "" || $newAnswerB == "" || $newAnswerC == "" || $newExplanation == "" || $newCorrectAnswer == "") {
                        //echo "FEHLER: eines der JSON Eingabefelder ist nicht vorhanden oder leer\n<br>";
                        $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'missing JSON parameter');
                    } else {
                        $mysqlconnection = mysqli_connect($server,$user,$pw,$databasename);

                        if ($err = mysqli_connect_errno()) {
                            $errstr = mysqli_connect_error();
                            //echo "Error beim Öffnen der MySQL DB: ".$err." ".$errstr."\n<br>";
                            $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'DB Error '.$err);
                        } else {
                            //echo "DB erfolgreich geöffnet\n<br>";

                            // prüfe, ob die Zeile für diesen Tag bereits existiert. Wenn ja, führe ein UPDATE durch, sonst ein INSERT
                            $sqlStmt = "SELECT * FROM ".$usetable." WHERE Day = $questionNumber;";

                            if ($result = $mysqlconnection->query($sqlStmt)) {
                                //echo "Antwort von select query erhalten\n<br>";

                                $row = mysqli_fetch_assoc($result);

                                if ($row != []) {
                                    //echo "Eintrag für Questionnumber $questionnumber gefunden => update durchführen\n<br>";
                                    // Der SQL-Query mit Platzhaltern (?)
                                    // Die Platzhalter ersetzen die Variablen in der Abfrage.
                                    $sql = "UPDATE {$usetable} SET Question=?,AnswerA=?,AnswerB=?,AnswerC=?,Explanation=?,CorrectAnswer=?,Day=? WHERE Day = ?;";

                                    // Das Prepared Statement erstellen
                                    // Wir nutzen die prepare-Methode der MySQLi-Verbindung.
                                    $stmt = $mysqlconnection->prepare($sql);
                                    //echo "prepare-statement ausgeführt\n<br>";

                                    // Prüfen, ob die Vorbereitung erfolgreich war
                                    if ($stmt != false) {
                                        //echo "VOR bind-statement \n<br>";
                                        // Parameter binden (i = integer, s = string)
                                        // Die Reihenfolge muss exakt der Reihenfolge der Fragezeichen (?) im SQL-Statement entsprechen.
                                        // 'ssssssii' steht für: String, String, String, String, String, String, Integer, Integer.
                                        $bindResult = $stmt->bind_param("ssssssii", $newQuestion, $newAnswerA, $newAnswerB, $newAnswerC, $newExplanation, $newCorrectAnswer, $questionNumber, $questionNumber);
                                        //echo "bind-statement ausgeführt {$bindResult}\n<br>";

                                        // Den Befehl ausführen
                                        if ($stmt->execute()) {
                                            $anzahlZeilen = $stmt->affected_rows; // MySQLi verwendet affected_rows
                                            //echo "Update durchgeführt! " . $anzahlZeilen . " Zeile(n) wurden geändert.\n<br>";
                                            $resultArray = array('returncode' => 'OK', 'numberlineschanged' => $anzahlZeilen);
                                        } else {
                                            //echo "Fehler beim Ausführen des Updates: " . $stmt->error. "\n<br>";
                                            $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'internal error '.mysqli_errno($mysqlconnection));
                                        }
                                    } else {
                                        //echo "Error auf prepare erhalten ".mysqli_errno($mysqlconnection)." - ".mysqli_error($mysqlconnection)."\n<br>";
                                        $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'prepare error '.mysqli_errno($mysqlconnection));
                                        //echo("Fehler beim Vorbereiten des Statements: " . $mysqlconnection->error. "\n<br>");
                                    }
                                } else {
                                    //echo "Questionnumber existiert nicht in der DB, INSERT durchführen!!!\n<br>";
                                    // Der SQL-Query mit Platzhaltern (?)
                                    // Die Platzhalter ersetzen die Variablen in der Abfrage.
                                    $sql = "INSERT INTO {$usetable} (Question ,AnswerA ,AnswerB ,AnswerC ,Explanation ,CorrectAnswer ,Day) VALUES (?, ?, ?, ?, ?, ?, ?);";

                                    // Das Prepared Statement erstellen
                                    // Wir nutzen die prepare-Methode der MySQLi-Verbindung.
                                    $stmt = $mysqlconnection->prepare($sql);
                                    //echo "prepare-statement ausgeführt\n<br>";

                                    // Prüfen, ob die Vorbereitung erfolgreich war
                                    if ($stmt != false) {
                                        //echo "VOR bind-statement \n<br>";
                                        // Parameter binden (i = integer, s = string)
                                        // Die Reihenfolge muss exakt der Reihenfolge der Fragezeichen (?) im SQL-Statement entsprechen.
                                        // 'ssssssii' steht für: String, String, String, String, String, String, Integer, Integer.
                                        $bindResult = $stmt->bind_param("ssssssi", $newQuestion, $newAnswerA, $newAnswerB, $newAnswerC, $newExplanation, $newCorrectAnswer, $questionNumber);
                                        //echo "bind-statement ausgeführt {$bindResult}\n<br>";

                                        // Den Befehl ausführen
                                        if ($stmt->execute()) {
                                            $neueId = $mysqlconnection->insert_id;
                                            //echo "INSERT durchgeführt! InsertId = {$neueId}.\n<br>";
                                            $resultArray = array('returncode' => 'OK', 'insertid' => $neueId);
                                        } else {
                                            //echo "Fehler beim Ausführen des INSERT: " . $stmt->error. "\n<br>";
                                            $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'internal error '.mysqli_errno($mysqlconnection));
                                        }
                                    } else {
                                        //echo "Error auf prepare erhalten ".mysqli_errno($mysqlconnection)." - ".mysqli_error($mysqlconnection)."\n<br>";
                                        $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'prepare error '.mysqli_errno($mysqlconnection));
                                        //echo("Fehler beim Vorbereiten des Statements: " . $mysqlconnection->error. "\n<br>");
                                    }
                                }    
                            } else {
                                //echo "Error auf select query erhalten ".mysqli_errno($mysqlconnection)." - ".mysqli_error($mysqlconnection)."\n<br>";
                                $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'internal error '.mysqli_errno($mysqlconnection));
                            }

                            mysqli_close($mysqlconnection);
                            //echo "Datenbank geschlossen\n<br>";
                        }
                    }
                }
            } else {
                //echo "Parameter Questionnumber fehlt\n<br>";
                $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'parameter Questionnumber missing');
            }
        } else {
            //echo "Parameter Mode fehlt oder fehlerhaft\n<br>";
            $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'parameter Mode missing or wrong');

        }

        break;

    
// *********************** default *********************************
        default:
            //echo "Es wurde KEIN gültiges Command erkannt.\n <br>";
            $resultArray = array('returncode' => 'NOTOK', 'errorcode' => 'invalid command');
            $timestamp = date('Y-m-d H:i:s');
            //echo "es ist jetzt ".$timestamp;
    endswitch;
}

header('Content-Type: application/json; charset=utf-8');

echo json_encode($resultArray);
exit;
// end of main program


?>


import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  //  Tooltip,
  //  Legend,
} from 'chart.js';
import { Chart, Line, } from 'react-chartjs-2';
import JSZip, { filter } from 'jszip';
import { saveAs } from 'file-saver';
import { render } from '@testing-library/react';
///////////////////////////////////////////////////////////////////////////////////////////////////////////ToDo 6x12: 12Bit statt 10, BLE Übertragung keine 20Byte
var sixXtwelve = true;
var lineFarbe = "black";
var Farbarray = []; //Erstellung Farbarray, geht weiß->blau->pink->orange->rot
var Farb18 = [];
var Farb12 = [];
var stateArray = [];  //Wird ValueArray pro Datensatz
var infoArray = []; //Speicherung d. Zeitdaten
var valueArray = [];  //temp Array für Datensatz  
var dataNumArray = [];
var dataPosInStr = 0;
var dataCountM = 0;       //von alter live funktion
var completeInput = [];   //auch
var r = 255;              //für Erstellung Farbarray
var g = 255;
var b = 255;
var startNewSet = false;  //auch alte live funktion
var stopBool = false;     //Stop Button Bool
var data = Array(100).fill(0);        //Daten Graph 1 (Vorderfuß)
var dataZwei = Array(100).fill(0);    //Daten Graph 2 (mittlefuß)
var dataDrei = Array(100).fill(0);    //Daten Graph 3 (Ferse)
var newData = false;  //für TestSendung
var oldData = false;  //für TestSendung
var widthArray = ["120px", "180px", "240px", "300px", "360px", "420px", "480px"]; //Array mit möglichen Größen von komplettemSchuhgrid
var heightArray = ["360px", "540px", "720px", "900px", "1080px", "1260px", "1440px"]; //Heights davon
var heightArray12 = ["240px", "360px", "480px", "600px", "720px", "840px", "960px"];
var squareSizeArray = ["20px", "30px", "40px", "50px", "60px", "70px", "80px"];  //wie groß die einzelnen Squares dann sind
var sizePos = 1;  //Stelle wie groß zu beginn
var login = false;  //Für Login
var zwischensumme = 0;  //Für Graphpunkte berechnung
var summenarray = [];   //nicht bei Live BLE; komplette Summen pro Frame in array
var zeitarray = [];     //alle Zeiten bei Abspielen
var summenarrayZwei = [];   //Daten für 2. Graph
var summenarrayDrei = [];
var graphIsOn = true;     //bool ob Graphen berechnet & laufen sollen
var progressbar = document.getElementById("progress");  //Blaue Leiste, die Zeitleiste anzeigt, interagierbar
var FilterOn = true;    //bool ob Filterberechnungen
var settingsVisible = false;

document.getElementById("settingCollapse").addEventListener("click", function () {
  if (settingsVisible) {
    settingsVisible = false;
    document.getElementById("ZEins").style.display = "none";
  }
  else {
    settingsVisible = true;
    document.getElementById("ZEins").style.display = "block";
  }
});


/*
while (login == false) {    //einfache Passwortabfrage
  var passwort = prompt("Passwort")
  if (passwort == "dfki") {
    login = true;
  }
}*/

//        HIER ERSTELLUNG DES FARBARRAYS - 1024 Stufen Weiß->Blau->Pink->Grün->Rot

for (var i = 255; i > 0; i--) {        //Weiß -> blau
  Farbarray.push("rgb(" + r + "," + g + "," + b + ")");
  r--;
  g--;
}
for (var i = 0; i < 255; i++) {  //blau -> r,b
  r++;
  Farbarray.push("rgb(" + r + "," + g + "," + b + ")");
}
for (var i = 0; i < 255; i++) {  //r,b -> r,g
  g++;
  b--;
  Farbarray.push("rgb(" + r + "," + g + "," + b + ")");
}
for (var i = 0; i < 255; i++) {  //r,g -> rot
  g--;
  Farbarray.push("rgb(" + r + "," + g + "," + b + ")");
}


Farb18 = Array.from(Farbarray);

r = 255;              //für Erstellung Farbarray
g = 255;
b = 255;


for (var i = 255; i > 0; i--) {        //Weiß -> blau
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  r--;
  g--;
}
for (var i = 0; i < 255; i++) {  //blau -> r,b
  r++;
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
}
for (var i = 0; i < 255; i++) {  //r,b -> r,g
  g++;
  b--;
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
}
for (var i = 0; i < 255; i++) {  //r,g -> rot
  g--;
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
  Farb12.push("rgb(" + r + "," + g + "," + b + ")");
}

//        STOP BUTTON

document.getElementById('stopButton').addEventListener('click', function stopClick() { //Löst aus wenn Button geclickt
  if (stopBool == false && (oldData || newData)) {    //nur wenn oldData o. newData true -> nur wenn Anzeige schon läuft
    document.getElementById('stopButton').innerHTML = "Weiter";  //Änderung Anzeigetext Button
    stopBool = true;
  }
  else if (stopBool && (oldData || newData)) {
    document.getElementById('stopButton').innerHTML = "Stop";
    stopBool = false;
  }
  if (oldData) {    //Falls CSV File reingeladen war, wird hiermit fortgesetzt
    displayAfter();
  }
  if (newData) {
    stopTmr(); //Achtung, später entfernen!!!
  }


  //console.log(completeInput);

});

var renderCount = [];
for (var i = 0; i < 72; i++) {
  renderCount[i] = i;
}

    
document.getElementById("version1o2").addEventListener('change', function switchVersion() {
  if (sixXtwelve) {
    Farbarray = Array.from(Farb18);
    arraySoll=108;
    sixXtwelve = false;
    renderCount = [];
    for (var i = 0; i < 108; i++) {
      renderCount[i] = i;
    }
    root.render(<Grid />);
    document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];  //größe aus Array laden
    document.getElementsByClassName("gridall")[0].style.height = heightArray[sizePos];
  }
  else {
    Farbarray = Array.from(Farb12);
    arraySoll=72;  //ob 6x18 oder 6x12 Matrix
    sixXtwelve = true;
    renderCount = [];
    for (var i = 0; i < 72; i++) {
      renderCount[i] = i;
    }
    root.render(<Grid />);
    document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];  //größe aus Array laden
    document.getElementsByClassName("gridall")[0].style.height = heightArray12[sizePos];
  }
  console.log(sixXtwelve);


  var squArray = document.getElementsByClassName("square"); //auch für Squares, für jedes einzeln
  for (var i = 0; i < squArray.length; i++) {
    squArray[i].style.width = squareSizeArray[sizePos];
    squArray[i].style.height = squareSizeArray[sizePos];
  }
})


document.getElementById('groesser').addEventListener('click', function enlarge() {  //Grid größer machen (+ Button)
  if (sixXtwelve) {
    if (sizePos < widthArray.length - 1) { //Wenn nicht schon größte Stufe erreicht
      sizePos++;  //nächste Stufe
      document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];  //größe aus Array laden
      document.getElementsByClassName("gridall")[0].style.height = heightArray12[sizePos];
      var squArray = document.getElementsByClassName("square"); //auch für Squares, für jedes einzeln
      for (var i = 0; i < squArray.length; i++) {
        squArray[i].style.width = squareSizeArray[sizePos];
        squArray[i].style.height = squareSizeArray[sizePos];
      }
    }
  }
  else {
    if (sizePos < widthArray.length - 1) { //Wenn nicht schon größte Stufe erreicht
      sizePos++;  //nächste Stufe
      document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];  //größe aus Array laden
      document.getElementsByClassName("gridall")[0].style.height = heightArray[sizePos];
      var squArray = document.getElementsByClassName("square"); //auch für Squares, für jedes einzeln
      for (var i = 0; i < squArray.length; i++) {
        squArray[i].style.width = squareSizeArray[sizePos];
        squArray[i].style.height = squareSizeArray[sizePos];
      }
    }
  }
});

document.getElementById('kleiner').addEventListener('click', function smaller() {     //gleiches wie größer nur andersrum
  if (sixXtwelve) {
    if (sizePos > 0) {
      sizePos--;
      document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];
      document.getElementsByClassName("gridall")[0].style.height = heightArray12[sizePos];
    }
    var squArray = document.getElementsByClassName("square");
    for (var i = 0; i < squArray.length; i++) {
      squArray[i].style.width = squareSizeArray[sizePos];
      squArray[i].style.height = squareSizeArray[sizePos];
    }
  }
  else {

    if (sizePos > 0) {
      sizePos--;
      document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];
      document.getElementsByClassName("gridall")[0].style.height = heightArray[sizePos];
    }
    var squArray = document.getElementsByClassName("square");
    for (var i = 0; i < squArray.length; i++) {
      squArray[i].style.width = squareSizeArray[sizePos];
      squArray[i].style.height = squareSizeArray[sizePos];
    }
  }
});



//LIVE AUSWERTUNG  VERALTET EIGENTLICH evtl nochmal nützlich bei anderen BLE Modulen?

function newRow(inString) {     //Funktion die je 1 Reihe Daten auwertet
  completeInput = completeInput.concat(inString);
  if (stopBool == true) {    //Wenn Stop aktiviert, dann return from function
    return;
  }
  if (inString.indexOf("MS:") != -1) { //Hier wenn "MS:" vorhanden ist, dann: (Wenn nicht zeigt Stelle an als -1)
    dataCountM = 0;  //MS Zeilen sind einleitend für Daten, also DataCounter auf 0
    valueArray = [];  //Auch valueArray auf 0
    infoArray.push(inString.slice(inString.indexOf("MS:"), inString.indexOf("H:") - 1)); //ab MS, bis H: wird in ein Info Array geschrieben => "MS:XXXX M:XX"
    dataNumArray.push(inString.slice(0, inString.indexOf("MS:") - 1)); //hier in Array d Counter vor MS:
    startNewSet = true;
    return;
  }
  dataCountM = valueArray.length; //Wenn keine MS Zeile, dann alte valueArray length speichern in dataCount
  valueArray = valueArray.concat(inString.split(","));  //neues valueArray = altes+neue Zeile angehangen
  if (valueArray.length != dataCountM + 6) {  //Falls nicht 6 neue Werte dazu kamen:
    valueArray = [];  //reset des valueArray auf 0
    //console.log("Corrupted Data?")
    startNewSet = false;
    return;
  }
  if (valueArray.length == 108 && startNewSet == true) {  //Sobald valueArray vollständig (108 Einträge):
    //valueToColor(valueArray);
    stateArray = valueArray;    //stateArray wird verwendet bei Render
    //updateData(stateArray); //Für Graphen, aber Graph too slow
    valueArray = [];      //valueArray = 0 für nächstes Set
    startNewSet = false;
    root.render(<Grid />); //wird gerendert durch Klasse Grid
  }
}


class Grid extends React.Component { //Hauptklasse
  constructor(props) {
    super(props);
    this.state = {  //wahrscheinlich ohne Nutzen
      squares: stateArray //Array mit Farbwerten auf jeweiliger Pos
    };
  }



  updateState() {   //Im Moment nicht mehr benutzt
    console.log("SETSTATE");
    this.setState({   //aktualisierung state => React rendert  

      squares: stateArray
    });
  }

  render() {
    if (true) {
      return (    //Hier wird Grid generiert
        <div className='wrapper'>
          <div id="chartOn">
            <App />
            <AppZwei />
            <AppDrei />
          </div>
          <div className='gridall' height="480px">

            {renderCount.map((nummer) => {
              const quadrate = (                                                               //für jeden Eintrag von renderCount einmal
                <div key={nummer} className="square" style={{ backgroundColor: Farbarray[Number(stateArray[nummer])] }}>
                </div>  //Quadrat bekommt Farbe zugehörig zu Value zugeordnet als HintergrundFarbe
              );
              return quadrate;
            })}

          </div>

        </div>

      );
    }

  }//unten div für Graphen, App - AppDrei sind die 3 Graphen
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Grid />);    //1. rendern damit Grid Platz angezeigt wird auf Site


console.log(document.getElementsByClassName("square"));




ChartJS.register(       //Graph init
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  //  Tooltip,
  //  Legend
);

export var options = {    //options definition, muss nochmal wenn was geändert wird
  borderColor: 'rgba(0,0,0)', //LineColor = black
  backgroundColor: 'rgba(255,255,255)', //Hintergrund = weiß
  elements: {
    point: {
      radius: 0     //sonst Punkte auf jedem Datenpunkt
    }
  },
  legend: {
    display: false
  },
  animation: false,
  responsive: false,
  scales: {
    //borderColor: 'rgba(0,0,0)',
    yAxis: {
      max: 500,  //500 für Live BLE Y-Achse
      min: 0,
      grid: {
        borderColor: 'rgba(0,0,0)'
      }
    },
    xAxis: {
      ticks: {
        display: false  //damit keine Linien im Graph
      },
      //display: false,
      grid: {
        display: false,
        //borderColor: 'rgba(0,0,0)'
      }
    }
  },
};
const labels = data;

export var datak = {  //Werte zuweisung für alle 3 Graphen
  labels,
  datasets: [
    {
      data: data,
      borderColor: lineFarbe,
    },
  ],
};

export var datakZwei = {
  labels,
  datasets: [
    {
      data: dataZwei,
    },
  ],
};

export var datakDrei = {
  labels,
  datasets: [
    {
      data: dataDrei,
    },
  ],
};

export function App() {     //3 Graphen, gleiche options, unterschiedliche Data
  return <Line options={options} data={datak} />;

}

export function AppZwei() {
  return <Line options={options} data={datakZwei} />;
}

export function AppDrei() {
  return <Line options={options} data={datakDrei} />;
}



//AUSWERTUNG VON FERTIGEN DATEIEN

var startSlide = document.getElementById("StepBegin");
var endSlide = document.getElementById("StepEnd");
var sSlideOut = document.getElementById("SBOut");
var eSlideOut = document.getElementById("SEOut");
var startSchwellwert = startSlide.value;
var endSchwellwert = endSlide.value;
sSlideOut.innerHTML = startSlide.value;
eSlideOut.innerHTML = endSlide.value;
startSlide.oninput = function () {
  sSlideOut.innerHTML = this.value;
  startSchwellwert = this.value;
}
endSlide.oninput = function () {
  eSlideOut.innerHTML = this.value;
  endSchwellwert = this.value;
}
var gewichtung = 2;
var filterSlide = document.getElementById("FilterSlide");
var filterOutput = document.getElementById("FilterOutput");
filterOutput.innerHTML = "x" + filterSlide.value / 100;
filterSlide.oninput = function () {
  gewichtung = Number(this.value / 100);
  filterOutput.innerHTML = "x" + this.value / 100;
}
var completeFile = [];
var slider = document.getElementById("slider");     //Geschwindigkeitsrange
var output = document.getElementById("slideOutput");  //Anzeige v %
var malTime = 1.0;  //default x1
output.innerHTML = slider.value + "%";  //GEschwindigkeitsmultiplier anzeige
slider.oninput = function () {
  malTime = this.value / 100;       //Wenn slider verändert wird, wird faktor geändert
  output.innerHTML = this.value + "%"; //Anzeige von Wert
}

document.getElementById('csvFiles').addEventListener('change', function csvInput() { //Wenn File eingefügt läuft das hier
  //document.getElementById('title').innerHTML = "Lädt";
  document.getElementById("stopButton").style.display = "block";
  document.getElementById("slider").style.display = "block";
  document.getElementById("sliderOutput").style.display = "block";
  document.getElementById("slideOutput").style.display = "block";
  document.getElementById("stepDownload").style.display = "block";
  document.getElementById("stepHeader").style.display = "block";
  document.getElementById("formAndDownload").style.display = "block";
  document.getElementById("aufnahme").style.display = "none";
  document.getElementById("StepZahl").style.display = "block";
  document.getElementById("FilterSett").style.display = "block";
  oldData = true; //oldData bool für stop button
  completeFile = [];
  let reader = new FileReader(); //FileReader von JS
  reader.readAsText(document.getElementById('csvFiles').files[0]);
  reader.onload = function (event) { //wird gelesen und wenn fertig, csvVerarbeitung aufgerufen mit gelesener Datei
    //zuzwoelf(event.target.result);
    csvVerarbeitung(event.target.result);
  };
});

function zuzwoelf(inputFile) {
  let sechsZwoelfDat = inputFile.split("MS:");
  let tempSpeicher = "";
  let newDownload = "";
  for(var i=0; i<sechsZwoelfDat.length-1; i++) {
    tempSpeicher="MS:";
    for (var j=0; j<7; j++) {

      tempSpeicher += sechsZwoelfDat[i].slice(0, sechsZwoelfDat[i].indexOf("\r"));
      sechsZwoelfDat[i] = sechsZwoelfDat[i].slice(sechsZwoelfDat[i].indexOf("\r")+1);
    }
    for (var j=0; j<6; j++) {
      sechsZwoelfDat[i] = sechsZwoelfDat[i].slice(sechsZwoelfDat[i].indexOf("\r")+1);
    }
    for (var j=0; j<6; j++) {

      tempSpeicher += sechsZwoelfDat[i].slice(0, sechsZwoelfDat[i].indexOf("\r"));
      sechsZwoelfDat[i] = sechsZwoelfDat[i].slice(sechsZwoelfDat[i].indexOf("\r")+1);
    }
    sechsZwoelfDat[i]=tempSpeicher
  }
  for(var i=0; i<sechsZwoelfDat.length-1; i++) {
    newDownload += sechsZwoelfDat[i];
    newDownload += "\n";
  }

  let umwandlung = "data:text/csv;charset=utf-8," + newDownload;
  let encodedumwandlung = encodeURI(umwandlung);
  let linkumwandlung = document.createElement("a");
  linkumwandlung.setAttribute("href", encodedumwandlung);
  linkumwandlung.setAttribute("download", "6x12.csv");
  document.body.appendChild(linkumwandlung);
  linkumwandlung.click();
}






let dropArea = document.getElementById('csvFilez');                 //Damit man Dateien einfach reinziehen kann
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => { //wenn datei über element
  dropArea.addEventListener(eventName, preventDefaults, false)  //Default wäre, dass Datei im Browser geöffnet wird
})
dropArea.addEventListener("drop", runCSV, false); //bei drop runCSV aufrufen
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();

}
function runCSV(e) {
  let dt = e.dataTransfer;  //dt = Data die gedropt
  let filers = dt.files;    //jetzt csvFile
  document.getElementById('title').innerHTML = "Lädt";
  oldData = true; //oldData bool für stop button
  completeFile = [];  //rücksetzen falls vorher was ausgewertet wurde

  let reader = new FileReader(); //FileReader von JS
  reader.readAsText(filers[0]);
  reader.onload = function (event) { //wird gelesen und wenn fertig, csvVerarbeitung aufgerufen mit gelesener Datei
    csvVerarbeitung(event.target.result);
  }
}
/*dropArea.addEventListener('drop', function csvInput() { //Wenn File eingefügt läuft das hier
  document.getElementById('title').innerHTML = "Lädt";
  oldData = true; //oldData bool für stop button
  completeFile = [];  

  let reader = new FileReader(); //FileReader von JS
  reader.readAsText(document.getElementById('csvFiles').files[0]);
  reader.onload = function (event) { //wird gelesen und wenn fertig, csvVerarbeitung aufgerufen mit gelesener Datei
    csvVerarbeitung(event.target.result);
  };
});*/

var wertVorher = 0;
var wertNachher = 0;
var savedCom = [];
var laenge = 0;
var dauerCSV = 0;
function csvVerarbeitung(inputFile) { //input noch als String wird aufgeteilt in Blöcke getrennt durch MS: Zeilen
  let csvAlsArray = inputFile.slice(inputFile.indexOf("MS:")).split("MS:");
  var Millisekunden = Number(csvAlsArray[csvAlsArray.length - 1].slice(0, csvAlsArray[csvAlsArray.length - 1].indexOf("M:") - 1)) - Number(csvAlsArray[1].slice(0, csvAlsArray[1].indexOf("M:") - 1));
  var Minuten = Number(csvAlsArray[csvAlsArray.length - 1].slice(csvAlsArray[csvAlsArray.length - 1].indexOf("M:") + 2, csvAlsArray[csvAlsArray.length - 1].indexOf("H:") - 1)) - Number(csvAlsArray[1].slice(csvAlsArray[1].indexOf("M:") + 2, csvAlsArray[1].indexOf("H:") - 1));
  if (Millisekunden < 0) {
    Millisekunden = 60000 + Millisekunden;
    Minuten--;
  }
  Millisekunden /= 1000;
  dauerCSV = Minuten + " Minuten und " + Millisekunden + " Sekunden";
  document.getElementById("Dauer").innerHTML = (dauerCSV);
  var tempArray = [];
  var tempZwei = [];
  var rn = false;

  if (csvAlsArray[1].indexOf("\r\n") != -1) {  //Manche CSV Files haben am Zeilenende \r\n und manche nur \n       ?
    rn = true;
  }
  else {      //damit falls rn dann split über rn und sonst split über n
    rn = false;
  }

  if (sixXtwelve == false) {

    for (var i = 0; i < csvAlsArray.length; i++) { //Für jeden Eintrag 1 Mal:
      if (rn) {

        tempArray = csvAlsArray[i].split("\r\n");  //MS Block in neues Arrays getrennt durch Zeilenumbrüche
      }
      else {

        tempArray = csvAlsArray[i].split("\n");
      }

      if (tempArray.length == 20) { //Wenn genau 20 Zeilen -> Kein Fehler:
        tempArray.pop();  //letzter Eintrag wird entfernt (ist Counter vor nächstem "MS:")
        tempZwei = [];
        tempArray[0] = tempArray[0].slice(0, tempArray[0].indexOf("M:") - 1); //erster Eintrag im Array wird gekürzt von MS: XXXXX M: XXXXX H: XXXXX,,,, auf nur XXXXX Zahl von MS
        for (var j = 0; j < tempArray.length; j++) {  //Für jeden Eintrag (Zeile):
          tempZwei = tempZwei.concat(tempArray[j].split(","));  //Werte in neues Array getrennt durch Kommas
        }
        if (tempZwei.length == 109) { //Falls 109 Einträge (1 MS Wert & 108 DruckWerte):
          //tempZwei[0] = tempZwei[0].slice(0,tempZwei[0].indexOf("M:")-1);
          wertVorher = wertNachher;
          wertNachher = 0;
          for (var w = 1; w < 109; w++) {
            wertNachher += Number(tempZwei[w]);
          }
          if (wertNachher < wertVorher * 1.5) {
            completeFile = completeFile.concat(tempZwei); //completeFile wird zu completeFile + Fehlerloser Datensatz
          }

        }                                              //"Fehlerlos" Hinsichtlich Einträgen, Fehlerhafte Werte sind noch möglich
      }
      //console.log(i + "/" + csvAlsArray.length);

    }
  }
  else if (sixXtwelve) {
    for (var i = 0; i < csvAlsArray.length; i++) { //Für jeden Eintrag 1 Mal:
      if (rn) {

        tempArray = csvAlsArray[i].split("\r\n");  //MS Block in neues Arrays getrennt durch Zeilenumbrüche
      }
      else {

        tempArray = csvAlsArray[i].split("\n");
      }

      if (tempArray.length == 14) { //Wenn genau 14 Zeilen -> Kein Fehler:
        tempArray.pop();  //letzter Eintrag wird entfernt (ist Counter vor nächstem "MS:")
        tempZwei = [];
        tempArray[0] = tempArray[0].slice(0, tempArray[0].indexOf("M:") - 1); //erster Eintrag im Array wird gekürzt von MS: XXXXX M: XXXXX H: XXXXX,,,, auf nur XXXXX Zahl von MS
        for (var j = 0; j < tempArray.length; j++) {  //Für jeden Eintrag (Zeile):
          tempZwei = tempZwei.concat(tempArray[j].split(","));  //Werte in neues Array getrennt durch Kommas
        }
        if (tempZwei.length == 73) { //Falls 73 Einträge (1 MS Wert & 72 DruckWerte):
          //tempZwei[0] = tempZwei[0].slice(0,tempZwei[0].indexOf("M:")-1);
          wertVorher = wertNachher;
          wertNachher = 0;
          for (var w = 1; w < 73; w++) {
            wertNachher += Number(tempZwei[w]);
          }
          if (wertNachher < wertVorher * 1.5) {
            completeFile = completeFile.concat(tempZwei); //completeFile wird zu completeFile + Fehlerloser Datensatz
          }

        }                                              //"Fehlerlos" Hinsichtlich Einträgen, Fehlerhafte Werte sind noch möglich
      }
      //console.log(i + "/" + csvAlsArray.length);

    }

  }

  //console.log("DONE");
  //console.log(completeFile);
  if (/*document.getElementById("graphi").checked*/graphIsOn) { //Wenn Graph Box häkchen
    //graphIsOn = true;
    document.getElementById("chartOn").style.display = "inline";  //Graphen visible
    graphIt(completeFile);                                        //Berechnung für Graphen durchführen
    return;
  }
  else {
    document.getElementById("chartOn").style.display = "none";  //sonst Graphen nicht anzeigen
  }
  //document.getElementById('title').innerHTML = "Schuhsohle";    //Fertig geladen
  savedCom = Array.from(completeFile);                        //Backup des Array für die Rücksprünge
  laenge = savedCom.length;                                 //Länge des Arrays
  progressbar.style.display = "inline";   //Anzeigen der Progressbar
  console.log(Date.now());
  displayIt();  //Alles verarbeitet und in 1 riesen Array, jetzt Anzeigen lassen

}

document.getElementById("steps").addEventListener("change", function () { //Checkbox Steps, wenn geändert wird
  if (step) {
    step = false;     //wenn vorher true, jetzt false

  }
  else {
    step = true;        //wenn vorher false jetzt true
    graphIsOn = true;   //auch graph true, steps nur dann möglich
    document.getElementById("graphi").checked = true; //auch anzeige muss true sein
  }
});

document.getElementById("graphi").addEventListener("change", function () {       //Wenn Graph checkbox geclickt
  //graphIsOn?graphIsOn=false:graphIsOn=true;   
  if (graphIsOn) {
    graphIsOn = false;
    step = false;   //step kann nicht ohne Graph an sein
    document.getElementById("steps").checked = false; //auch anzeige
  }
  else {
    graphIsOn = true;
  }
  options = {   //options wie vorher
    borderColor: 'rgba(0,0,0)',
    backgroundColor: 'rgba(255,255,255)',
    elements: {
      point: {
        radius: 0
      }
    },
    legend: {
      display: false
    },
    animation: false,
    responsive: false,
    scales: {
      //borderColor: 'rgba(0,0,0)',
      yAxis: {
        max: 500,
        min: 0,
        grid: {
          borderColor: 'rgba(0,0,0)'
        }
      },
      xAxis: {
        ticks: {
          display: false
        },
        //display: false,
        grid: {
          display: false,
          //borderColor: 'rgba(0,0,0)'
        }
      }
    },
  };
});



var einsKopie = []; //Backups für Rücksprünge von summenarrays
var zweiKopie = [];
var dreiKopie = [];
var stepKopie = [];
var max = 0;          //max wert von summe, für Max Wert auf Achse
var stepStartTime = 0;  //Für berechnung schrittdauer
var stepEndTime = 0;
var Ferse = false;    //Bool, schrittbegtinn
var maxZeh = false;   //Bool Schrittende eingeleitet
var stepTimes = [];   //Array mit allen Schrittzeiten
var StepString = "";   //String der angezeigt wird
var indexArray = [];    //Speichert Index, wo Schritt geendet ist im Summenarray
var stelleImArray = 0;  //da splice braucht eigenen counter
var laengeOriginal = 0; //Original Länge für berechnung von stelleimArary
var rollingIndex = [];  //wie IndexArray, nur für Start der Schritte
var flachIndex = [];
var zehIndex = [];

function graphIt(allData) {   //Graph checkbox aktiviert -> bei Abspielen
  summenarray = [];       //reset wenn vorher schon benutzt wurden
  summenarrayZwei = [];
  summenarrayDrei = [];
  zeitarray = [];
  if (sixXtwelve == false) {
    for (var u = 0; u < allData.length; u = u + 109) {       //Berechnung Summen
      zwischensumme = 0;

      for (var v = 1; v < 37; v++) {
        zwischensumme += Number(allData[u + v]);          //die ersten 36 Werte zusammengerechnet
      }
      summenarray.push(Math.round(zwischensumme / 36));   //Summe in komplettes Array pushen
      zwischensumme = 0;
      for (var v = 37; v < 73; v++) {
        zwischensumme += Number(allData[u + v]);        //die zweiten 36 Werte
      }
      summenarrayZwei.push(Math.round(zwischensumme / 36)); //Summe in anderes Array pushen
      zwischensumme = 0;
      for (var v = 73; v < 109; v++) {
        zwischensumme += Number(allData[u + v]);        //gleiches für letzten 36 Werte
      }
      summenarrayDrei.push(Math.round(zwischensumme / 36));       //Man hat grob ungefähr Ferse, Mittelfuß und Ballen

      if (summenarray[summenarray.length - 1] > max) {     //Maximaler Wert von allen drei Arrays ermittelt
        max = summenarray[summenarray.length - 1];
      }
      if (summenarrayZwei[summenarray.length - 1] > max) {
        max = summenarrayZwei[summenarray.length - 1];
      }
      if (summenarrayDrei[summenarray.length - 1] > max) {
        max = summenarrayDrei[summenarray.length - 1];
      }
      zeitarray.push(allData[u]);                   //zeitarray mit allen ZeitDaten
    }

  }
  else {
    for (var u = 0; u < allData.length; u = u + 73) {       //Berechnung Summen
      zwischensumme = 0;

      for (var v = 1; v < 25; v++) {
        zwischensumme += Number(allData[u + v]);          //die ersten 24 Werte zusammengerechnet
      }
      summenarray.push(Math.round(zwischensumme / 24));   //Summe in komplettes Array pushen
      zwischensumme = 0;
      for (var v = 25; v < 49; v++) {
        zwischensumme += Number(allData[u + v]);        //die zweiten 24 Werte
      }
      summenarrayZwei.push(Math.round(zwischensumme / 24)); //Summe in anderes Array pushen
      zwischensumme = 0;
      for (var v = 49; v < 72; v++) {
        zwischensumme += Number(allData[u + v]);        //gleiches für letzten 24 Werte
      }
      summenarrayDrei.push(Math.round(zwischensumme / 24));       //Man hat grob ungefähr Ferse, Mittelfuß und Ballen

      if (summenarray[summenarray.length - 1] > max) {     //Maximaler Wert von allen drei Arrays ermittelt
        max = summenarray[summenarray.length - 1];
      }
      if (summenarrayZwei[summenarray.length - 1] > max) {
        max = summenarrayZwei[summenarray.length - 1];
      }
      if (summenarrayDrei[summenarray.length - 1] > max) {
        max = summenarrayDrei[summenarray.length - 1];
      }
      zeitarray.push(allData[u]);                   //zeitarray mit allen ZeitDaten
    }
  }

  options = {         //alle Options nochmal, damit max wert update bekommt
    borderColor: 'rgba(0,0,0)',
    elements: {
      point: {
        radius: 0
      }
    },
    legend: {
      display: false
    },
    animation: false,
    responsive: false,
    scales: {

      yAxis: {
        max: max,   //Y-Achse Max Wert wird zu max. Wert aus den Summenarrays
        min: 0,
        grid: {
          borderColor: 'rgba(0,0,0)'
        }
      },
      xAxis: {
        ticks: {
          display: false
        },
        //display: false,
        grid: {
          display: false,
          //borderColor: 'rgba(0,0,0)'
        }
        //ticks: {
        //display: false
        //}
      }
    },


    /*plugins: {
      title: {
        display: true,
      },
    },*/
  };
  einsKopie = Array.from(summenarray);        //Für Rücksprünge
  zweiKopie = Array.from(summenarrayZwei);
  dreiKopie = Array.from(summenarrayDrei);


  //console.log(zeitarray);



  stelleImArray = 0;
  laengeOriginal = summenarray.length;
  StepString = "";
  indexArray.push(-1);  //Sonst wird versucht auf nicht existierendes Element zuzugreifen
  stepKopie = Array.from(stepTimes);
  document.getElementById("Forma").style.display = "block";           //Anzeige visible machen
  document.getElementById("stepDownload").style.display = "inline";
  document.getElementById("StepZahl").innerHTML = indexArray.length - 1 + " Schritte";
  //console.log(stepTimes);

  if (step) {               //wenn Schrittanalyse
    stepTimes = [];         //resets falls vorher schon benutzt
    indexArray = [];
    rollingIndex = [];
    flachIndex = [];
    zehIndex = [];
    stepStartTime = 0;
    stepEndTime = 0;
    Ferse = false;
    maxZeh = false;
    StepString = "";
    stelleImArray = 0;
    laengeOriginal = 0;
    saveWo = 0;

    var schnitt = 0;          //Schnittwert berechnet für evtl. Schrittschwellen
    for (var runnnn = 0; runnnn < summenarray.length; runnnn++) {
      schnitt += summenarray[runnnn];
    }
    startSchwellwert = schnitt / summenarray.length + 10;
    startSlide.value = schnitt / summenarray.length + 10;
    sSlideOut.innerHTML = schnitt / summenarray.length + 10;
    document.getElementById("ThreshConfirm").style.display = "block";
    return;
    for (var runAll = 0; runAll < summenarray.length; runAll++) {        //einmal alle Frames durchgehen
      if (Ferse == false && summenarrayDrei[runAll] > 10 /*&& summenarrayDrei[runAll] < 35*/) {      //wenn Fersenwert über 10, neuer Schritt
        rollingIndex.push(runAll);    //abgespeichert, an welcher Stelle neuer Schritt begonnen- für Rüücksprung
        Ferse = true;
        stepStartTime = Number(zeitarray[runAll]);  //Wann Schritt begonnen
      }
      if (Ferse && maxZeh == false && summenarray[runAll] > 60) { //Wenn Ferse true und Wert über 60 bereit für Schrittende
        maxZeh = true;
      }
      if (maxZeh && summenarray[runAll] < 40) {  //Wenn wieder unter 40 kommt Schrittende, Wert vielleicht noch zu verändern
        Ferse = false;
        maxZeh = false;
        stepEndTime = Number(zeitarray[runAll]);    //Wann Schritt geendet
        indexArray.push(runAll);            //an welcher stelle schritt geendet, für wann Anzeige updaten
        //stepTimes.push(stepEndTime);
        if (stepEndTime > stepStartTime) {      //falls MS Wert größer ist einfach Differenz
          stepTimes.push(stepEndTime - stepStartTime);  //in Array

        }
        else {
          stepTimes.push(60000 - stepStartTime + stepEndTime);  //sonst hat 60000 überschritten
        }
      }
    }
  }

}

var conBut = document.getElementById("ThreshConfirm");
document.getElementById("ThreshConfirm").addEventListener("click", function () {
  document.getElementById("ThreshConfirm").style.display = "none";
  continueSteps();
});

var hochpunkt = 0;
var tiefpunkt = 0;
var minNeu = false;
var zehPush = false;

function continueSteps() {
  for (var runAll = 0; runAll < summenarray.length; runAll++) {        //einmal alle Frames durchgehen
    if (Ferse == false && summenarrayDrei[runAll] > Number(startSchwellwert) /*&& summenarrayDrei[runAll] < 35*/) {      //wenn Fersenwert über 10, neuer Schritt
      rollingIndex.push(runAll);    //abgespeichert, an welcher Stelle neuer Schritt begonnen- für Rücksprung
      Ferse = true;
      stepStartTime = Number(zeitarray[runAll]);  //Wann Schritt begonnen
    }
    if (Ferse == true && maxZeh == false && summenarray[runAll] > Number(startSchwellwert) + 10) { //Wenn Ferse true und Wert über 60 bereit für Schrittende
      maxZeh = true;
      hochpunkt = summenarray[runAll];
      tiefpunkt = hochpunkt / 2;
      flachIndex.push(runAll);
    }
    if (maxZeh) {
      if (summenarray[runAll] > hochpunkt) {
        hochpunkt = summenarray[runAll];
      }
      else if (summenarray[runAll] < hochpunkt) {
        if (summenarray[runAll] < tiefpunkt) {
          tiefpunkt = summenarray[runAll];
          minNeu = true;
          if (zehPush == false) {
            zehIndex.push(runAll);
            zehPush = true;
          }
        }
        else if (summenarray[runAll] > tiefpunkt && minNeu) {
          Ferse = false;
          maxZeh = false;
          stepEndTime = Number(zeitarray[runAll]);    //Wann Schritt geendet
          indexArray.push(runAll);            //an welcher stelle schritt geendet, für wann Anzeige updaten
          //stepTimes.push(stepEndTime);
          if (stepEndTime > stepStartTime) {      //falls MS Wert größer ist einfach Differenz
            stepTimes.push(stepEndTime - stepStartTime);  //in Array

          }
          else {
            stepTimes.push(60000 - stepStartTime + stepEndTime);  //sonst hat 60000 überschritten
          }
          minNeu = false;
          zehPush = false;
        }
      }
    }
    /*if (maxZeh && summenarray[runAll] < endSchwellwert) {  //Wenn wieder unter 40 kommt Schrittende, Wert vielleicht noch zu verändern
      Ferse = false;
      maxZeh = false;
      stepEndTime = Number(zeitarray[runAll]);    //Wann Schritt geendet
      indexArray.push(runAll);            //an welcher stelle schritt geendet, für wann Anzeige updaten
      //stepTimes.push(stepEndTime);
      if(stepEndTime>stepStartTime) {      //falls MS Wert größer ist einfach Differenz
        stepTimes.push(stepEndTime-stepStartTime);  //in Array
        
      }
      else {
        stepTimes.push(60000 - stepStartTime + stepEndTime);  //sonst hat 60000 überschritten
      }
    }*/
  }
  stelleImArray = 0;
  laengeOriginal = summenarray.length;
  StepString = "";
  stepKopie = Array.from(stepTimes);
  document.getElementById("stepDownload").style.display = "inline";
  document.getElementById("StepZahl").innerHTML = indexArray.length - 1 + " Schritte";


  savedCom = Array.from(completeFile);                        //Backup des Array für die Rücksprünge
  laenge = savedCom.length;                                 //Länge des Arrays
  progressbar.style.display = "inline";   //Anzeigen der Progressbar
  console.log(Date.now());
  displayIt();  //Alles verarbeitet und in 1 riesen Array, jetzt Anzeigen lassen
}



var oneStep = true;     //Für Form, ob 1 step oder mehrere download

document.getElementById("oneStep").addEventListener("change", FormDisplay);
document.getElementById("multipleSteps").addEventListener("change", FormDisplay); //bei Veränderung funktionsaufruf

function FormDisplay() {
  if (document.getElementById("oneStep").checked) {      //wenn 1 schritt
    oneStep = true;
    document.getElementById("hideIfOne").style.display = "none";
    document.getElementById("LabelOne").innerHTML = "Schrittnummer"
  }
  else {
    oneStep = false;
    document.getElementById("hideIfOne").style.display = "inline";
    document.getElementById("LabelOne").innerHTML = "Erster Schritt"
  }
}
var stepRequest = [];
var vonIn = 0;
var bisIn = 0;
var dataC = 0;
var stringSteps = "";
var dataToSix = 0;
var minuteCount = 0;
var millisave = 0;
var SchrittNo = 0;
var asZIP = false;
var zipp = new JSZip();

document.getElementById("zip").addEventListener("change", function () {
  asZIP ? asZIP = false : asZIP = true;
})

document.getElementById("formDone").addEventListener("click", function () {     //Für den Schritte download
  zipp = new JSZip();
  minuteCount = 0;
  millisave = 0;
  //console.log(oneStep);
  stepRequest = [];
  dataC = 0;
  stringSteps = "";
  dataToSix = 0;
  var stepNumber = Number(document.getElementById("firstStep").value);  //welcher Schritt soll download?
  if (stepNumber > stepTimes.length - 2) {  //wenn höher als Schrittnummer (-2 weil letztes Element kkünstliches -1)
    stepNumber = stepTimes.length - 2;      //dann einfach letzten Schritt wählen
  }

  if (oneStep == false) {  //bei mehreren Schritten

    var stepEndNo = Number(document.getElementById("lastStep").value);  //was im 2. Kästchen steht
    //console.log(stepEndNo + "und" + stepNumber);

    if (stepEndNo == stepNumber) {   //Wenn gleich, dann wie als wäre nur 1 Schritt
      if (stepNumber > 0) {  //Wenn über 0
        vonIn = rollingIndex[stepNumber];
        bisIn = indexArray[stepNumber];
        for (var between = vonIn * (arraySoll+1); between < bisIn * (arraySoll+1); between++) {  //im kompletten Array * 109, da ja 109 * mehr Werte hat als Summenarray
          if (between % (arraySoll+1) == 0) {  //alle 109 Werte keine Werte sondern MS: und so
            if (Number(savedCom[between]) < Number(millisave)) {
              minuteCount++;
            }
            millisave = savedCom[between];
            stringSteps += dataC + " MS:" + savedCom[between] + " M:" + minuteCount + " H: \n";   //dataC ist eigener Counter, dann MS Zeit
            dataC++;
            dataToSix = 0;  //Counter bis 6, weil im csv doc 6 pro Zeile sein sollen
          }
          else {  //wenn normaler Wert
            dataToSix++;
            if (dataToSix >= 6) {  //größer gleich nur falls glitch oder so
              stringSteps += savedCom[between] + "\n";  //Wert und dann Zeilenumbruch
              dataToSix = 0;
            }
            else {
              stringSteps += savedCom[between] + ","; //sonst Wert und dann Komma
            }
          }
        }
      }
      else {     //wenn Zahl kleiner als 1 eingegeben
        stepNumber = 0;   //dann 0. Schritt
        vonIn = rollingIndex[0];
        bisIn = indexArray[0];
        for (var between = vonIn * (arraySoll+1); between < bisIn * (arraySoll+1); between++) {  //gleich wie sonst, für 0. Schritt
          if (between % (arraySoll+1) == 0) {
            if (Number(savedCom[between]) < Number(millisave)) {
              minuteCount++;
            }
            millisave = savedCom[between];
            stringSteps += dataC + " MS:" + savedCom[between] + " M:" + minuteCount + " H: \n";
            dataC++;
            dataToSix = 0;
          }
          else {
            dataToSix++;
            if (dataToSix >= 6) {
              stringSteps += savedCom[between] + "\n";
              dataToSix = 0;
            }
            else {
              stringSteps += savedCom[between] + ",";
            }
          }
        }
      }
    }

    else {    //wenn 2 unterschiedliche Zahlen eingegeben wurden
      //console.log(stepEndNo + "und StepNo="+stepNumber);
      //console.log(stepEndNo<stepNumber);
      if (stepEndNo < stepNumber) {    //wenn von größer als bis 
        //console.log("wieso");
        //console.log("stepEndNo:"+stepEndNo + " StepNumber:"+stepNumber);
        var temptemp = stepEndNo;     //für tausch tempVariable
        if (stepNumber > 0) {            //muss größer als 0 sein, sonst = 0
          stepEndNo = stepNumber;
        }
        else {
          stepEndNo = 0;
        }
        stepNumber = temptemp;    //Tausch komplett
      }
      else {                          //wenn richtig eingegeben
        if (stepNumber > 0) {     //dann nix
          //console.log("ok bis hier");

        }
        else {                  //sonst = 0
          stepNumber = 0;
        }
      }
      if (stepEndNo > stepTimes.length - 2) {  //wenn höher als Schrittnummer (-2 weil letztes Element kkünstliches -1) wie vorher
        stepEndNo = stepTimes.length - 2;      //dann einfach letzten Schritt wählen
        //console.log("broken");
      }
      SchrittNo = stepNumber;
      var tempRolling = rollingIndex[(SchrittNo + 1)] * (arraySoll+1);
      vonIn = rollingIndex[stepNumber];     //vonIndex nummer bisIndex nummer
      bisIn = indexArray[stepEndNo];
      for (var between = vonIn * (arraySoll+1); between < bisIn * (arraySoll+1); between++) {      //für alle Werte in Intervall
        if (between % (arraySoll+1) == 0) {      //eigentlich gleich wie vorher
          if (between >= tempRolling) {
            if (asZIP) {

              zipp.file(SchrittNo + ".csv", stringSteps);
              stringSteps = "";

            }
            SchrittNo++;
            tempRolling = rollingIndex[(SchrittNo + 1)] * (arraySoll+1);
          }

          if (Number(savedCom[between]) < Number(millisave)) {
            minuteCount++;
          }
          millisave = savedCom[between];
          stringSteps += dataC + " MS:" + savedCom[between] + " M:" + minuteCount + " H: S:" + SchrittNo + "\n";
          dataC++;
          dataToSix = 0;
        }
        else {
          dataToSix++;
          if (dataToSix >= 6) {
            stringSteps += savedCom[between] + "\n";
            dataToSix = 0;
          }
          else {
            stringSteps += savedCom[between] + ",";
          }
        }
      }

    }
  }
  if (oneStep) {             //gleich wie vorher nur direkt für 1
    if (stepNumber > 0) {
      vonIn = rollingIndex[stepNumber];
      bisIn = indexArray[stepNumber];
      for (var between = vonIn * (arraySoll+1); between < bisIn * (arraySoll+1); between++) {
        if (between % (arraySoll+1) == 0) {
          if (Number(savedCom[between]) < Number(millisave)) {
            minuteCount++;
          }
          millisave = savedCom[between];
          stringSteps += dataC + " MS:" + savedCom[between] + " M:" + minuteCount + " H: \n";
          dataC++;
          dataToSix = 0;
        }
        else {
          dataToSix++;
          if (dataToSix >= 6) {
            stringSteps += savedCom[between] + "\n";
            dataToSix = 0;
          }
          else {
            stringSteps += savedCom[between] + ",";
          }
        }
      }
    }
    else {
      stepNumber = 0;
      vonIn = rollingIndex[0];
      bisIn = indexArray[0];
      for (var between = vonIn * (arraySoll+1); between < bisIn * (arraySoll+1); between++) {
        if (between % (arraySoll+1) == 0) {
          if (Number(savedCom[between]) < Number(millisave)) {
            minuteCount++;
          }
          millisave = savedCom[between];
          stringSteps += dataC + " MS:" + savedCom[between] + " M:" + minuteCount + " H: \n";
          dataC++;
          dataToSix = 0;
        }
        else {
          dataToSix++;
          if (dataToSix >= 6) {
            stringSteps += savedCom[between] + "\n";
            dataToSix = 0;
          }
          else {
            stringSteps += savedCom[between] + ",";
          }
        }
      }
    }
  }
  //console.log(stepRequest);
  //console.log(stringSteps);
  var reqsteps = "data:text/csv;charset=utf-8," + stringSteps;        //requested Steps: header für csv + String der erstellt wurde
  var encodedUriReq = encodeURI(reqsteps);                            //richtiges format
  var linkReq = document.createElement("a");                          //a element dafür
  linkReq.setAttribute("href", encodedUriReq);                        //link zu file
  if (oneStep) {
    linkReq.setAttribute("download", "Step" + stepNumber + ".csv");      //wenn 1 step angefordert dann heißt datei StepX.csv
  }
  if (asZIP) {
    zipp.generateAsync({ type: "blob" })
      .then(function (content) {
        saveAs(content, "Schritte.zip");
      });
    return;
  }
  else {
    linkReq.setAttribute("download", stepNumber + "bis" + stepEndNo + ".csv");    //sonst XbisX.csv

  }

  document.body.appendChild(linkReq);     //a element anhängen
  linkReq.click();                        //und clicken lassen


});



var prevTime = 0; //Vars für Zeitberechnung
var timenow = 0;
var timeout = 1000;
var counToTen = 0;
var timerouts;
var saveWo = 0;

function displayAfter() { //Aufgerufen in displayIt & wenn Stop aufgehoben
  if (stopBool == false) {    //Wenn nicht Stop, nach berechneter Zeit nochmal displayIt()
    timerouts = setTimeout(displayIt, timeout / malTime);
  }

}

function displayIt() {
  prevTime = Number(completeFile.splice(0, 1)); //letzte Zeit = 1. Eintrag aus Array (MS: Zeit)
  //stateArrayTwo = completeFile.splice(0, 108);

  if (completeFile.length < arraySoll) {          //Wenn weniger als 108/72 Werte verbleiben aufhören
    console.log(Date.now());
    loop();
    return;
  }
  stateArray = completeFile.splice(0, arraySoll); //stateArray (zum rendern) = 1. 108 Einträge v completeFile (bei splice werden Einträge gleichzeitig gelöscht aus altem Array)

  timenow = Number(completeFile[0]);  //Zeit von nächstem Datensatz
  //Berechnung für nächstes Timeout
  if (timenow >= prevTime) {   //Wenn nicht neue Minute angebrochen wurde
    timeout = timenow - prevTime;  //timeout ist differenz v Zeiten -2 für Delay durch Programm
  }
  else {    //sonst -> wenn neue Min angebrochen
    timeout = timenow + (60000 - prevTime);  //tiomeout ist nächste Zeit + was zur Min vorher gefehlt hat
  }
  if (graphIsOn) {      //Wenn auch Graphen
    data.splice(0, 1);      //Anfangs 100 0 Einträge, 0. Eintrag wird gelöscht
    data = data.concat(summenarray.splice(0, 1));      //Hinten einer drangehangen-- concat statt push damit man noch ändern kann, wie viele immer auf einmal
    dataZwei.splice(0, 1);   //gleiches für andere 2 Graphen
    dataZwei = dataZwei.concat(summenarrayZwei.splice(0, 1));
    dataDrei.splice(0, 1);
    dataDrei = dataDrei.concat(summenarrayDrei.splice(0, 1));
    if (step) {
      stelleImArray = laengeOriginal - summenarray.length;      //stelleImArray updaten
      if (stelleImArray == rollingIndex[saveWo]) {
        document.getElementById("FFerse").style.display = "block";
        document.getElementById("FFlach").style.display = "none";
        document.getElementById("FZeh").style.display = "none";
        document.getElementById("FOben").style.display = "none";
      }
      if (stelleImArray == flachIndex[saveWo]) {
        document.getElementById("FFerse").style.display = "none";
        document.getElementById("FFlach").style.display = "block";
        document.getElementById("FZeh").style.display = "none";
      }
      if (stelleImArray == zehIndex[saveWo]) {
        document.getElementById("FFerse").style.display = "none";
        document.getElementById("FFlach").style.display = "none";
        document.getElementById("FZeh").style.display = "block";
      }
      if (stelleImArray == indexArray[saveWo]) {                //wenn Schrittende erreicht wird
        document.getElementById("FFerse").style.display = "none";
        document.getElementById("FFlach").style.display = "none";
        document.getElementById("FZeh").style.display = "none";
        document.getElementById("FOben").style.display = "block";
        if (StepString.length >= 240) {                          //wenn String schon max Länge hat
          StepString = StepString.slice(0, StepString.lastIndexOf("&#8226"));   //Slice den letzten Wert
        }
        StepString = "<br>&#8226 " + saveWo + ":&#9;" + stepTimes[saveWo] + "MS" + StepString;  //String mit neuem Wert und Counter und Punkt davor
        document.getElementById("StepAnzeige").innerHTML = StepString;  //Anzeige updaten
        saveWo++;

      }
    }

    //counToTen = 0;
    datak = {     //Data wird geupdated
      labels,
      datasets: [
        {
          data: data,
          borderColor: lineFarbe,
        }
      ],
    };
    datakZwei = {
      labels,
      datasets: [
        {
          data: dataZwei,
        }
      ],
    };
    datakDrei = {
      labels,
      datasets: [
        {
          data: dataDrei,
        }
      ],
    };
    //counToTen++;
    /*if (counToTen > 9) {
      data.splice(0, 10);
      data = data.concat(summenarray.splice(0,10));
      counToTen = 0;
      datak = {
        labels,
        datasets: [
          {
            data: data,
          },
        ],
      };*/
  }
  //root.render(<Secondgrid />);
  counToTen++;
  if (counToTen >= 10) { //Alle 10 Anzeigen wird die progressbar geupdated -> ca 3 mal pro Sekunde
    progressbar.value = Math.round((1 - completeFile.length / laenge) * 100); //Verhältnis von wie viel übrig ist/ wie viel am Anfang
    counToTen = 0;
  }
  if (FilterOn) {     //Wenn Filter bool an
    fakeGauss();      //dann Filterberechnungen
  }

  root.render(<Grid />);  //Anzeigen
  displayAfter();   //für nächsten Datensatz & timeout
}

document.getElementById("stepDownload").addEventListener("click", function () {      //nochmal download erstellen wie schon öfters
  var StepString = "data:text/csv;charset=utf-8," + stepKopie.join(",");
  var encodedUriStep = encodeURI(StepString);
  var linkStep = document.createElement("a");
  linkStep.setAttribute("href", encodedUriStep);
  linkStep.setAttribute("download", "StepData.csv");
  document.body.appendChild(linkStep);
  linkStep.click();
});



progressbar.onchange = function () {   //Wenn User Progressbar irgendwo hinsetzt
  clearTimeout(timerouts);            //Stoppen der Anzeige
  completeFile = Array.from(savedCom);  //Backups werden geladen
  summenarray = Array.from(einsKopie);
  summenarrayZwei = Array.from(zweiKopie);
  summenarrayDrei = Array.from(dreiKopie);
  //stepTimes = Array.from(stepKopie);
  summenarray.splice(0, Math.round(summenarray.length * (progressbar.value / 100)));  //Backups gekürzt, bis da wo User will
  summenarrayZwei.splice(0, Math.round(summenarray.length * (progressbar.value / 100)));
  summenarrayDrei.splice(0, Math.round(summenarray.length * (progressbar.value / 100)));
  data = Array(100).fill(0);
  dataZwei = Array(100).fill(0);
  dataDrei = Array(100).fill(0);
  var spliceBy = Math.round(completeFile.length * (progressbar.value / 100));
  while ((spliceBy % arraySoll+1) != 0) {  //Hier muss durch 109 teilbar sein, da complete File immer DatenSätze von 109 sind
    spliceBy++;
  }
  if (step) {       //stelleImArray herausfinden
    stelleImArray = laengeOriginal - summenarray.length;
    for (var varx = 0; varx < indexArray.length; varx++) {  //nächsten Step finden und dahin saveWo setzen
      saveWo = varx;
      if (stelleImArray < indexArray[varx]) {    //sobald stelleimarray noch nicht war for schleife break
        StepString = "";
        break;
      }
    }

  }


  completeFile.splice(0, spliceBy);
  prevTime = 0;
  timenow = 0;
  timeout = 100;
  displayAfter(); //zurückkehren zur Anzeige ab neuem Startpunkt
}



function loop() {
  clearTimeout(timerouts);            //Stoppen der Anzeige
  completeFile = Array.from(savedCom);  //Backups werden geladen
  summenarray = Array.from(einsKopie);
  summenarrayZwei = Array.from(zweiKopie);
  summenarrayDrei = Array.from(dreiKopie);
  //stepTimes = Array.from(stepKopie);
  data = Array(100).fill(0);
  dataZwei = Array(100).fill(0);
  dataDrei = Array(100).fill(0);

  if (step) {       //stelleImArray herausfinden
    stelleImArray = laengeOriginal - summenarray.length;
    StepString = "";
    saveWo = 0;
  }

  prevTime = 0;
  timenow = 0;
  timeout = 100;
  displayAfter(); //zurückkehren zur Anzeige ab neuem Startpunkt
}







var useArray = [];
var pushValues = false;
var prevArray = [];
var byteArray = [];
var changed = false;
var highBit = true;
var byteToMod = 6;
var record = false;
var saveThis = [];

document.getElementById("aufnahme").addEventListener('click', function () {  //Wenn aufnahmebeginn gedrückt
  if (record) {
    record = false; //wenn vorher true jetzt false
    if(sixXtwelve) {
      let rawsixtwelve = "data:text/csv;charset=utf-8," + saveThis;
      var downdis = encodeURI(rawsixtwelve);
      var link612 = document.createElement("a");
      link612.setAttribute("href", downdis);
      link612.setAttribute("download", "612RAW.csv");
      document.body.appendChild(link612);
      link612.click();
    }
    else {
      lalax(saveThis);
    }

    /*document.getElementById("aufnahme").innerHTML="Aufnahmebeginn"  //Buttonanzeige verändern
    let csvInhalt = "data:text/csv;charset=utf-8," + saveThis.join(",");  //gespeichertes Array als String, zwischen Einträgen Kommas
    var encodedUri = encodeURI(csvInhalt);  //String -> Uniform Resource Identifier URI
    var link = document.createElement("a"); //unsichtbarer link erstellt
    link.setAttribute("href", encodedUri);  //bekommt Datei zugewiesen
    link.setAttribute("download", "recordedData.csv");  //Name wenn gedownloaded
    document.body.appendChild(link);  //an doc angehangen
    link.click();     //Link clicken lassen -> wird gedownloaded*/
    //window.open(encodedUri);

  }
  else {
    record = true;  //Wenn vorher false, jetzt recorded
    document.getElementById("aufnahme").innerHTML = "Aufnahme Ende" //Text im Button ändern
  }
})
//BLE DATA
// ASCII M=77 S=83 :=58 Space=32 H=72 $=36 < Meistens eingeschlossen von $
function sixOrTwelve(event) {
  if(sixXtwelve) {
    newSTData(event);
  }
  else {
    newBLEData(event);
  }
}

function newSTData(event) {
  useArray = Array.from(new Uint8Array(event.target.value.buffer));
  if(record) {
    saveThis = saveThis.concat(useArray);
    saveThis += "\n";
  }
  if(useArray.length>=108) {
    eightToTwelve(useArray);
  }
}
var firstByte = 0;
var secondByte = 0;

function eightToTwelve(oneFrame) {
  stateArray = [];
  for(var i=2; i<oneFrame.length; i+=3) {                //conversion 3 Bytes -> 2 x 12Bit
    firstByte = oneFrame[i-2].toString(2);               //1. Byte wird in binary form als string gespeichert
    firstByte += oneFrame[i].toString(2).slice(0,4);      // ersten 4 bit von aufgeteiltem 3. Byte werden angehangen
    secondByte = oneFrame[i-1].toString(2);         
    secondByte += oneFrame[i].toString(2).slice(4);
    firstByte = parseInt(firstByte, 2);                   //String wird in Decimal Zahl gewandelt
    secondByte = parseInt(secondByte, 2);
    stateArray.push(firstByte);
    stateArray.push(secondByte);

  }
  //console.log(stateArray);

  if (graphIsOn) {    //Graph für Live BLE
    sumOf = 0;
    sumOfZwei = 0;
    for (var d = 0; d < 24; d++) { //Ferse oder Vorderfuß?
      sumOf += stateArray[d];
    }
    data.splice(0, 1);
    data.push(Math.round(sumOf / 24));
    for (var d = 48; d < 72; d++) { //Ferse oder Vorderfuß?
      sumOfZwei += stateArray[d];
    }
    dataDrei.splice(0, 1);
    dataDrei.push(Math.round(sumOfZwei / 24));

    datak = {
      labels,
      datasets: [
        {
          data: data,
          borderColor: lineFarbe,
        }
      ],
    };

    datakDrei = {
      labels,
      datasets: [
        {
          data: dataDrei,
        }
      ],
    };


    ///////STEP NOCHMAL UMSCHREIBEN
  }

  if (FilterOn) { //auch Filterberechnungen wenn gewollt
    fakeGauss();
  }

  root.render(<Grid />);
  
}

function newBLEData(event) {   //aufgerufen wenn neue BLE Daten
  changed = false;
  prevArray = useArray;
  useArray = Array.from(new Uint8Array(event.target.value.buffer)); //20 Bytes als je 8 Bit Ints -> 20 Einträge 0-255 
  if (record) {
    saveThis = saveThis.concat(useArray);
  }

  if (pushValues) {   //Falls H:X$ dann jetzt Daten, suche nach $X
    for (var p = 0; p < useArray.length; p++) {  //Über 20 Einträge je
      if (sixXtwelve == false) {
        if (useArray[p] == 36) {  //falls $ Zeichen gefunden
          if (p < useArray.length - 1) {             //falls nach $ noch was im array
            if (useArray[p + 1] >= 48 && useArray[p + 1] <= 57) {
              pushValues = false;   //ist nach $  ASCII 0-9?
              bisHier(useArray, p); //Wenn ja dann nur bis hier hin Values beachten
              changed = true;   //Datensatz ist nicht rein Werte
              break;
            }
          }
        }
      }
      else {
        if (useArray[p] == 0) {  //falls 0 Zeichen gefunden
          if (p < useArray.length - 1) {             //falls nach 0 noch was im array
              pushValues = false;  
              bisHier(useArray, p); //Wenn ja dann nur bis hier hin Values beachten
              changed = true;   //Datensatz ist nicht rein Werte
              break;
          }
        }
      }
    }
  }


  if (pushValues == false) {    //Suche nach H:X$
    for (var o = 0; o < useArray.length; o++) {
      if(sixXtwelve == false) {
        if (useArray[o] == 36) {  //Wenn $ gefunden 
          if (o > 0) {
            if (useArray[o - 1] >= 48 && useArray[o - 1] <= 57) { //War vorher ASCII 0-9?
              stateArray = [];  //dann start neuer Datensatz
              abHier(useArray, o);  //Ab $
              pushValues = true;
              changed = true;
              break;
            }
          }
          else if (prevArray[prevArray.length - 1] >= 48 && prevArray[prevArray.length - 1] <= 57) {  //Gleiches nur wird vorheriges Element durch prev gecheckt
            stateArray = [];
            abHier(useArray, o);
            pushValues = true;
            changed = true;
            break;
          }
        }
      }
      else {
        if (useArray[o] == 0) {  //Wenn 0 gefunden 
              stateArray = [];  //dann start neuer Datensatz
              abHier(useArray, o);
              pushValues = true;
              changed = true;
              break;
        }
      }

    }
  }
  if (changed == false) { //Falls Einträge rein Data waren
    for (var q = 0; q < useArray.length; q++) {
      byteArray.push(useArray[q]);  //byteArray wird aufgefüllt
    }
  }
}

function abHier(datArray, von) {  //byteArray wird aufgefüllt ab Zeichen+1
  for (var l = von + 1; l < datArray.length; l++) {
    byteArray.push(datArray[l]);
  }
}
function bisHier(datArray, bis) { //byte Array wird gefüllt bis Zeichen, danach Funktionsaufruf um 8Bit Werte zu 10Bit zu wandeln
  for (var l = 0; l < bis; l++) {
    byteArray.push(datArray[l]);
  }
  eightToTen(byteArray);
}

var workArray = [];
var sumOf = 0;
var sumOfZwei = 0;
var step = true;
var timeStart = 0;
var timeEnde = 0;
var maxVal = false;
var rolling = false;
var stepNo = 0;
function eightToTen(workArrayy) {  //Hier von 8 zu 10Bit
  workArray = Array.from(workArrayy);
  byteArray = [];
  if (workArray.length % 8 == 0) {  //Nur falls Werte Anzahl / 8 teilbar
    for (var r = 6; r < workArray.length; r += 8) {  //Einmal pro 8 Einträge, beginn 6. eintrag
      if (workArray[r] != 0) {  //Falls 6. eintrag nicht null
        byteToMod = 6;    //um welchen Eintrag es im Moment geht ByteToModify
        highBit = true;   //Geht um das MSB
        var binary = workArray[r].toString(2);  //7. Element in binary Form
        while (binary.length < 4) {
          //console.log("binary");
          binary = "0" + binary;        //Damit 4Bit ist, nicht weniger
        }
        for (var s = 0; s < 4; s++) {
          if (binary.slice(s, s + 1) == "1") { //Hier s. element ausgewertet
            if (highBit) {
              workArray[r - byteToMod] += 512;  //Wenn MSB 512
            }
            else {
              workArray[r - byteToMod] += 256;  //Sonst 256
            }
          }
          highBit ? highBit = false : highBit = true; //Wenn grade highbit dann jetzt nicht mehr und andersrum
          if (s == 1) {
            stateArray.push(workArray[r - byteToMod]);  //nach 2 operationen muss Wert gepusht werden und nächstes Byte jetzt Mod
            byteToMod--;
          }
        }
        stateArray.push(workArray[r - byteToMod]);  //am ende nochmal pushen
      }
      else {  //Falls 7. eintrag 0, dann bleiben Werte wie waren
        for (var s = 6; s > 4; s--) {
          stateArray.push(workArray[r - s]);
        }
      }

      if (workArray[r + 1] != 0) {
        highBit = true;
        byteToMod = 4;
        var binary = workArray[r + 1].toString(2);  //Wie oben
        while (binary.length < 8) {
          binary = "0" + binary;
        }
        for (var s = 0; s < 8; s++) {
          if (binary.slice(s, s + 1) == "1") {
            if (highBit) {
              workArray[r - byteToMod] += 512;
            }
            else {
              workArray[r - byteToMod] += 256;
            }
          }
          highBit ? highBit = false : highBit = true;
          if (s % 2 == 1) {           //alles gleich wie oben, nur hier muss jedes 2. mal statt nur 1 mal
            stateArray.push(workArray[r - byteToMod]);
            byteToMod--;
          }
        }
        //stateArray.push(workArray[r-byteToMod]);
      }
      else {  //Falls 7. eintrag 0, dann bleiben Werte wie waren
        for (var s = 4; s > 0; s--) {
          stateArray.push(workArray[r - s]);
        }
      }
    }
  }
  if (graphIsOn) {    //Graph für Live BLE
    sumOf = 0;
    sumOfZwei = 0;
    for (/*var d=72; d<108; d++*/var d = 0; d < 36; d++) { //Ferse oder Vorderfuß?
      sumOf += stateArray[d];
    }
    data.splice(0, 1);
    if (isNaN(sumOf)) {     //wenn notANumber dann vorherigen Weret nochmal
      data.push(data[data.length - 1]);
    }
    else {
      data.push(Math.round(sumOf / 36));
    }
    for (var d = 72; d < 108; d++) { //Ferse oder Vorderfuß?
      sumOfZwei += stateArray[d];
    }
    dataDrei.splice(0, 1);
    if (isNaN(sumOfZwei)) {
      dataDrei.push(data[data.length - 1]);
    }
    else {
      dataDrei.push(Math.round(sumOfZwei / 36));
    }




    datak = {
      labels,
      datasets: [
        {
          data: data,
          borderColor: lineFarbe,
        }
      ],
    };

    datakDrei = {
      labels,
      datasets: [
        {
          data: dataDrei,
        }
      ],
    };


    if (step) {           //so ähnlich wie bei Auswertung von alten CSVs
      if (rolling == false && sumOfZwei / 36 > startSchwellwert /*&& sumOfZwei/36 < 20*/) {
        timeStart = Date.now(); //Date() funktion gibt MS Wert seit irgend Datum 19XX an
        rolling = true;
        console.log("ROLLING");
      }
      if (rolling && maxVal == false && sumOf / 36 > startSchwellwert + 10) {
        maxVal = true;
        console.log("MAX");
      }
      if (maxVal && sumOf / 36 < endSchwellwert) {
        rolling = false;
        maxVal = false;
        timeEnde = Date.now() - timeStart;
        if (StepString.length >= 240) {
          StepString = StepString.slice(0, StepString.lastIndexOf("&#8226"));
        }

        StepString = "<br>&#8226 " + stepNo + ":&#9;" + timeEnde + "MS" + StepString;
        stepNo++;
        document.getElementById("StepAnzeige").innerHTML = StepString;
        stepKopie.push(timeEnde);
        console.log(timeEnde);

      }
    }
  }

  if (FilterOn) { //auch Filterberechnungen wenn gewollt
    fakeGauss();
  }

  root.render(<Grid />);

}


//BLE VERBINDUNG /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

var bluetoothDevice;
var gattconnect;
var connectBool = false;
document.getElementById("CONNECT").addEventListener('click', function letsGo() {  //benötigt aktiv click, geht nicht automatisch
  if (connectBool) {
    connectBool = false;
    document.getElementById("CONNECT").innerHTML = "Verbinden";
    bluetoothDevice.gatt.disconnect();  //Disconnect BLE Device
    return;
  }

  stateArray = [];
  navigator.bluetooth.requestDevice({
   
   /* filters: [{
      //services: [0xffe1, 0xffe0]
      //name: 'ArduinoBLECounter'  //Nur devices mit Namem BT05 werden angezeigt, anderes theoretisch auch möglich //'BT05'
      //services: ['12b4735e-0385-3c45-06f8-cc58aa4b9185']
    }],
    //optionalServices: [0xffe0, 0xffe1, '37066c16-1598-4995-75b5-6606645d8e88', "19b10000-e8f2-537e-4f6c-d104768a1214"]  //char.uuid und service uuid
    */acceptAllDevices: true,
    optionalServices: ["19b10000-e8f2-537e-4f6c-d104768a1214"]
  })
    .then(device => {     //über Promises ab hier    mit device Verbinden
      console.log(device.name);
      console.log(device);
      //console.log(characteristic.readValue());
      bluetoothDevice = device;
      /*device.watchAdvertisements();         //FUNKTIONIERT NUR WENN SONST NICHTS VERLANGT
      device.addEventListener('advertisementreceived', (event)=>{
        console.log(event.rssi);
      });*/
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      return device.gatt.connect();
    })
    .then(server => {   //Service auswählen
      gattconnect = server;
      return server.getPrimaryService("19b10000-e8f2-537e-4f6c-d104768a1214"); //alt 0xffe0
    })
    .then(service => {  //Characteristic ausgewählt
      return service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");//0xffe1 geht auch //'0000ffe1-0000-1000-8000-00805f9b34fb'
    })
    .then(characteristic => characteristic.startNotifications()) //wo values gesendet werden
    .then(characteristic => {
      useArray = [];
      pushValues = false;
      prevArray = [];
      byteArray = [];
      changed = false;
      highBit = true;
      byteToMod = 6;
      record = false;
      saveThis = [];
      stepKopie = [];
      StepString = "";
      stepNo = 0;
      //document.getElementById("Forma").style.display = "block";
      document.getElementById("stepDownload").style.display = "inline";
      options = {
        borderColor: 'rgba(0,0,0)',
        backgroundColor: 'rgba(255,255,255)',
        elements: {
          point: {
            radius: 0
          }
        },
        legend: {
          display: false
        },
        animation: false,
        responsive: false,
        scales: {
          //borderColor: 'rgba(0,0,0)',
          yAxis: {
            max: 500,  //500 für Live BLE
            min: 0,
            grid: {
              borderColor: 'rgba(0,0,0)'
            }
          },
          xAxis: {
            ticks: {
              display: false
            },
            //display: false,
            grid: {
              display: false,
              //borderColor: 'rgba(0,0,0)'
            }
          }
        },
      };
      console.log(Farbarray);
      characteristic.addEventListener('characteristicvaluechanged', sixOrTwelve);  //immer wenn neue Daten wird funktion ausgeführt
      connectBool = true;
      document.getElementsByClassName("gridall")[0].style.backgroundColor = "white";
      document.getElementById("CONNECT").innerHTML = "Trennen";
      document.getElementById("stopButton").style.display = "none";
      document.getElementById("slider").style.display = "none";
      document.getElementById("sliderOutput").style.display = "none";
      document.getElementById("slideOutput").style.display = "none";
      document.getElementById("stepDownload").style.display = "block";
      document.getElementById("stepHeader").style.display = "block";
      document.getElementById("formAndDownload").style.display = "none";
      document.getElementById("aufnahme").style.display = "block";
      document.getElementById("StepZahl").style.display = "none";
      document.getElementById("FilterSett").style.display = "block";
      progressbar.style.display = "none";
    })
    .catch(error => { console.error(error); })
});




/*document.getElementById("disc").addEventListener('click', function disconnectIt() {
    bluetoothDevice.gatt.disconnect();  //Disconnect BLE Device
});*/

function onDisconnected(event) {
  alert("Verbindung getrennt");  //Anzeige falls disconnected, gewollt oder accidental
}

// PROCESS RECORDED DATA
var rawcsv = null;
var isText = false;
var stringInMiddle = '';
var cleanedCSV = [];
var toSix = 0;
//var inRows = [];
var asString = '';


//AUFNAHMEN DIREKT VERARBEITET, NUR FALLS MAN NOCH ALTE DATEIEN HAT
/*document.getElementById('rawData').addEventListener('change', function lala() { //Wenn man Aufnahmen verarbeiten will
  asString = "data:text/csv;charset=utf-8,";
  let read = new FileReader();
  read.readAsText(document.getElementById('rawData').files[0]);
  read.onload = function (event) {          //Datei wurde als String gespeichert
    rawcsv = event.target.result.split(',');  //getrennt durch Komma, zwischen Komma je Eintrag in Array
    for (var y = 0; y<rawcsv.length; y++) {
      if (rawcsv[y] == 36 && (rawcsv[y+1] >= 48 && rawcsv[y+1] <= 57)) {  //Wie bei BLE Live Daten die Abspeicherung
        isText = true;
        stringInMiddle = '';
      }
      if (isText) {
        if (rawcsv[y] != 36) {
          stringInMiddle = stringInMiddle + (String.fromCharCode(rawcsv[y]));
        }

      }
      else {
        cleanedCSV.push(rawcsv[y]);
        toSix++;
        if (toSix == 8) {
          rowCorrect();
          cleanedCSV.push('\n');
          toSix = 0;
        }
        else {
          cleanedCSV.push(",");
        }
        

      }
      if (rawcsv[y] == 36 && (rawcsv[y-1] >= 48 && rawcsv[y-1] <= 57)) {
        isText = false;
        if (cleanedCSV[cleanedCSV.length -1] != "\n") {
          cleanedCSV.push("\n");
        }
        cleanedCSV.push(stringInMiddle);
        cleanedCSV.push("\n");
        toSix = 0;
      }
    }
    //inRows = cleanedCSV.split("\n");
    for (var i=0; i<cleanedCSV.length; i++) {
      asString = asString + cleanedCSV[i];
    }
    //console.log(asString);
    let csvInhaltclean = "data:text/csv;charset=utf-8," + cleanedCSV.join(',');
    var encodedUriclean = encodeURI(asString);
    var linkclean = document.createElement("a");
    linkclean.setAttribute("href", encodedUriclean);
    linkclean.setAttribute("download", "CleanData.csv");
    document.body.appendChild(linkclean);
    linkclean.click();
  }
});*/


function lalax(rawcsvZ) { //Wenn man Aufnahmen verarbeiten will
  asString = "data:text/csv;charset=utf-8,";
  for (var y = 0; y < rawcsvZ.length; y++) {
    if (rawcsvZ[y] == 36 && (rawcsvZ[y + 1] >= 48 && rawcsvZ[y + 1] <= 57)) {  //Wie bei BLE Live Daten die Abspeicherung
      isText = true;
      stringInMiddle = '';
    }
    if (isText) {
      if (rawcsvZ[y] != 36) {
        stringInMiddle = stringInMiddle + (String.fromCharCode(rawcsvZ[y]));
      }

    }
    else {
      cleanedCSV.push(rawcsvZ[y]);
      toSix++;
      if (toSix == 8) {
        rowCorrect();
        cleanedCSV.push('\n');
        toSix = 0;
      }
      else {
        cleanedCSV.push(",");
      }


    }
    if (rawcsvZ[y] == 36 && (rawcsvZ[y - 1] >= 48 && rawcsvZ[y - 1] <= 57)) {
      isText = false;
      if (cleanedCSV[cleanedCSV.length - 1] != "\n") {
        cleanedCSV.push("\n");
      }
      cleanedCSV.push(stringInMiddle);
      cleanedCSV.push("\n");
      toSix = 0;
    }
  }
  //inRows = cleanedCSV.split("\n");
  for (var i = 0; i < cleanedCSV.length; i++) {
    asString = asString + cleanedCSV[i];
  }
  //console.log(asString);
  let csvInhaltclean = "data:text/csv;charset=utf-8," + cleanedCSV.join(',');
  var encodedUriclean = encodeURI(asString);
  var linkclean = document.createElement("a");
  linkclean.setAttribute("href", encodedUriclean);
  linkclean.setAttribute("download", "CleanData.csv");
  document.body.appendChild(linkclean);
  linkclean.click();
}






function rowCorrect() {
  var eight = cleanedCSV.pop();
  cleanedCSV.pop();
  var seven = cleanedCSV.pop();
  cleanedCSV.pop();
  /* six = cleanedCSV[cleanedCSV.length-1];
   five = cleanedCSV[cleanedCSV.length-3];
   four = cleanedCSV[cleanedCSV.length-5];
   three = cleanedCSV[cleanedCSV.length-7];
   two = cleanedCSV[cleanedCSV.length-9];
   one = cleanedCSV[cleanedCSV.length-11];*/
  if (seven != 0) {
    var toModify = 11;
    var highBitAgain = true;
    var inBin = seven.toString(2);
    while (inBin.length < 4) {
      inBin = "0" + inBin;
    }
    for (var t = 0; t < 4; t++) {
      if (inBin.slice(t, t + 1) == "1") {
        if (highBitAgain) {
          cleanedCSV[cleanedCSV.length - toModify] = Number(cleanedCSV[cleanedCSV.length - toModify]) + 512;
        }
        else {
          cleanedCSV[cleanedCSV.length - toModify] = Number(cleanedCSV[cleanedCSV.length - toModify]) + 256;
        }
      }
    }
    highBitAgain ? highBitAgain = false : highBitAgain = true;
    if (t == 1) {
      toModify -= 2;
    }
  }

  if (eight != 0) {
    var toModify = 7;
    var highBitAgain = true;
    var inBin = eight.toString(2);
    while (inBin.length < 8) {
      inBin = "0" + inBin;
    }
    for (var t = 0; t < 8; t++) {
      if (inBin.slice(t, t + 1) == "1") {
        if (highBitAgain) {
          cleanedCSV[cleanedCSV.length - toModify] = Number(cleanedCSV[cleanedCSV.length - toModify]) + 512;
        }
        else {
          cleanedCSV[cleanedCSV.length - toModify] = Number(cleanedCSV[cleanedCSV.length - toModify]) + 256;
        }
      }
    }
    highBitAgain ? highBitAgain = false : highBitAgain = true;
    if (t % 2 == 1) {
      toModify -= 2;
    }
  }


}
var first = true;
document.getElementById("help").addEventListener('click', function helper() {
  if (first) {
    document.getElementById("ausklapp").style.display = "none";
    first = false;
  }
  if (document.getElementById("ausklapp").style.display === "none") {
    document.getElementById("ausklapp").style.display = "block";
  } else {
    document.getElementById("ausklapp").style.display = "none";
  }

  /*
    if (helpOn) {
      helpOn = false;
      document.getElementById("ausklapp").innerHTML = "";
    }
    else {
      helpOn = true;
      document.getElementById("ausklapp").innerHTML = "Für die BLE Verbindung ist Google Chrome erforderlich. <br>Außerdem muss evtl. unter <b>about://flags</b> <i>Experimental Web Platform features</i> auf <b>Enabled</b> gesetzt werden";
    }
  */
});

document.getElementById("Filter").addEventListener("change", function () {   //Filter bool ändern
  FilterOn ? FilterOn = false : FilterOn = true;
});


var addedValues = 0;
var geteiltDurch = 0;
var arraySoll = 72;

function fakeGauss() {              //Filter berechnungen
  
  addedValues = 0;
  var stateGauss = Array.from(stateArray);
  if (stateGauss.length < arraySoll) {      //wenn zu wenige Werte
    return;
  }

  for (var posVar = 0; posVar < arraySoll; posVar++) {   //sonst

    addedValues = gewichtung * Number(stateGauss[posVar]);   //mittleres mal 2
    geteiltDurch = gewichtung;           //wie viele Summanten?
    if (posVar >= 6 && posVar <= arraySoll-7) {     //wenn nicht 1. o. letzte Reihe
      addedValues += Number(stateGauss[posVar + 6]) + Number(stateGauss[posVar - 6]); //Plus Wert ober und unterhalb
      geteiltDurch += 2;  //2 werte add
      if (posVar % 6 == 0) {  //wenn links am Rand dann nur oben rechts, rechts und unten rechts
        addedValues += Number(stateGauss[posVar + 1]) + Number(stateGauss[posVar - 5]) + Number(stateGauss[posVar + 7]);
        geteiltDurch += 3;  //3 werte add
      }
      else if ((posVar + 1) % 6 == 0) { //wenn rechts am Rand dann links, oben links und unten links
        addedValues += Number(stateGauss[posVar - 1]) + Number(stateGauss[posVar - 7]) + Number(stateGauss[posVar + 5]);
        geteiltDurch += 3;  //3 werte add
      }
      else {  //wenn nicht am rand dann alle Werte drumherum (oben unten wurde schon vorher)
        addedValues += Number(stateGauss[posVar + 1]) + Number(stateGauss[posVar - 1]) + Number(stateGauss[posVar - 5]) + Number(stateGauss[posVar - 7]) + Number(stateGauss[posVar + 5]) + Number(stateGauss[posVar + 7]);
        geteiltDurch += 6;  //6 werte add
      }
    }
    else if (posVar < 6) { //wenn erste Reihe
      addedValues += Number(stateGauss[posVar + 6]); //drunter add
      geteiltDurch += 1;
      if (posVar == 0) {  //wenn oben links dann plus rechts und unten rechts
        addedValues += Number(stateGauss[1]) + Number(stateGauss[7]);
        geteiltDurch += 2; //2 werte add
      }
      else if (posVar == 5) { //wenn oben rechts dann plus links und unten links
        addedValues += Number(stateGauss[4]) + Number(stateGauss[10]);
        geteiltDurch += 2; //2 werte add
      }
      else {  //sonst plus rechts, links, unten rechts und unten links
        addedValues += Number(stateGauss[posVar + 1]) + Number(stateGauss[posVar - 1]) + Number(stateGauss[posVar + 5]) + Number(stateGauss[posVar + 7]);
        geteiltDurch += 4;  //4 werte add
      }
    }
    else if (posVar > arraySoll-7) {  //so ähnlich für letzte Reihe, halt nach oben
      addedValues += Number(stateGauss[posVar - 6]);
      geteiltDurch += 1;
      if (posVar == arraySoll-6) {
        addedValues += Number(stateGauss[arraySoll-5]) + Number(stateGauss[arraySoll-11]);
        geteiltDurch += 2;
      }
      else if (posVar == arraySoll-1) {
        addedValues += Number(stateGauss[arraySoll-2]) + Number(stateGauss[arraySoll-8]);
        geteiltDurch += 2;
      }
      else {
        addedValues += Number(stateGauss[posVar + 1]) + Number(stateGauss[posVar - 1]) + Number(stateGauss[posVar - 5]) + Number(stateGauss[posVar - 7]);
        geteiltDurch += 4;
      }
    }

    stateArray[posVar] = Math.round(addedValues / geteiltDurch);    //Neuer Wert für Quadrat ist alles Zusammen/Summantenzahl gerundet auf ganze Zahl
  }
  //console.log(stateArray);
}








// AB HIER NUR FÜR TEST

var tmr = [];
var x = 0;

function stopTmr() {  //Wenn StopButton
  if (stopBool) {
    for (var i = 0; i < 10; i++) {   //bei stop werden Timer gelöscht
      clearInterval(tmr[i]);
    }
  }
  else {
    timerStart(); //wenn weiter werden Timer nochmal gestartet
  }
}


var csv = null;
/*document.getElementById('fileInput').addEventListener('change', function FileChanged() { //ähnlich wie oben
  newData = true;
  let reader = new FileReader();  
  reader.readAsText(document.getElementById('fileInput').files[0]);
  reader.onload = function (event) { //wenn gelesen hat wird getriggert
    csv = event.target.result; //csv ist Datei als String
    timerStart();
  };
});*/

function timerStart() { // hier werden Reihen aufgeteilt und gesendet
  var reihenArrays = csv.split("\r\n"); //in reihen getrennt durch Zeilenumbruch
  for (var i = 0; i < 10; i++) {            //Initialisierung von Timern, 10 Timer mit 10MS, da JS nicht 1 Timer mit 1ms Handlen kann    
    tmr[i] = setInterval(function () {
      newRow(reihenArrays[x]);  //ReihenArray an newRow() gesendet
      x++;  //index benutzt von allen 10 Timern
    }, 10);
  }
}
setTimeout(function() {
  document.getElementById("groesser").click();
  document.getElementById("kleiner").click();
},1);
/*window.addEventListener('load', function () {
  this.document.getElementById("groesser").click();
})*/








// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


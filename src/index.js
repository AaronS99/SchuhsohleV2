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
import { Chart, Line } from 'react-chartjs-2';

var Farbarray = []; //Erstellung Farbarray, geht weiß->blau->pink->orange->rot
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

for(var i=255; i>0; i--) {        //Weiß -> blau
    Farbarray.push("rgb("+r+","+g+","+b+")");
    r--;
    g--;                
}
for(var i=0; i<255; i++) {  //blau -> r,b
    r++;
    Farbarray.push("rgb("+r+","+g+","+b+")");              
}
for(var i=0; i<255; i++) {  //r,b -> r,g
    g++;
    b--;
    Farbarray.push("rgb("+r+","+g+","+b+")");              
}
for(var i=0; i<255; i++) {  //r,g -> rot
    g--;
    Farbarray.push("rgb("+r+","+g+","+b+")");              
}

//        STOP BUTTON

document.getElementById('stopButton').addEventListener('click', function stopClick(){ //Löst aus wenn Button geclickt
  if (stopBool == false && (oldData || newData)) {    //nur wenn oldData o. newData true -> nur wenn Anzeige schon läuft
    document.getElementById('stopButton').innerHTML= "Weiter";  //Änderung Anzeigetext Button
    stopBool = true;
  }
  else if (stopBool && (oldData || newData)){
    document.getElementById('stopButton').innerHTML= "Stop";
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

document.getElementById('groesser').addEventListener('click', function enlarge() {  //Grid größer machen (+ Button)
  if(sizePos < widthArray.length-1) { //Wenn nicht schon größte Stufe erreicht
    sizePos++;  //nächste Stufe
    document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];  //größe aus Array laden
    document.getElementsByClassName("gridall")[0].style.height = heightArray[sizePos];
    var squArray = document.getElementsByClassName("square"); //auch für Squares, für jedes einzeln
    for (var i=0; i<squArray.length; i++) {
      squArray[i].style.width = squareSizeArray[sizePos];
      squArray[i].style.height = squareSizeArray[sizePos];
    }
  }
});

document.getElementById('kleiner').addEventListener('click', function smaller() {     //gleiches wie größer nur andersrum
  if(sizePos > 0) {
    sizePos--;
    document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];
    document.getElementsByClassName("gridall")[0].style.height = heightArray[sizePos];
  }
  var squArray = document.getElementsByClassName("square");
  for (var i=0; i<squArray.length; i++) {
    squArray[i].style.width = squareSizeArray[sizePos];
    squArray[i].style.height = squareSizeArray[sizePos];
  }
});

//LIVE AUSWERTUNG  VERALTET EIGENTLICH evtl nochmal nützlich bei anderen BLE Modulen?
function newRow(inString) {     //Funktion die je 1 Reihe Daten auwertet
  completeInput = completeInput.concat(inString);
  if(stopBool==true) {    //Wenn Stop aktiviert, dann return from function
    return;
  }
  if(inString.indexOf("MS:") != -1) { //Hier wenn "MS:" vorhanden ist, dann: (Wenn nicht zeigt Stelle an als -1)
    dataCountM = 0;  //MS Zeilen sind einleitend für Daten, also DataCounter auf 0
    valueArray = [];  //Auch valueArray auf 0
    infoArray.push(inString.slice(inString.indexOf("MS:"), inString.indexOf("H:") -1)); //ab MS, bis H: wird in ein Info Array geschrieben => "MS:XXXX M:XX"
    dataNumArray.push(inString.slice(0, inString.indexOf("MS:") -1)); //hier in Array d Counter vor MS:
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

  renderSquare(i) { //Wird aufgerufen aus render Methode: je 1 Quadrat
      return (
          <div className="square" style={{backgroundColor: Farbarray[Number(stateArray[i])]}}>
          </div>  //Quadrat bekommt Farbe zugehörig zu Value zugeordnet als HintergrundFarbe
        );
  }


  updateState() {   //Im Moment nicht mehr benutzt
    console.log("SETSTATE"); 
    this.setState({   //aktualisierung state => React rendert  

      squares: stateArray
    });
  }

  render() { 
    return (    //Hier wird Grid generiert, indem für jedes Quadrat renderSquare Methode aufgerufen wird
      <div className='wrapper'> 
      <div className='gridall'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}

          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
          {this.renderSquare(9)}
          {this.renderSquare(10)}
          {this.renderSquare(11)}

          {this.renderSquare(12)}
          {this.renderSquare(13)}
          {this.renderSquare(14)}
          {this.renderSquare(15)}
          {this.renderSquare(16)}
          {this.renderSquare(17)}   

          {this.renderSquare(18)}
          {this.renderSquare(19)}
          {this.renderSquare(20)}
          {this.renderSquare(21)}
          {this.renderSquare(22)}
          {this.renderSquare(23)}

          {this.renderSquare(24)}
          {this.renderSquare(25)}
          {this.renderSquare(26)}
          {this.renderSquare(27)}
          {this.renderSquare(28)}
          {this.renderSquare(29)}

          {this.renderSquare(30)}
          {this.renderSquare(31)}
          {this.renderSquare(32)}
          {this.renderSquare(33)}
          {this.renderSquare(34)}
          {this.renderSquare(35)}

          {this.renderSquare(36)}
          {this.renderSquare(37)}
          {this.renderSquare(38)}
          {this.renderSquare(39)}
          {this.renderSquare(40)}
          {this.renderSquare(41)}

          {this.renderSquare(42)}
          {this.renderSquare(43)}
          {this.renderSquare(44)}
          {this.renderSquare(45)}
          {this.renderSquare(46)}
          {this.renderSquare(47)}

          {this.renderSquare(48)}
          {this.renderSquare(49)}
          {this.renderSquare(50)}
          {this.renderSquare(51)}
          {this.renderSquare(52)}
          {this.renderSquare(53)}

          {this.renderSquare(54)}
          {this.renderSquare(55)}
          {this.renderSquare(56)}
          {this.renderSquare(57)}
          {this.renderSquare(58)}
          {this.renderSquare(59)}

          {this.renderSquare(60)}
          {this.renderSquare(61)}
          {this.renderSquare(62)}
          {this.renderSquare(63)}
          {this.renderSquare(64)}
          {this.renderSquare(65)}

          {this.renderSquare(66)}
          {this.renderSquare(67)}
          {this.renderSquare(68)}
          {this.renderSquare(69)}
          {this.renderSquare(70)}
          {this.renderSquare(71)}

          {this.renderSquare(72)}
          {this.renderSquare(73)}
          {this.renderSquare(74)}
          {this.renderSquare(75)}
          {this.renderSquare(76)}
          {this.renderSquare(77)}

          {this.renderSquare(78)}
          {this.renderSquare(79)}
          {this.renderSquare(80)}
          {this.renderSquare(81)}
          {this.renderSquare(82)}
          {this.renderSquare(83)}

          {this.renderSquare(84)}
          {this.renderSquare(85)}
          {this.renderSquare(86)}
          {this.renderSquare(87)}
          {this.renderSquare(88)}
          {this.renderSquare(89)}

          {this.renderSquare(90)}
          {this.renderSquare(91)}
          {this.renderSquare(92)}
          {this.renderSquare(93)}
          {this.renderSquare(94)}
          {this.renderSquare(95)}

          {this.renderSquare(96)}
          {this.renderSquare(97)}
          {this.renderSquare(98)}
          {this.renderSquare(99)}
          {this.renderSquare(100)}
          {this.renderSquare(101)}

          {this.renderSquare(102)}
          {this.renderSquare(103)}
          {this.renderSquare(104)}
          {this.renderSquare(105)}
          {this.renderSquare(106)}
          {this.renderSquare(107)}
          
        </div>
        <div id="chartOn">  
        <App />
        <AppZwei />
        <AppDrei />
        </div>    
        </div>
        
    );
  }//unten div für Graphen, App - AppDrei sind die 3 Graphen
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Grid />);    //1. rendern damit Grid Platz angezeigt wird auf Site







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
    point:{
        radius: 0     //sonst Punkte auf jedem Datenpunkt
    }
  },
  legend:  {
    display: false
    },
  animation: false,
  responsive: false,
  scales: {
    //borderColor: 'rgba(0,0,0)',
    yAxis: {
      max:500,  //500 für Live BLE Y-Achse
      min:0,    
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
        display:false,
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

var completeFile = [];
var slider = document.getElementById("slider");     //Geschwindigkeitsrange
var output = document.getElementById("slideOutput");  //Anzeige v %
var malTime = 1.0;  //default x1
output.innerHTML = slider.value + "%";  //GEschwindigkeitsmultiplier anzeige
slider.oninput = function() {
  malTime = this.value/100;       //Wenn slider verändert wird, wird faktor geändert
  output.innerHTML = this.value + "%"; //Anzeige von Wert
}

document.getElementById('csvFiles').addEventListener('change', function csvInput() { //Wenn File eingefügt läuft das hier
  //document.getElementById('title').innerHTML = "Lädt";
  oldData = true; //oldData bool für stop button
  completeFile = [];  
  let reader = new FileReader(); //FileReader von JS
  reader.readAsText(document.getElementById('csvFiles').files[0]);
  reader.onload = function (event) { //wird gelesen und wenn fertig, csvVerarbeitung aufgerufen mit gelesener Datei
    csvVerarbeitung(event.target.result);
  };
});

let dropArea = document.getElementById('csvFilez');                 //Damit man Dateien einfach reinziehen kann
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => { //wenn datei über element
  dropArea.addEventListener(eventName, preventDefaults, false)  //Default wäre, dass Datei im Browser geöffnet wird
})
dropArea.addEventListener("drop", runCSV, false); //bei drop runCSV aufrufen
function preventDefaults (e) {
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
function csvVerarbeitung(inputFile) { //input noch als String wird aufgeteilt in Blöcke getrennt durch MS: Zeilen
  let csvAlsArray = inputFile.slice(inputFile.indexOf("MS:")).split("MS:");
  //console.log(csvAlsArray);
  var tempArray = [];
  var tempZwei = [];
  var rn = false;
  
  if(csvAlsArray[1].indexOf("\r\n") != -1) {  //Manche CSV Files haben am Zeilenende \r\n und manche nur \n       ?
    rn = true;
  }
  else {      //damit falls rn dann split über rn und sonst split über n
    rn = false;
  }


  for(var i=0; i<csvAlsArray.length; i++) { //Für jeden Eintrag 1 Mal:
    if (rn) {

      tempArray = csvAlsArray[i].split("\r\n");  //MS Block in neues Arrays getrennt durch Zeilenumbrüche
    }
    else {

      tempArray = csvAlsArray[i].split("\n");
    }

    if (tempArray.length == 20) { //Wenn genau 20 Zeilen -> Kein Fehler:
      tempArray.pop();  //letzter Eintrag wird entfernt (ist Counter vor nächstem "MS:")
      tempZwei = [];
      tempArray[0] = tempArray[0].slice(0,tempArray[0].indexOf("M:")-1); //erster Eintrag im Array wird gekürzt von MS: XXXXX M: XXXXX H: XXXXX,,,, auf nur XXXXX Zahl von MS
      for (var j=0; j<tempArray.length; j++) {  //Für jeden Eintrag (Zeile):
        tempZwei = tempZwei.concat(tempArray[j].split(","));  //Werte in neues Array getrennt durch Kommas
      }
      if (tempZwei.length == 109) { //Falls 109 Einträge (1 MS Wert & 108 DruckWerte):
        //tempZwei[0] = tempZwei[0].slice(0,tempZwei[0].indexOf("M:")-1);
        wertVorher = wertNachher;
        wertNachher = 0;
        for (var w=1; w<109; w++) {
          wertNachher += Number(tempZwei[w]);
        }
        if (wertNachher < wertVorher * 1.5) {
          completeFile = completeFile.concat(tempZwei); //completeFile wird zu completeFile + Fehlerloser Datensatz
        }
        
      }                                              //"Fehlerlos" Hinsichtlich Einträgen, Fehlerhafte Werte sind noch möglich
    }
    //console.log(i + "/" + csvAlsArray.length);

  }
  //console.log("DONE");
  //console.log(completeFile);
  if (/*document.getElementById("graphi").checked*/graphIsOn) { //Wenn Graph Box häkchen
    //graphIsOn = true;
    document.getElementById("chartOn").style.display = "inline";  //Graphen visible
    graphIt(completeFile);                                        //Berechnung für Graphen durchführen
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

document.getElementById("steps").addEventListener("change", function() { //Checkbox Steps, wenn geändert wird
  if (step) {
    step = false;     //wenn vorher true, jetzt false

  }
  else {
    step = true;        //wenn vorher false jetzt true
    graphIsOn = true;   //auch graph true, steps nur dann möglich
    document.getElementById("graphi").checked = true; //auch anzeige muss true sein
  }
});

document.getElementById("graphi").addEventListener("change", function (){       //Wenn Graph checkbox geclickt
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
      point:{
          radius: 0
      }
    },
    legend:  {
      display: false
      },
    animation: false,
    responsive: false,
    scales: {
      //borderColor: 'rgba(0,0,0)',
      yAxis: {
        max:500,
        min:0,
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
          display:false,
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

function graphIt(allData) {   //Graph checkbox aktiviert -> bei Abspielen
  summenarray = [];       //reset wenn vorher schon benutzt wurden
  summenarrayZwei = [];
  summenarrayDrei = [];
  zeitarray = [];   
  //console.log(allData);
  for(var u=0; u<allData.length; u = u+109) {       //Berechnung Summen
    zwischensumme = 0;
    
    for (var v=1; v<37; v++) {
      zwischensumme += Number(allData[u+v]);          //die ersten 36 Werte zusammengerechnet
    }
    summenarray.push(Math.round(zwischensumme/36));   //Summe in komplettes Array pushen
    zwischensumme = 0;
    for (var v=37; v<73; v++) {
      zwischensumme += Number(allData[u+v]);        //die zweiten 36 Werte
    }
    summenarrayZwei.push(Math.round(zwischensumme/36)); //Summe in anderes Array pushen
    zwischensumme = 0;
    for (var v=73; v<109; v++) {
      zwischensumme += Number(allData[u+v]);        //gleiches für letzten 36 Werte
    }
    summenarrayDrei.push(Math.round(zwischensumme/36));       //Man hat grob ungefähr Ferse, Mittelfuß und Ballen
    /*if (summenarray.length != 0) {
      if (zwischensumme < 1.5 * summenarray[summenarray.length - 1]) {
        summenarray.push(zwischensumme);
        zeitarray.push(allData[u]);
      }
      
    }
    else {
      summenarray.push(zwischensumme);
      zeitarray.push(allData[u]);
    }*/
    if(summenarray[summenarray.length-1]>max) {     //Maximaler Wert von allen drei Arrays ermittelt
      max = summenarray[summenarray.length-1];
    }
    if(summenarrayZwei[summenarray.length-1]>max) {
      max = summenarrayZwei[summenarray.length-1];
    }
    if(summenarrayDrei[summenarray.length-1]>max) {
      max = summenarrayDrei[summenarray.length-1];
    }
    zeitarray.push(allData[u]);                   //zeitarray mit allen ZeitDaten

  }
  //console.log(max);

  //console.log(summenarray);
  //console.log(summenarrayZwei);
  //console.log(summenarrayDrei);
  options = {         //alle Options nochmal, damit max wert update bekommt
    borderColor: 'rgba(0,0,0)',
    elements: {
      point:{
          radius: 0
      }
    },
    legend:  {
      display: false
    },
    animation: false,
    responsive: false,
    scales: {
      
      yAxis: {
        max: max,   //Y-Achse Max Wert wird zu max. Wert aus den Summenarrays
        min:0,
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
          display:false,
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

  if (step) {               //wenn Schrittanalyse
    stepTimes = [];         //resets falls vorher schon benutzt
    indexArray = [];
    rollingIndex = [];
    stepStartTime = 0;
    stepEndTime = 0;
    Ferse = false;
    maxZeh = false;
    StepString = "";
    stelleImArray = 0;
    laengeOriginal = 0;
    saveWo = 0;

    var schnitt=0;          //Schnittwert berechnet für evtl. Schrittschwellen
    for(var runnnn = 0; runnnn<summenarray.length; runnnn++) { 
      schnitt+=summenarray[runnnn];
    }
    console.log(schnitt/summenarray.length);  //nur berechnung, bis jetzt noch keine Verwendung außer Anzeige in Konsole
  

    for(var runAll = 0; runAll < summenarray.length; runAll++) {        //einmal alle Frames durchgehen
      if(Ferse == false && summenarrayDrei[runAll] > 10 /*&& summenarrayDrei[runAll] < 35*/) {      //wenn Fersenwert über 10, neuer Schritt
        rollingIndex.push(runAll);    //abgespeichert, an welcher Stelle neuer Schritt begonnen- für Rüücksprung
        Ferse = true;
        stepStartTime = Number(zeitarray[runAll]);  //Wann Schritt begonnen
      }
      if (Ferse && maxZeh == false && summenarray[runAll] > 60) { //Wenn Ferse true und Wert über 60 bereit für Schrittende
        maxZeh = true;
      }
      if (maxZeh && summenarray[runAll] <40) {  //Wenn wieder unter 40 kommt Schrittende, Wert vielleicht noch zu verändern
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
      }
    }
  }
  stelleImArray = 0;
  laengeOriginal = summenarray.length;
  StepString = "";
  indexArray.push(-1);  //Sonst wird versucht auf nicht existierendes Element zuzugreifen
  stepKopie = Array.from(stepTimes);
  document.getElementById("Form").style.display = "inline";           //Anzeige visible machen
  document.getElementById("stepDownload").style.display = "inline";
  document.getElementById("Form").style.display = "inline";
  document.getElementById("StepZahl").innerHTML = indexArray.length-1 + "Schritte";
  //console.log(stepTimes);

}
var oneStep=true;     //Für Form, ob 1 step oder mehrere download

document.getElementById("oneStep").addEventListener("change", FormDisplay);
document.getElementById("multipleSteps").addEventListener("change", FormDisplay); //bei Veränderung funktionsaufruf

function FormDisplay() {
  if(document.getElementById("oneStep").checked) {      //wenn 1 schritt
    oneStep = true;
    document.getElementById("hideIfOne").style.display = "none";
    document.getElementById("LabelOne").innerHTML="Schrittnummer:"
  }
  else {
    oneStep = false;
    document.getElementById("hideIfOne").style.display = "inline";
    document.getElementById("LabelOne").innerHTML="Von Schritt:"
  }
}
var stepRequest = [];   
var vonIn = 0;
var bisIn = 0;
var dataC = 0;
var stringSteps = "";
var dataToSix = 0;
document.getElementById("formDone").addEventListener("click", function () {     //Für den Schritte download
  //console.log(oneStep);
  stepRequest = [];
  dataC = 0;
  stringSteps = "";
  dataToSix = 0;
  var stepNumber = Number(document.getElementById("firstStep").value);  //welcher Schritt soll download?
  if (stepNumber > stepTimes.length-2) {  //wenn höher als Schrittnummer (-2 weil letztes Element kkünstliches -1)
    stepNumber = stepTimes.length-2;      //dann einfach letzten Schritt wählen
  }

  if(oneStep==false) {  //bei mehreren Schritten
    
    var stepEndNo = Number(document.getElementById("lastStep").value);  //was im 2. Kästchen steht
    //console.log(stepEndNo + "und" + stepNumber);

    if(stepEndNo==stepNumber) {   //Wenn gleich, dann wie als wäre nur 1 Schritt
      if(stepNumber>0) {  //Wenn über 0
        vonIn = rollingIndex[stepNumber];
        bisIn = indexArray[stepNumber];
        for(var between=vonIn*109; between<bisIn*109; between++) {  //im kompletten Array * 109, da ja 109 * mehr Werte hat als Summenarray
          if(between%109==0) {  //alle 109 Werte keine Werte sondern MS: und so
            stringSteps += dataC + " MS:" + savedCom[between] + " M:  H: \n";   //dataC ist eigener Counter, dann MS Zeit
            dataC++;
            dataToSix = 0;  //Counter bis 6, weil im csv doc 6 pro Zeile sein sollen
          }
          else {  //wenn normaler Wert
            dataToSix++;
            if(dataToSix >= 6) {  //größer gleich nur falls glitch oder so
              stringSteps += savedCom[between] + "\n";  //Wert und dann Zeilenumbruch
              dataToSix=0;
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
        for(var between=vonIn*109; between<bisIn*109; between++) {  //gleich wie sonst, für 0. Schritt
          if(between%109==0) {
            stringSteps += dataC + " MS:" + savedCom[between] + " M:  H: \n";
            dataC++;
            dataToSix = 0;
          }
          else {
            dataToSix++;
            if(dataToSix >= 6) {
              stringSteps += savedCom[between] + "\n";
              dataToSix=0;
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
      if(stepEndNo < stepNumber) {    //wenn von größer als bis 
        //console.log("wieso");
        //console.log("stepEndNo:"+stepEndNo + " StepNumber:"+stepNumber);
        var temptemp = stepEndNo;     //für tausch tempVariable
        if(stepNumber>0) {            //muss größer als 0 sein, sonst = 0
          stepEndNo = stepNumber;
        }
        else {
          stepEndNo = 0;
        }
        stepNumber = temptemp;    //Tausch komplett
      }
      else {                          //wenn richtig eingegeben
        if (stepNumber>0) {     //dann nix
          //console.log("ok bis hier");

        }
        else {                  //sonst = 0
          stepNumber = 0;
        }
      }
      if (stepEndNo > stepTimes.length-2) {  //wenn höher als Schrittnummer (-2 weil letztes Element kkünstliches -1) wie vorher
        stepEndNo = stepTimes.length-2;      //dann einfach letzten Schritt wählen
        //console.log("broken");
      }

      vonIn = rollingIndex[stepNumber];     //vonIndex nummer bisIndex nummer
      bisIn = indexArray[stepEndNo];
      //console.log(vonIn + "bis" + bisIn);
      for(var between=vonIn*109; between<bisIn*109; between++) {      //für alle Werte in Intervall
        if(between%109==0) {      //eigentlich gleich wie vorher
          stringSteps += dataC + " MS:" + savedCom[between] + " M:  H: \n";
          dataC++;
          dataToSix = 0;
        }
        else {
          dataToSix++;
          if(dataToSix >= 6) {
            stringSteps += savedCom[between] + "\n";
            dataToSix=0;
          }
          else {
            stringSteps += savedCom[between] + ",";
          }
        }
      }

    }
  }
  if(oneStep) {             //gleich wie vorher nur direkt für 1
    if(stepNumber>0) {
      vonIn = rollingIndex[stepNumber];
      bisIn = indexArray[stepNumber];
      for(var between=vonIn*109; between<bisIn*109; between++) {
        if(between%109==0) {
          stringSteps += dataC + " MS:" + savedCom[between] + " M:  H: \n";
          dataC++;
          dataToSix = 0;
        }
        else {
          dataToSix++;
          if(dataToSix >= 6) {
            stringSteps += savedCom[between] + "\n";
            dataToSix=0;
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
      for(var between=vonIn*109; between<bisIn*109; between++) {
        if(between%109==0) {
          stringSteps += dataC + " MS:" + savedCom[between] + " M:  H: \n";
          dataC++;
          dataToSix = 0;
        }
        else {
          dataToSix++;
          if(dataToSix >= 6) {
            stringSteps += savedCom[between] + "\n";
            dataToSix=0;
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
  if(oneStep) {
    linkReq.setAttribute("download", "Step"+ stepNumber +".csv");      //wenn 1 step angefordert dann heißt datei StepX.csv
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
    timerouts = setTimeout(displayIt, timeout/malTime);
  }
  
}

function displayIt() {
  prevTime = Number(completeFile.splice(0,1)); //letzte Zeit = 1. Eintrag aus Array (MS: Zeit)
  //stateArrayTwo = completeFile.splice(0, 108);
  
  if (completeFile.length < 108) {          //Wenn weniger als 108 Zeilen verbleiben aufhören
    console.log(Date.now()); 
    loop();
    return;
  }
  stateArray = completeFile.splice(0, 108); //stateArray (zum rendern) = 1. 108 Einträge v completeFile (bei splice werden Einträge gleichzeitig gelöscht aus altem Array)
  
  timenow = Number(completeFile[0]);  //Zeit von nächstem Datensatz
  //Berechnung für nächstes Timeout
  if(timenow>=prevTime) {   //Wenn nicht neue Minute angebrochen wurde
    timeout = timenow - prevTime;  //timeout ist differenz v Zeiten -2 für Delay durch Programm
  }
  else {    //sonst -> wenn neue Min angebrochen
    timeout = timenow + (60000-prevTime);  //tiomeout ist nächste Zeit + was zur Min vorher gefehlt hat
  }
  if (graphIsOn) {      //Wenn auch Graphen
    data.splice(0, 1);      //Anfangs 100 0 Einträge, 0. Eintrag wird gelöscht
    data = data.concat(summenarray.splice(0,1));      //Hinten einer drangehangen-- concat statt push damit man noch ändern kann, wie viele immer auf einmal
    dataZwei.splice(0,1);   //gleiches für andere 2 Graphen
    dataZwei = dataZwei.concat(summenarrayZwei.splice(0,1));
    dataDrei.splice(0,1);
    dataDrei = dataDrei.concat(summenarrayDrei.splice(0,1));
    if (step) {
      stelleImArray = laengeOriginal - summenarray.length;      //stelleImArray updaten
      //console.log(stelleImArray);
      if (stelleImArray == indexArray[saveWo]) {                //wenn Schrittende erreicht wird
        if(StepString.length >= 240) {                          //wenn String schon max Länge hat
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
  if (counToTen >=10) { //Alle 10 Anzeigen wird die progressbar geupdated -> ca 3 mal pro Sekunde
    progressbar.value=Math.round((1-completeFile.length/laenge)*100); //Verhältnis von wie viel übrig ist/ wie viel am Anfang
    counToTen = 0;
  }
  if (FilterOn) {     //Wenn Filter bool an
    fakeGauss();      //dann Filterberechnungen
  }

  root.render(<Grid />);  //Anzeigen
  displayAfter();   //für nächsten Datensatz & timeout
}

document.getElementById("stepDownload").addEventListener("click", function() {      //nochmal download erstellen wie schon öfters
  var StepString = "data:text/csv;charset=utf-8," + stepKopie.join(",");
  var encodedUriStep = encodeURI(StepString);
  var linkStep = document.createElement("a");
  linkStep.setAttribute("href", encodedUriStep);
  linkStep.setAttribute("download", "StepData.csv");
  document.body.appendChild(linkStep);
  linkStep.click();
});



progressbar.onchange = function() {   //Wenn User Progressbar irgendwo hinsetzt
  clearTimeout(timerouts);            //Stoppen der Anzeige
  completeFile = Array.from(savedCom);  //Backups werden geladen
  summenarray = Array.from(einsKopie);
  summenarrayZwei = Array.from(zweiKopie);
  summenarrayDrei = Array.from(dreiKopie);
  //stepTimes = Array.from(stepKopie);
  summenarray.splice(0, Math.round(summenarray.length*(progressbar.value/100)));  //Backups gekürzt, bis da wo User will
  summenarrayZwei.splice(0, Math.round(summenarray.length*(progressbar.value/100)));
  summenarrayDrei.splice(0, Math.round(summenarray.length*(progressbar.value/100)));
  data = Array(100).fill(0);
  dataZwei = Array(100).fill(0);
  dataDrei = Array(100).fill(0);
  var spliceBy = Math.round(completeFile.length*(progressbar.value/100));
  while(spliceBy%109 != 0) {  //Hier muss durch 109 teilbar sein, da complete File immer DatenSätze von 109 sind
    spliceBy++;
  }
  if (step) {       //stelleImArray herausfinden
    stelleImArray = laengeOriginal - summenarray.length;
    for (var varx = 0; varx<indexArray.length; varx++) {  //nächsten Step finden und dahin saveWo setzen
      saveWo = varx;
      if(stelleImArray < indexArray[varx]) {    //sobald stelleimarray noch nicht war for schleife break
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

document.getElementById("aufnahme").addEventListener('click', function() {  //Wenn aufnahmebeginn gedrückt
  if (record) {
    record = false; //wenn vorher true jetzt false
    lalax(saveThis);
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
    document.getElementById("aufnahme").innerHTML="Aufnahme Ende" //Text im Button ändern
  }
})
//BLE DATA
// ASCII M=77 S=83 :=58 Space=32 H=72 $=36 < Meistens eingeschlossen von $
function newBLEData(event) {   //aufgerufen wenn neue BLE Daten
  changed = false;
  prevArray = useArray;
  useArray = Array.from(new Uint8Array(event.target.value.buffer)); //20 Bytes als je 8 Bit Ints -> 20 Einträge 0-255 
  if (record) {
    saveThis = saveThis.concat(useArray);
  }

  if (pushValues) {   //Falls H:X$ dann jetzt Daten, suche nach $X
    for (var p = 0; p<useArray.length; p++) {  //Über 20 Einträge je
      if (useArray[p] == 36) {  //falls $ Zeichen gefunden
        if (p<useArray.length-1) {             //falls nach $ noch was im array
          if (useArray[p+1] >= 48 && useArray[p+1] <= 57) {
            pushValues = false;   //ist nach $  ASCII 0-9?
            bisHier(useArray, p); //Wenn ja dann nur bis hier hin Values beachten
            changed = true;   //Datensatz ist nicht rein Werte
            break;
          }
        }
      }
    }
  }


  if (pushValues == false) {    //Suche nach H:X$
    for (var o = 0; o<useArray.length; o++) {
      if (useArray[o] == 36) {  //Wenn $ gefunden 
        if (o > 0) {  
          if (useArray[o-1] >= 48 && useArray[o-1] <= 57) { //War vorher ASCII 0-9?
            stateArray = [];  //dann start neuer Datensatz
            abHier(useArray, o);  //Ab $
            pushValues = true;  
            changed = true;
            break;
          }
        }
        else if (prevArray[prevArray.length-1] >= 48 && prevArray[prevArray.length-1] <= 57) {  //Gleiches nur wird vorheriges Element durch prev gecheckt
          stateArray = [];
          abHier(useArray, o);
          pushValues = true;
          changed = true;
          break;
        }
      }
    }
  }   
  if (changed == false) { //Falls Einträge rein Data waren
    for (var q = 0; q<useArray.length; q++) {
      byteArray.push(useArray[q]);  //byteArray wird aufgefüllt
  }
}
}

function abHier(datArray, von) {  //byteArray wird aufgefüllt ab $+1
  for (var l = von+1; l<datArray.length; l++) {
    byteArray.push(datArray[l]);
  }
}
function bisHier(datArray, bis) { //byte Array wird gefüllt bis $, danach Funktionsaufruf um 8Bit Werte zu 10Bit zu wandeln
  for (var l = 0; l<bis; l++) {
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
  if(workArray.length % 8 == 0) {  //Nur falls Werte Anzahl / 8 teilbar
    for (var r = 6; r<workArray.length; r += 8) {  //Einmal pro 8 Einträge, beginn 6. eintrag
      if (workArray[r] != 0) {  //Falls 6. eintrag nicht null
        byteToMod = 6;    //um welchen Eintrag es im Moment geht ByteToModify
        highBit = true;   //Geht um das MSB
        var binary = workArray[r].toString(2);  //7. Element in binary Form
        while (binary.length < 4) {
          //console.log("binary");
          binary = "0" + binary;        //Damit 4Bit ist, nicht weniger
        }
        for (var s=0; s<4 ; s++) {  
          if(binary.slice(s,s+1) == "1") { //Hier s. element ausgewertet
            if(highBit) {
              workArray[r-byteToMod] += 512;  //Wenn MSB 512
            }
            else {
              workArray[r-byteToMod] += 256;  //Sonst 256
            }
          }
          highBit ? highBit=false : highBit=true; //Wenn grade highbit dann jetzt nicht mehr und andersrum
          if(s==1){
            stateArray.push(workArray[r-byteToMod]);  //nach 2 operationen muss Wert gepusht werden und nächstes Byte jetzt Mod
            byteToMod--;
          }
        }
        stateArray.push(workArray[r-byteToMod]);  //am ende nochmal pushen
      }
      else {  //Falls 7. eintrag 0, dann bleiben Werte wie waren
        for (var s=6; s>4; s--) {
          stateArray.push(workArray[r-s]);
        }
      }
      
      if (workArray[r+1] != 0) {
        highBit=true;
        byteToMod = 4;
        var binary = workArray[r+1].toString(2);  //Wie oben
        while (binary.length < 8) {
          binary = "0" + binary;
        }
        for (var s=0; s<8 ; s++) {
          if(binary.slice(s,s+1) == "1") {
            if(highBit) {
              workArray[r-byteToMod] += 512;
            }
            else {
              workArray[r-byteToMod] += 256;
            }
          }
          highBit ? highBit=false : highBit=true;
          if(s%2==1){           //alles gleich wie oben, nur hier muss jedes 2. mal statt nur 1 mal
            stateArray.push(workArray[r-byteToMod]);
            byteToMod--;
          }
        }
        //stateArray.push(workArray[r-byteToMod]);
      }
      else {  //Falls 7. eintrag 0, dann bleiben Werte wie waren
        for (var s=4; s>0; s--) {
          stateArray.push(workArray[r-s]);
        }
      }
    }
  }
  if (graphIsOn) {    //Graph für Live BLE
    sumOf = 0;
    sumOfZwei = 0;
    for(/*var d=72; d<108; d++*/var d=0; d<36; d++) { //Ferse oder Vorderfuß?
      sumOf += stateArray[d];
    }
    data.splice(0,1);   
    if (isNaN(sumOf)) {     //wenn notANumber dann vorherigen Weret nochmal
      data.push(data[data.length -1]);
    }
    else {
      data.push(Math.round(sumOf/36));
    }
    for(var d=72; d<108; d++) { //Ferse oder Vorderfuß?
      sumOfZwei += stateArray[d];
    }
    dataDrei.splice(0,1);
    if (isNaN(sumOfZwei)) {
      dataDrei.push(data[data.length -1]);
    }
    else {
      dataDrei.push(Math.round(sumOfZwei/36));
    }

    


    datak = {
      labels,
      datasets: [
        {
          data: data,
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
      if(rolling == false && sumOfZwei/36 > 10 /*&& sumOfZwei/36 < 20*/) {
        timeStart = Date.now(); //Date() funktion gibt MS Wert seit irgend Datum 19XX an
        rolling = true;
        console.log("ROLLING");
      }
      if(rolling && maxVal == false && sumOf/36 > 70) {
        maxVal = true;
        console.log("MAX");
      }
    if (maxVal && sumOf/36 < 50) {
        rolling = false;
        maxVal = false;
        timeEnde = Date.now()-timeStart;
        if(StepString.length >= 240) {
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
    document.getElementById("CONNECT").innerHTML = "Connect";
    bluetoothDevice.gatt.disconnect();  //Disconnect BLE Device
    return;
  }

  stateArray = [];
    navigator.bluetooth.requestDevice({
        filters: [{
            //services: [0xffe1, 0xffe0]
            name: 'BT05'  //Nur devices mit Namem BT05 werden angezeigt, anderes theoretisch auch möglich
            //services: ['12b4735e-0385-3c45-06f8-cc58aa4b9185']
        }],
        optionalServices: [0xffe0, 0xffe1,'37066c16-1598-4995-75b5-6606645d8e88' ]  //char.uuid und service uuid
    })
    .then(device => {     //über Promises ab hier    mit device Verbinden
        console.log(device.name);
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
        return server.getPrimaryService(0xffe0);
    })
    .then(service => {  //Characteristic ausgewählt
        return service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');//0xffe1 geht auch
    })
    .then (characteristic => characteristic.startNotifications()) //wo values gesendet werden
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
      //document.getElementById("Form").style.display = "inline";
      document.getElementById("stepDownload").style.display = "inline";
      options = {
        borderColor: 'rgba(0,0,0)',
        backgroundColor: 'rgba(255,255,255)',
        elements: {
          point:{
              radius: 0
          }
        },
        legend:  {
          display: false
          },
        animation: false,
        responsive: false,
        scales: {
          //borderColor: 'rgba(0,0,0)',
          yAxis: {
            max:500,  //500 für Live BLE
            min:0,
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
              display:false,
              //borderColor: 'rgba(0,0,0)'
            }
          }
        },
      };
        characteristic.addEventListener('characteristicvaluechanged', newBLEData);  //immer wenn neue Daten wird funktion ausgeführt
        connectBool = true;
        document.getElementById("CONNECT").innerHTML = "Disconnect";
    })
    .catch(error => {console.error(error); })
});




/*document.getElementById("disc").addEventListener('click', function disconnectIt() {
    bluetoothDevice.gatt.disconnect();  //Disconnect BLE Device
});*/

function onDisconnected(event) {
  alert("Disconnected");  //Anzeige falls disconnected, gewollt oder accidental
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
    for (var y = 0; y<rawcsvZ.length; y++) {
      if (rawcsvZ[y] == 36 && (rawcsvZ[y+1] >= 48 && rawcsvZ[y+1] <= 57)) {  //Wie bei BLE Live Daten die Abspeicherung
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
      if (rawcsvZ[y] == 36 && (rawcsvZ[y-1] >= 48 && rawcsvZ[y-1] <= 57)) {
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
     for (var t=0; t<4; t++) {
       if(inBin.slice(t,t+1) == "1") {
        if(highBitAgain) {
          cleanedCSV[cleanedCSV.length-toModify] = Number(cleanedCSV[cleanedCSV.length-toModify]) + 512;
        }
        else {
          cleanedCSV[cleanedCSV.length - toModify] = Number(cleanedCSV[cleanedCSV.length-toModify]) + 256;
        }
       }
     }
     highBitAgain ? highBitAgain = false : highBitAgain = true;
     if (t==1) {
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
    for (var t=0; t<8; t++) {
      if(inBin.slice(t,t+1) == "1") {
       if(highBitAgain) {
         cleanedCSV[cleanedCSV.length-toModify] = Number(cleanedCSV[cleanedCSV.length-toModify]) + 512;
       }
       else {
         cleanedCSV[cleanedCSV.length - toModify] = Number(cleanedCSV[cleanedCSV.length-toModify]) + 256;
       }
      }
    }
    highBitAgain ? highBitAgain = false : highBitAgain = true;
    if (t%2==1) {
      toModify -= 2;
    }
  }
  

}
var first = true;
document.getElementById("help").addEventListener('click', function helper() {
  if(first) {
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

document.getElementById("Filter").addEventListener("change", function() {   //Filter bool ändern
  FilterOn?FilterOn=false:FilterOn=true;
});


var addedValues = 0;
var geteiltDurch = 0;
function fakeGauss() {              //Filter berechnungen
  addedValues = 0;
  var stateGauss = Array.from(stateArray);
  if (stateGauss.length < 108) {      //wenn zu wenige Werte
    return;
  }

  for(var posVar = 0; posVar<108; posVar++) {   //sonst

    addedValues = 2 * Number(stateGauss[posVar]);   //mittleres mal 2
    geteiltDurch = 2;           //wie viele Summanten?
    if(posVar >=6 && posVar<=101) {     //wenn nicht 1. o. letzte Reihe
      addedValues += Number(stateGauss[posVar+6]) + Number(stateGauss[posVar-6]); //Plus Wert ober und unterhalb
      geteiltDurch += 2;  //2 werte add
      if (posVar%6 == 0) {  //wenn links am Rand dann nur oben rechts, rechts und unten rechts
        addedValues += Number(stateGauss[posVar+1]) + Number(stateGauss[posVar-5]) + Number(stateGauss[posVar+7]);
        geteiltDurch += 3;  //3 werte add
      }
      else if ((posVar+1)%6 == 0) { //wenn rechts am Rand dann links, oben links und unten links
        addedValues += Number(stateGauss[posVar-1]) + Number(stateGauss[posVar-7]) + Number(stateGauss[posVar+5]);
        geteiltDurch += 3;  //3 werte add
      }
      else {  //wenn nicht am rand dann alle Werte drumherum (oben unten wurde schon vorher)
        addedValues += Number(stateGauss[posVar+1]) + Number(stateGauss[posVar-1]) + Number(stateGauss[posVar-5])+ Number(stateGauss[posVar-7])+ Number(stateGauss[posVar+5])+ Number(stateGauss[posVar+7]);
        geteiltDurch += 6;  //6 werte add
      }
    }
    else if (posVar <6) { //wenn erste Reihe
      addedValues += Number(stateGauss[posVar+6]); //drunter add
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
        addedValues += Number(stateGauss[posVar+1]) + Number(stateGauss[posVar-1]) + Number(stateGauss[posVar+5]) + Number(stateGauss[posVar+7]);
        geteiltDurch += 4;  //4 werte add
      }
    }
    else if (posVar > 101) {  //so ähnlich für letzte Reihe, halt nach oben
      addedValues += Number(stateGauss[posVar-6]);
      geteiltDurch += 1;
      if (posVar == 102) {
        addedValues += Number(stateGauss[103]) + Number(stateGauss[97]);
        geteiltDurch += 2;
      }
      else if (posVar == 107) {
        addedValues += Number(stateGauss[106]) + Number(stateGauss[100]);
        geteiltDurch += 2;
      }
      else {
        addedValues += Number(stateGauss[posVar+1]) + Number(stateGauss[posVar-1]) + Number(stateGauss[posVar-5]) + Number(stateGauss[posVar-7]);
        geteiltDurch += 4;
      }
    }

    stateArray[posVar] = Math.round(addedValues/geteiltDurch);    //Neuer Wert für Quadrat ist alles Zusammen/Summantenzahl gerundet auf ganze Zahl
  }
  //console.log(stateArray);
}


// AB HIER NUR FÜR TEST

var tmr = [];
var x=0;

function stopTmr() {  //Wenn StopButton
  if(stopBool) {
   for(var i=0;i<10;i++)  {   //bei stop werden Timer gelöscht
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
  for(var i=0;i<10;i++) {            //Initialisierung von Timern, 10 Timer mit 10MS, da JS nicht 1 Timer mit 1ms Handlen kann    
      tmr[i] =   setInterval(function() {
        newRow(reihenArrays[x]);  //ReihenArray an newRow() gesendet
        x++;  //index benutzt von allen 10 Timern
      }, 10);
 }
}












// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


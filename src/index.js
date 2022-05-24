import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ApexCharts from 'apexcharts';
import Chart from "react-apexcharts";
import reportWebVitals from './reportWebVitals';

var Farbarray = []; //Erstellung Farbarray, geht weiß->blau->pink->orange->rot
var stateArray = [];  //Wird ValueArray pro Datensatz
var infoArray = []; //Speicherung d. Zeitdaten
var valueArray = [];  //temp Array für Datensatz  
var dataNumArray = [];
var dataPosInStr = 0;   
var dataCountM = 0;
var completeInput = [];
var r = 255;
var g = 255;
var b = 255;
var startNewSet = false;
var stopBool = false;
var data = Array(100).fill(0);
var newData = false;
var oldData = false;
var widthArray = ["120px", "180px", "240px", "300px", "360px", "420px", "480px"];
var heightArray = ["360px", "540px", "720px", "900px", "1080px", "1260px", "1440px"];
var squareSizeArray = ["20px", "30px", "40px", "50px", "60px", "70px", "80px"]
var sizePos = 2;


//        HIER ERSTELLUNG DES FARBARRAYS - 1024 Stufen Weiß->Blau->Pink->Grün->Rot
for(var i=255; i>0; i--) {
    Farbarray.push("rgb("+r+","+g+","+b+")");
    r--;
    g--;                
}
for(var i=0; i<255; i++) {
    r++;
    Farbarray.push("rgb("+r+","+g+","+b+")");              
}
for(var i=0; i<255; i++) {
    g++;
    b--;
    Farbarray.push("rgb("+r+","+g+","+b+")");              
}
for(var i=0; i<255; i++) {
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

document.getElementById('groesser').addEventListener('click', function enlarge() {
  if(sizePos < widthArray.length-1) {
    sizePos++;
    document.getElementsByClassName("gridall")[0].style.width = widthArray[sizePos];
    document.getElementsByClassName("gridall")[0].style.height = heightArray[sizePos];
    var squArray = document.getElementsByClassName("square");
    for (var i=0; i<squArray.length; i++) {
      squArray[i].style.width = squareSizeArray[sizePos];
      squArray[i].style.height = squareSizeArray[sizePos];
    }
  }
});

document.getElementById('kleiner').addEventListener('click', function smaller() {
  eightToTen(testArray);
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

//LIVE AUSWERTUNG
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

/*function valueToColor(Farbwerte) { //Alte Umwandlung value->Color, jetzt in Grid Klasse
  for (var i=0; i<Farbwerte.length; i++) { 
    stateArray[i]=Farbarray[Number(Farbwerte[i])];  //Jedem Wert wird zugehörige Farbe zugeordnet
  } 
  //<Grid updateState />
  root.render(<Grid />);
}*/

 
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
        </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Grid />);    //1. rendern damit Grid Platz angezeigt wird auf Site


//CHARTS
class Graph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          id: "realtime",
          height: 350,
          type: 'line',
          animations: {
            enabled: false
          }
        },
        stroke: {
        },
        xaxis: {
          //categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
        },
        yaxis: {
          max: 50000
        },
      }, 
      series: [
        {
          //data: [30, 40, 45, 50, 49, 60, 70, 91]
          data: data
        }
      ]
    };
  }

  render() {
    return (
      <div className="app">
        <div className="row">
          <div className="mixed-chart">
            <Chart
              options={this.state.options}
              series={this.state.series}
              width="500"
            />
          </div>
        </div>
      </div>
    );
  }
}
//root.render(<Graph />); 
function updateData(values) {
  var datapoint = 0;
  for (var k=0; k<values.length; k++) {
    datapoint += Number(values[k]);
  }
  if (data.length >=100) {
    data.splice(0,1);
  }
  data.push(datapoint);
  ApexCharts.exec("realtime", 'updateSeries', [{
    data: data
  }], true);
  //console.log(data[0]);
}





//AUSWERTUNG VON FERTIGEN DATEIEN

var completeFile = [];
document.getElementById('csvFiles').addEventListener('change', function csvInput() { //Wenn File eingefügt läuft das hier
  oldData = true; //oldData bool für stop button
  completeFile = [];  
  let reader = new FileReader(); //FileReader von JS
  reader.readAsText(document.getElementById('csvFiles').files[0]);
  reader.onload = function (event) { //wird gelesen und wenn fertig, csvVerarbeitung aufgerufen mit gelesener Datei
    csvVerarbeitung(event.target.result);
  };
});

function csvVerarbeitung(inputFile) { //input noch als String wird aufgeteilt in Blöcke getrennt durch MS: Zeilen
  let csvAlsArray = inputFile.slice(inputFile.indexOf("MS:")).split("MS:");
  //console.log(csvAlsArray);
  var tempArray = [];
  var tempZwei = [];
  
  for(var i=0; i<csvAlsArray.length; i++) { //Für jeden Eintrag 1 Mal:
    tempArray = csvAlsArray[i].split("\r\n");  //MS Block in neues Arrays getrennt durch Zeilenumbrüche
    if (tempArray.length == 20) { //Wenn genau 20 Zeilen -> Kein Fehler:
      tempArray.pop();  //letzter Eintrag wird entfernt (ist Counter vor nächstem "MS:")
      tempZwei = [];
      tempArray[0] = tempArray[0].slice(0,tempArray[0].indexOf("M:")-1); //erster Eintrag im Array wird gekürzt von MS: XXXXX M: XXXXX H: XXXXX,,,, auf nur XXXXX Zahl von MS
      for (var j=0; j<tempArray.length; j++) {  //Für jeden Eintrag (Zeile):
        tempZwei = tempZwei.concat(tempArray[j].split(","));  //Werte in neues Array getrennt durch Kommas
      }
      if (tempZwei.length == 109) { //Falls 109 Einträge (1 MS Wert & 108 DruckWerte):
        //tempZwei[0] = tempZwei[0].slice(0,tempZwei[0].indexOf("M:")-1);
        completeFile = completeFile.concat(tempZwei); //completeFile wird zu completeFile + Fehlerloser Datensatz
      }                                              //"Fehlerlos" Hinsichtlich Einträgen, Fehlerhafte Werte sind noch möglich
    }
    //console.log(i + "/" + csvAlsArray.length);
  }
  //console.log("DONE");
  displayIt();  //Alles verarbeitet und in 1 riesen Array, jetzt Anzeigen lassen
  
}

var prevTime = 0; //Vars für Zeitberechnung
var timenow = 0;
var timeout = 1000;


function displayAfter() { //Aufgerufen in displayIt & wenn Stop aufgehoben
if (stopBool == false) {    //Wenn nicht Stop, nach berechneter Zeit nochmal displayIt()
  setTimeout(displayIt, timeout);
}

}

function displayIt() {
  prevTime = Number(completeFile.splice(0,1)); //letzte Zeit = 1. Eintrag aus Array (MS: Zeit)
  //stateArrayTwo = completeFile.splice(0, 108);
  stateArray = completeFile.splice(0, 108); //stateArray (zum rendern) = 1. 108 Einträge v completeFile (bei splice werden Einträge gleichzeitig gelöscht aus altem Array)
  if (completeFile.length < 108) {          //Wenn weniger als 108 Zeilen verbleiben aufhören 
    return;
  }
  timenow = Number(completeFile[0]);  //Zeit von nächstem Datensatz
  //Berechnung für nächstes Timeout
  if(timenow>prevTime) {   //Wenn nicht neue Minute angebrochen wurde
    timeout = timenow - prevTime -2;  //timeout ist differenz v Zeiten -2 für Delay durch Programm
  }
  else {    //sonst -> wenn neue Min angebrochen
    timeout = timenow + (60000-prevTime) -2;  //tiomeout ist nächste Zeit + was zur Min vorher gefehlt hat
  } 
  //root.render(<Secondgrid />);
  root.render(<Grid />);  //Anzeigen
  displayAfter();   //für nächsten Datensatz & timeout
}




var useArray = [];
var Dollar = false;
var pushValues = false;
var prevArray = [];
var byteArray = [];
var changed = false;
var highBit = true;
var byteToMod = 6;
//BLE DATA
// ASCII M=77 S=83 :=58 Space=32 H=72 $=36 < Meistens eingeschlossen von $
function newBLEData(event) {   //aufgerufen wenn neue BLE Daten
  changed = false;
  prevArray = useArray;
  useArray = Array.from(new Uint8Array(event.target.value.buffer)); //20 Bytes als je 8 Bit Ints -> 20 Einträge 0-255 

  if (pushValues) {   //Falls H:X$ dann jetzt Daten, suche nach $X
    for (var p = 0; p<20; p++) {  //Über 20 Einträge je
      if (useArray[p] == 36) {  //falls $ Zeichen gefunden
        if (p<19) {             //falls nach $ noch was im array
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
    for (var o = 0; o<20; o++) {
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
        else if (prevArray[20] >= 48 && prevArray[20] <= 57) {  //Gleiches nur wird vorheriges Element durch prev gecheckt
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
    for (var q = 0; q<20; q++) {
      byteArray.push(useArray[q]);  //byteArray wird aufgefüllt
  }
}
}

function abHier(datArray, von) {  //byteArray wird aufgefüllt ab $+1
  for (var l = von+1; l<20; l++) {
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
    root.render(<Grid />);

}

var testArray = [1, 2, 3, 4, 5, 6, 0, 255, 9, 10, 11, 12, 13, 14, 0, 255];



//BLE VERBINDUNG /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

var bluetoothDevice;
var gattconnect;
document.getElementById("CONNECT").addEventListener('click', function letsGo() {
    navigator.bluetooth.requestDevice({
        filters: [{
            //services: [0xffe1, 0xffe0]
            name: 'BT05'
            //services: ['12b4735e-0385-3c45-06f8-cc58aa4b9185']
            //name: 'SModul'
        }],
        optionalServices: [0xffe0, 0xffe1,'37066c16-1598-4995-75b5-6606645d8e88' ]
    })
    .then(device => {
        console.log(device.name);
        //console.log(characteristic.readValue());
        bluetoothDevice = device;
        return device.gatt.connect();
    })
    .then(server => {
        gattconnect = server;
        return server.getPrimaryService(0xffe0);
    })
    .then(service => {
        return service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');//0xffe1 geht auch
    })
    .then (characteristic => characteristic.startNotifications())
    .then(characteristic => {
        characteristic.addEventListener('characteristicvaluechanged', newBLEData);
    })
    .catch(error => {console.error(error); })
});
var intArray;
var fullArray = [];
function handleChange(event) {
    intArray = new Uint8Array (event.target.value.buffer);
    fullArray = fullArray.concat(Array.from(intArray));
}


document.getElementById("disc").addEventListener('click', function disconnectIt() {
    bluetoothDevice.gatt.disconnect();
});






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
document.getElementById('fileInput').addEventListener('change', function FileChanged() { //ähnlich wie oben
  newData = true;
  let reader = new FileReader();  
  reader.readAsText(document.getElementById('fileInput').files[0]);
  reader.onload = function (event) { //wenn gelesen hat wird getriggert
    csv = event.target.result; //csv ist Datei als String
    timerStart();
  };
});

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

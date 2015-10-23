
var PLAYER = {};
PLAYER.ticksPerBeat = 2000;
PLAYER.delay0 = 1;
PLAYER.isPlaying = false;
PLAYER.isAsync = false;
var useAsync = false;

function stopPlaying()
{
   report("Stop Playing");
   MIDI.stopAllNotes();
   PLAYER.isPlaying = false;
}

function playMelody(name)
{
    var melodyUrl = "midi/"+name+".json";
    stopPlaying();
    $.getJSON(melodyUrl, function(obj) { playObj(obj) });
}

function fmt(t) { return ""+Math.floor(t*1000)/1000; }

function playObj(obj)
{
    if (useAsync)
        playObjAsync(obj);
    else
        playObjSync(obj);
    if (scene) {
        addNoteGraphics(scene, obj);
    }
}

function playObjSync(obj)
{
   report("playObjSync");
   PLAYER.isAsync = false;
   PLAYER.i = 0;
   PLAYER.delay0 = 0;
   PLAYER.events = obj.seq;
   PLAYER.isPlaying = true;
   setTimeout(playNextStep, 0);
}

function playNextStep()
{
   report("playNextStep "+PLAYER.i);
   if (!PLAYER.isPlaying) {
      report("player stopped!");
      return;
   }
   var evGroup = PLAYER.events[PLAYER.i];
   var t0 = evGroup[0];
   handleEventGroup(evGroup);
   PLAYER.i += 1;
   if (PLAYER.i >= PLAYER.events.length) {
      report("FInished playing");
      PLAYER.isPlaying = false;
      return;
   }
   var t1 = PLAYER.events[PLAYER.i][0];
   var dt = (t1-t0)/PLAYER.ticksPerBeat;
   setTimeout(playNextStep, dt*1000);
}

function handleEventGroup(eventGroup)
{
    var t0 = eventGroup[0];
    var notes = eventGroup[1];
    for (var k=0; k<notes.length; k++) {
//      if (maxNumNotes && i > maxNumNotes)
//          break;
        var note = notes[k];
        var pitch = note[2];
	var v = note[3];
        var dur = note[4]/PLAYER.ticksPerBeat;
	var t = 0;
        if (PLAYER.isAsync)
            t = t0/PLAYER.ticksPerBeat;
	report(""+t0+" note pitch: "+pitch+" v:"+v+" dur: "+dur);
        MIDI.noteOn(0, pitch, v, t+PLAYER.delay0);
        MIDI.noteOff(0, pitch, v, t+dur+PLAYER.delay0);
    }
}

function playObjAsync(obj)
{
    report("Playing object Async");
    PLAYER.isAsync = true;
    var events = obj.seq;
    maxNumNotes = 0;
    PLAYER.delay0 = 1;
    for (var i=0; i<events.length; i++) {
	handleEventGroup(events[i]);
    }
}

function playScale(){
    report("scheduling notes");
    MIDI.programChange(0, instrument);
    var firstNote = 21;
    var lastNote = firstNote + 5*12+1;
    var t = 0;
    var delay = 0.6; // delta time - time between events
    var velocity = 127; // how hard the note hits
    var note = 21; // the note to use
    MIDI.setVolume(0, 127);
    for(var note=firstNote; note <= lastNote; ++note){
        MIDI.noteOn(0, note, velocity, t);
	MIDI.noteOff(0, note, t += delay);
    }
    report("finished scheduling notes");
}


function loadInstrument(instr, successFn)
{
    instrument = instr;
    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
	instrument: instrument,
        onprogress:function(state,progress){
           MIDI.loader.setValue(progress*100);
        },
        onprogress: function(state,progress)
		{
		     if (MIDI.loader)
                         MIDI.loader.setValue(progress*100);
		},
	onsuccess: function()
		{
		    MIDI.programChange(0, instr);
		    if (successFn)
			successFn();
		}
    });
}


function graphicsHandleEventGroup(gObj, eventGroup)
{
    var t0 = eventGroup[0];
    var notes = eventGroup[1];
    for (var k=0; k<notes.length; k++) {
//      if (maxNumNotes && i > maxNumNotes)
//          break;
        var note = notes[k];
        var pitch = note[2];
	var v = note[3];
        var gap = .2;
        var dur = note[4]/PLAYER.ticksPerBeat;
        var w = .1;
        var f = 1;
	var t = t0/PLAYER.ticksPerBeat;
	report("make bar for "+t0+" note pitch: "+pitch+" v:"+v+" dur: "+dur);
        var h = f*dur;
        var material = new THREE.MeshPhongMaterial( { color: 0x00dddd } );
	material.color.setHSL((pitch%12)/12.0, .6, .5);
        var geometry = new THREE.BoxGeometry( h, w, w );
        var bar = new THREE.Mesh( geometry, material );
        bar._mat = material;
        bar.position.x = f*t;
        bar.position.y = gap * pitch;
        bar.position.z = 0;
        gObj.add( bar );
    }
}

function addNoteGraphics(scene, midiTrackObj)
{
    if (PLAYER.graphics) {
        scene.remove(PLAYER.graphics);
    }

    report("Playing object Async");
    var events = midiTrackObj.seq;
    var gObj = new THREE.Object3D();
    for (var i=0; i<events.length; i++) {
	graphicsHandleEventGroup(gObj, events[i]);
    }
    scene.add(gObj);
    return gObj;
}

"""
some utilities for dealing with midi
This uses python package python-midi
"""
import math
import json
import midi
from midi.events import *


import base64

class TrackObj:
    def __init__(self, track=None):
        self.notes = []
        if track:
            self.observeTrack(track)

    def observeTrack(self, track):
        tn = 0
        openNotes = {}
        completeNotes = self.notes
        for evt in track:
            tick = evt.tick
            tn += tick
            if isinstance(evt, NoteEvent):
                pitch = evt.pitch
                v = evt.velocity
                #print tn, evt.name, evt.pitch, evt.velocity
                if isinstance(evt, NoteOnEvent):
                    if pitch in openNotes:
                        openNotes[pitch].append((tn, v))
                    else:
                        openNotes[pitch] = [pitch, (tn,v)]
                elif isinstance(evt, NoteOffEvent):
                    if v != 64:
                        print "NoteOff with v != 64"
                    if pitch in openNotes:
                        note = openNotes[pitch]
                        note.append((tn,0))
                        completeNotes.append(note)
                        del openNotes[pitch]
                    else:
                        print "NoteOff for unstarted note"
                else:
                    print "Unexpected note type", evt.name
            elif isinstance(evt, TrackNameEvent):
                print "TrackName", evt.text
            elif isinstance(evt, EndOfTrackEvent):
                print "End of track"
                for pitch in openNotes:
                    note = openNotes[pitch]
                    note.append((tn,0))
                    completeNotes.append(note)
            elif isinstance(evt, ControlChangeEvent):
                pass
            else:
                print evt.name

    def saveAsJSON(self, path):
        obj = {'type': 'Track',
               'notes': self.notes}
        json.dump(obj, file(path, "w"))

    def dump(self):
        print "%d complete notes" % len(self.notes)
        i = 0
        for note in self.notes:
            print note
            if i >= 10:
                break


class ShepVoice:
    def __init__(self, noctaves=4, i0=0, dur=1):
        self.noctaves = noctaves
        self.nsteps = 12*noctaves
        self.low = 21
        self.high = self.low + self.nsteps
        self.i0 = i0
        self.dur = dur
        self.ticksPerBeat = 1000

    def getNote(self, i):
        step = (i - self.i0) % self.nsteps
        p = self.low + step
        f = (p-self.low)/float(self.nsteps - 1)
        a = int(120 * math.sin(f*math.pi))
        if a == 0:
            return None
        tOn = i*self.ticksPerBeat
        tOff = (i+self.dur)*self.ticksPerBeat
        return [p, [tOn,a], [tOff,0]]

        
def genShepard(nvoices, noctaves):
    tobj = TrackObj()
    for v in range(nvoices):
        sv = ShepVoice(noctaves, 12*v)
        for i in range(200):
            note = sv.getNote(i)
            print i, note
            if note:
                tobj.notes.append(note)
    tobj.saveAsJSON("shepard.json")


def convertToJSON(path, jpath=None):
    if not jpath:
        jpath = path.replace(".mid", ".json")
    pattern = midi.read_midifile(path)
    i = 0;
    print type(pattern)
    ntracks = len(pattern)
    print "ntracks:", ntracks
    for track in pattern:
        i += 1
        print "track %d" % i
        tobj = TrackObj(track)
        #tobj.dump()
        tobj.saveAsJSON(jpath)
        continue
        for evt in track:
            print ".....", evt
        print "-------"


"""
Convert one of the base64 coded data urls found
in euphomy tracks directory to proper .mid file.
"""
def convert(b64path, mpath):
    str = file(b64path).read()
    i = str.find(",")
    data = str[i+1:]
    mid = base64.b64decode(data)
    file(mpath,"wb").write(mid)

def dump(path):
    if path.endswith(".mb64"):
        mpath = path.replace(".mb64", ".mid")
        convert(path, mpath)
        path = mpath
    if 1:
        convertToJSON(path)
    else:
        pattern = midi.read_midifile(path)
        print pattern


def run():
    genShepard(5, 5)
    return
    path = "minute_waltz.mid"
    path = "chopin69.mb64"
    path = "wtc0.mb64"
    path = "beethovenSym5m1.mb64"
    dump(path)

if __name__ == '__main__':
    run()




"""
some utilities for dealing with midi
This uses python package python-midi
"""
import math
import json
import midi
from midi.events import *


import base64

class Note:
    def __init__(self, pitch, t0, velocity, dur=None):
        self.pitch = pitch
        self.parts = [[t0,velocity]]
        if dur:
            self.finish(t0+dur)

    def getT0(self):
        return self.parts[0][0]

    def extend(self, t, velocity):
        self.parts.append([t,velocity])

    def finish(self, t):
        self.parts.append([t,0])

    def toDict(self):
        t0 = self.parts[0][0]
        v = self.parts[0][1]
        dur = self.parts[-1][0] - t0
        d = {"type": "note",
             "t0": t0,
             "pitch": self.pitch,
             "dur": dur,
             "v": v}
        if len(self.parts) != 2:
            print "Note withless than less than 2 parts"
            d['parts'] = self.parts
        return d

    def toList(self):
        t0 = self.parts[0][0]
        v = self.parts[0][1]
        dur = self.parts[-1][0] - t0
        lst = ["note", t0, self.pitch, v, dur]
        if len(self.parts) != 2:
            print "Note withless than less than 2 parts"
            lst.append(self.parts)
        return lst

            
class TrackObj:
    def __init__(self, track=None):
        self.events = {}
        if track:
            self.observeTrack(track)

    def addNote(self, note):
        t0 = note.getT0()
        if t0 in self.events:
            self.events[t0].append(note)
        else:
            self.events[t0] = [note]
        
    def observeTrack(self, track):
        tn = 0
        openNotes = {}
        for evt in track:
            tick = evt.tick
            tn += tick
            if isinstance(evt, NoteEvent):
                pitch = evt.pitch
                v = evt.velocity
                #print tn, evt.name, evt.pitch, evt.velocity
                if isinstance(evt, NoteOnEvent):
                    if pitch in openNotes:
                        openNotes[pitch].extend(tn,v)
                    else:
                        openNotes[pitch] = Note(pitch, tn, v)
                    if v == 0:
                        note = openNotes[pitch]
                        self.addNote(note)
                        del openNotes[pitch]
                elif isinstance(evt, NoteOffEvent):
                    if v != 64:
                        print "NoteOff with v != 64"
                    if pitch in openNotes:
                        note = openNotes[pitch]
                        note.finish(tn)
                        self.addNote(note)
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
                    note.finish(tn)
                    self.addNote(note)
            elif isinstance(evt, ControlChangeEvent):
                pass
            else:
                print evt.name

    def saveAsJSON(self, path):
        print "Saving TrackObj to", path
        seq = []
        keys = self.events.keys()
        keys.sort()
        for t in keys:
            eventsAtT = []
            evts = self.events[t]
            for evt in evts:
#                eventsAtT.append(evt.toList())
                eventsAtT.append(evt.toList())
            seq.append([t, eventsAtT])
        obj = {'type': 'Sequence',
               'seq': seq}
        json.dump(obj, file(path, "w"),indent=4, sort_keys=True)

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
            return 0, None
        tOn = i*self.ticksPerBeat
        tOff = (i+self.dur)*self.ticksPerBeat
        return tOn, Note(p, tOn, a, self.dur*self.ticksPerBeat)

        
def genShepard(nvoices, noctaves):
    tobj = TrackObj()
    for v in range(nvoices):
        sv = ShepVoice(noctaves, 12*v)
        for i in range(200):
            tOn, note = sv.getNote(i)
            if note:
                #print i, note.toList()
                tobj.addNote(note)
            else:
                print i, None
    tobj.saveAsJSON("shepard.json")
#    sobj = SeqObj(tobj)
#    sobj.saveAsJSON("shepard.seq.json")


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
    dump("beethovenSym5m1.mb64")
    genShepard(5, 5)
    dump("minute_waltz.mid")
    dump("chopin69.mb64")
    dump("wtc0.mb64")

if __name__ == '__main__':
    run()




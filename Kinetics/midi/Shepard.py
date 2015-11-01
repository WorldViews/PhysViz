"""
"""
from PVMidi import Note, TrackObj, MidiObj

import math
import json
import midi
from midi.events import *


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

        
def genShepard(path, nvoices=5, noctaves=5, nnotes=200, motif=None):
    print "="*60
    print "Generating Shepard Tones"
    tobj = TrackObj(trackName="Track1")
    for v in range(nvoices):
        sv = ShepVoice(noctaves, 12*v)
        for i in range(nnotes):
            j = i
            if motif:
                j = motif[i % len(motif)]
            print j
            tOn, note = sv.getNote(j)
            if note:
                #print i, note.toList()
                tobj.addNote(note)
    midiObj = MidiObj()
    midiObj.addTrack(tobj)
    midiObj.saveAsJSON(path)


def run():
    genShepard("shepard_5_5.json")
    genShepard("shepard2.json", motif=[1,2,4,1,3,4,5,3,5,6,7,4,7,8,9,7,10,11])

if __name__ == '__main__':
    run()




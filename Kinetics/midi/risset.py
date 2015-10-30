
from PVMidi import TrackObj

t = TrackObj("BluesRhythm1.json")
t.saveAsJSON("foo.json")
print "t.maxTime", t.getMaxTime()
print "=========================================="
print "1_2"
rt1 = t.rescaleByTime(t.rescaleTime(0.25, 0.5))
rt1.scalePower(0, 0.3)
rt1.saveAsJSON("risset0.25_0.5.json")
print "=========================================="

rt2 = t.rescaleByTime(t.rescaleTime(0.5, 1))
rt2.scalePower(0.3, 1)
rt2.saveAsJSON("risset0.5_1.json")

rt3 = t.rescaleByTime(t.rescaleTime(1, 2))
rt3.scalePower(1, 0.3)
rt3.saveAsJSON("risset1_2.json")

rt4 = t.rescaleByTime(t.rescaleTime(2, 4))
rt4.scalePower(0.3, 0)
rt4.saveAsJSON("risset2_4.json")

rt = TrackObj()
rt.append(rt1)
rt.append(rt2)
rt.append(rt3)
rt.append(rt4)
rt.saveAsJSON("rissetvoice.json")

rt = TrackObj()
rt.append(rt4)
rt.append(rt4)
rt.saveAsJSON("risset2_4x2.json")

rt = TrackObj()
rt.merge(rt1)
rt.merge(rt2)
rt.merge(rt3)
rt.merge(rt4)
rt.saveAsJSON("crazy_risset.json")
"""
tmap = t.rescaleTime(1, 2)
tvals = tmap.keys()
tvals.sort()
for t in tvals:
    print t, tmap[t]
"""



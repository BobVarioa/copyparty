# coding: utf-8
from __future__ import print_function, unicode_literals

import os
import platform
import sys
import time

# fmt: off
_:tuple[int,int]=(0,0)  # _____________________________________________________________________  hey there! if you are reading this, your python is too old to run copyparty without some help. Please use https://github.com/9001/copyparty/releases/latest/download/copyparty-sfx.py or the pypi package instead, or see https://github.com/9001/copyparty/blob/hovudstraum/docs/devnotes.md#building if you want to build it yourself :-)  ************************************************************************************************************************************************
# fmt: on

try:
    from typing import TYPE_CHECKING
except:
    TYPE_CHECKING = False

if True:
    from typing import Any, Callable, Optional

PY2 = sys.version_info < (3,)
PY36 = sys.version_info > (3, 6)
if not PY2:
    unicode: Callable[[Any], str] = str
else:
    sys.dont_write_bytecode = True
    unicode = unicode  # type: ignore

WINDOWS: Any = (
    [int(x) for x in platform.version().split(".")]
    if platform.system() == "Windows"
    else False
)

VT100 = "--ansi" in sys.argv or (
    os.environ.get("NO_COLOR", "").lower() in ("", "0", "false")
    and sys.stdout.isatty()
    and "--no-ansi" not in sys.argv
    and (not WINDOWS or WINDOWS >= [10, 0, 14393])
)
# introduced in anniversary update

ANYWIN = WINDOWS or sys.platform in ["msys", "cygwin"]

MACOS = platform.system() == "Darwin"

EXE = bool(getattr(sys, "frozen", False))

try:
    CORES = len(os.sched_getaffinity(0))
except:
    CORES = (os.cpu_count() if hasattr(os, "cpu_count") else 0) or 2

# all embedded resources to be retrievable over http
zs = """
web/mount/partyfuse.py
web/mount/u2c.py
web/mount/webdav-cfg.bat
web/page/browser.html
web/page/browser2.html
web/page/idp.html
web/page/md.html
web/page/mde.html
web/page/rups.html
web/page/shares.html
web/page/splash.html
web/page/svcs.html
web/page/msg.html
web/page/cf.html
web/page/opds.xml
web/dist/browser.css
web/dist/md.css
web/dist/md2.css
web/dist/mde.css
web/dist/msg.css
web/dist/rups.css
web/dist/shares.css
web/dist/splash.css
web/dist/ui.css
web/dist/logue.css
web/dist/browser.js
web/dist/logue.js
web/dist/md.js
web/dist/md2.js
web/dist/mde.js
web/dist/rups.js
web/dist/shares.js
web/dist/splash.js
web/dist/svcs.js
web/dist/up2k.js
web/dist/util.js
web/dist/w.hash.js
web/deps/busy.mp3
web/deps/scp.woff2
web/deps/mini-fa.css
web/deps/mini-fa.woff
web/deps/prism.css
web/deps/prism.js
web/deps/prismd.css
web/deps/fuse.py
web/res/copyparty.gif
web/res/iiam.gif
"""
RES = set(zs.strip().split("\n"))

class EnvParams(object):
    def __init__(self) -> None:
        self.t0 = time.time()
        self.mod = ""
        self.mod_ = ""
        self.cfg = ""
        self.scfg = True


E = EnvParams()

FROM    alpine:3.18
WORKDIR /z
ENV     ver_fontawesome=7.1.0 \
        ver_prism=1.29.0 \
        ver_zopfli=1.0.3

# versioncheck:
# https://github.com/google/zopfli/tags


# download;
# the scp url is regular latin from https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap
RUN     mkdir -p /z/dist/no-pk \
        && wget https://fonts.gstatic.com/s/sourcecodepro/v11/HI_SiYsKILxRpg3hIP6sJ7fM7PqlPevW.woff2 -O scp.woff2 \
        && apk add \
                bash brotli cmake make g++ git gzip lame npm patch pigz \
                python3 python3-dev py3-brotli sox tar unzip wget \
        && rm -f /usr/lib/python3*/EXTERNALLY-MANAGED \
        && wget https://github.com/FortAwesome/Font-Awesome/releases/download/$ver_fontawesome/fontawesome-free-$ver_fontawesome-web.zip -O fontawesome.zip \
        && wget https://github.com/google/zopfli/archive/zopfli-$ver_zopfli.tar.gz -O zopfli.tgz \
        && wget https://github.com/PrismJS/prism/archive/refs/tags/v$ver_prism.tar.gz -O prism.tgz \
        && wget https://files.pythonhosted.org/packages/04/0b/4506cb2e831cea4b0214d3625430e921faaa05a7fb520458c75a2dbd2152/fusepy-3.0.1.tar.gz -O fusepy.tgz \
        && tar --no-same-owner -xf prism.tgz \
        && tar --no-same-owner -xf fusepy.tgz \
        && unzip fontawesome.zip \
        && tar --no-same-owner -xf zopfli.tgz

COPY    busy-mp3.sh /z/
RUN     /z/busy-mp3.sh \
        && mv -v /dev/shm/busy.mp3.gz /z/dist


# build fonttools (which needs zopfli)
RUN     tar --no-same-owner -xf zopfli.tgz \
        && cd zopfli* \
        && cmake \
            -DCMAKE_INSTALL_PREFIX=/usr \
            -DZOPFLI_BUILD_SHARED=ON \
            -B build \
            -S . \
        && make -C build \
        && make -C build install \
        && python3 -m ensurepip \
        && python3 -m pip install fonttools zopfli

# build fontawesome and scp
COPY    mini-fa.sh /z
COPY    mini-fa.css /z
COPY    shiftbase.py /z
RUN     /bin/ash /z/mini-fa.sh


# build prismjs
COPY    genprism.py /z
COPY    genprism.sh /z
RUN     ./genprism.sh $ver_prism


# compress
COPY    zopfli.makefile /z/dist/
RUN     cd /z/dist \
        && make -j$(nproc) -f zopfli.makefile \
        && rm *.makefile \
        && mv no-pk/* . \
        && rmdir no-pk


# build fusepy
COPY    uncomment.py /z
RUN     mv /z/fusepy-3.0.1/fuse.py /z/dist/f1 \
        && cd /z/dist \
        && python3 /z/uncomment.py f1 \
        && sed -ri '/self.__critical_exception = e/d' f1 \
        && awk '/^log =/{s=0} !s; /^from traceback im/{s=1;print"from functools import partial";print"basestring = str"}' <f1 >f2 \
        && awk '/LoggingMixIn:/{exit} --s<0;/self.use_ns = getattr/{s=7}' <f2 >f1 \
        && awk "/if _machine =/{s=0} /'(mips|ppc|ppc64)'/{s=1} !s" <f1 >f2 \
        && rm f1 && mv f2 fuse.py


# git diff -U2 --no-index marked-1.1.0-orig/ marked-1.1.0-edit/ -U2 | sed -r '/^index /d;s`^(diff --git a/)[^/]+/(.* b/)[^/]+/`\1\2`; s`^(---|\+\+\+) ([ab]/)[^/]+/`\1 \2`' > ../dev/copyparty/scripts/deps-docker/marked-ln.patch
# d=/home/ed/dev/copyparty/scripts/deps-docker/; tar -cf ../x . && ssh root@$bip "cd $d && tar -xv >&2 && make >&2 && tar -cC ../../copyparty/web deps" <../x | (cd ../../copyparty/web/; cat > the.tgz; tar -xvf the.tgz; rm the.tgz)
# gzip -dkf ../dev/copyparty/copyparty/web/deps/deps/marked.full.js.gz && diff -NarU2 ../dev/copyparty/copyparty/web/deps/{,deps/}marked.full.js

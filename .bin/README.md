# scripts

these scripts were written for the node:lts-alpine container. 

- [build.sh](build.sh) === "build-for-production"

- [start.sh](start.sh) === "start-something"

_see the [Dockerfile](../Dockerfile) for more clarity_

#

## but how fast can it read my knexfile ?

these scripts read a given knexfile and return the sqlite db path

- [whatDB.js](whatDB.js) (slower) Node

- [whatDB.sh](whatDB.sh) (faster) *nix

```
❯ time .bin/whatDB.js api/knexfile.js

mnt/something.db
.bin/whatDB.js api/knexfile.js  0.03s user 0.01s system 100% cpu 0.040 total

❯ time .bin/whatDB.sh api/knexfile.js

mnt/something.db
.bin/whatDB.sh api/knexfile.js  0.00s user 0.01s system 155% cpu 0.007 total

```

try it yourself. 

nix is faster than Node

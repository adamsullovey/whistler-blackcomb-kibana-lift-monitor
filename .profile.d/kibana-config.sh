#!/bin/bash
sed -i 's|http://" + window.location.hostname + ":9200|'$BONSAI_URL'|g' public/config.js
LOGIN=`echo -n $BONSAI_URL | cut -d "/" -f 3 | cut -d "@" -f 1 | base64`
echo "auth hash: $LOGIN"
sed -i "s|loginhashhere|$LOGIN|g" public/config.js

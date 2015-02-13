#!/bin/bash
sed -i 's|http://" + window.location.hostname + ":9200|'$BONSAI_URL'|g' public/config.js

LOGIN=`echo -n "$BONSAI_URL" | cut -d "/" -f 3 | cut -d "@" -f 1`
LOGIN_ENCODED=`echo -n $LOGIN | openssl enc -base64`


echo "auth: $LOGIN"
echo "auth encoded: $LOGIN_ENCODED"


sed -i "s|loginhashhere|$LOGIN_ENCODED|g" public/config.js

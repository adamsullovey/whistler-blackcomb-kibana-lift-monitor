#!/bin/bash
sed -i 's|http://" + window.location.hostname + ":9200|'$BONSAI_URL'|g' public/config.js
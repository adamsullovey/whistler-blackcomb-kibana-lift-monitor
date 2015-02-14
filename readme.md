Whistler Blackomb Lift Monitor
================

I decided to try loading data from https://secure.whistlerblackcomb.com/ls/lifts.aspx into [ElasticSearch](http://www.elasticsearch.org/), and view it in [Kibana 3](http://www.elasticsearch.org/overview/kibana/) for fun.

nodejs handles loading the data, and Express serves the static Kibana pages.

![WB Lift Monitor Screenshot](screenshot.png?raw=true)

Stuff I learned making this
----------------

### Kibana isn't great for this purpose

Overlapping lines on graphs hide data. Users can't tell exactly which lifts are closed since the last one in the list of queries covers up the other lines.

[Kibana rounds numbers to whole numbers](https://github.com/elasticsearch/kibana/issues/697), so the speed graph/histogram loses precision. Combine that with the overlapping lines mentioned above, and the graph becomes less useful. I had to multiply speeds by before loading them into ElasticSearch (speeds are in dm/s instead of m/s), otherwise all the lifts appear only have about 4 different speeds in the graph.

Still, looking at the colourful squiggly lines is fun during opening and closing time on weekends.

### Line breaks are weird

The hardest part of this was making .profile.d/kibana-config.sh work. I kept running into issues with line breaks ending up in the login:password string that gets base 64 encoded and used in the Authorize HTTP header, which lead to lots of 401 Forbidden errors when Kibana tried to access ElasticSearch.

### Some bash commands

```bash
curl -X DELETE 'https://name:password@server-name.bonsai.io/index-name'

curl -X POST 'https://name:password@server-name.bonsai.io/index-name'
```

These work great together to remove and recreate an index. Very handy when you to clear data out of 1 ElasticSearch index.

```bash
BONSAI_URL=https://name:password@server-name.bonsai.io npm start
```
When working on my dev machine, I used this to start node with the same BONSAI_URL environment variable set that Heroku has.



### Heroku is fun

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/adamsullovey/whistler-blackcomb-kibana-lift-monitor)

If this runs on a free dyno, the process that scrapes data and serves Kibana will shut down if it doesn't receive any HTTP requests, and no data will be scraped.

Other stuff to add?
-------

### Better colours for queries

[This gradient scale](http://gka.github.io/palettes/#colors=forestgreen,white,skyblue|steps=26|bez=0|coL=0) might be fun. Valley lifts in green, mid-mountain in white, alpine in blue.

Maybe Whistler and Blackcomb lifts could have slightly different tints?
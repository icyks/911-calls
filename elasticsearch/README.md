# 911 Calls avec ElasticSearch

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (ici aussi, cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```
GET <nom de votre index>/_count
```

## Requêtes

À vous de jouer ! Écrivez les requêtes ElasticSearch permettant de résoudre les problèmes posés.

```

curl -XGET "http://localhost:9200/911calls/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "bool": {
      "must": {
        "match_all": {}
      },
      "filter": {
        "geo_distance": {
          "distance": "0.5km",
          "location": {
            "lat": 40.241493,
            "lon": -75.283783
          }
        }
      }
    }
  }
}'

curl -XGET "http://localhost:9200/911calls/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "cat": {
      "terms": {
        "field": "cat.keyword"
      }
    }
  }
}'

curl -XGET "http://localhost:9200/911calls/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "date": {
      "terms": {
        "field": "date.keyword",
        "size": 3
      }
    }
  }
}'


curl -XGET "http://localhost:9200/911calls/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "query": {
    "match": {
      "title": "OVERDOSE"
    }
  },
  "aggs": {
    "twp": {
      "terms": {
        "field": "twp.keyword",
        "size": 3
      }
    }
  }
}'
```

## Kibana

Dans Kibana, créez un dashboard qui permet de visualiser :

* Une carte de l'ensemble des appels
* Un histogramme des appels répartis par catégories
* Un Pie chart réparti par bimestre, par catégories et par canton (township)

Pour nous permettre d'évaluer votre travail, ajoutez une capture d'écran du dashboard dans ce répertoire [images](images).

### Timelion
Timelion est un outil de visualisation des timeseries accessible via Kibana à l'aide du bouton : ![](images/timelion.png)

Réalisez le diagramme suivant :
![](images/timelion-chart.png)

Envoyer la réponse sous la forme de la requête Timelion ci-dessous:  

```
.es( index=911*, q=cat:fire, timefield=time).cusum().label(label="Last 6 months of 'Fire' calls").color(#FF5607),
.es( index=911*, q=cat:fire, timefield=time, offset=-6M).cusum().label(label="Previous 6 months of 'Fire' calls").color(#FFB840),
.static(6500, "Objective").color(#00A4A5).lines(fill=1)
```

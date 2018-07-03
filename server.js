var bodyParser = require('body-parser')
var express = require('express');
var http = require("http");
var https = require("https");
var app = express();
var url = require('url');
const yelp = require('yelp-fusion');
const client = yelp.client('F2oZ5JSzWVjlbxHsiRIGicjmwK-DYBLN5xG85_dkxfslRzidMc1Dj89k-B6irJZYUaYgGG11qP9cNt-hUmax_1phkrUDIZzR7aCn1F8Ki7q65nBSgvZc5RNyaOzFWnYx');
app.use(express.static('public'));
app.use(express.json());
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
var str='';
app.get('', function (req, res) {

callback = function(response) {
  response.on('data', function (chunk) {
    str += chunk;
  });
  response.on('end', function () {
    
    res.send(str);
    str="";
  });
  
}

http.request('http://ip-api.com/json', callback).end();

})
app.get('/getyelp/', function (req, res) {
    console.log("this is yelp madness");
    var queryData = url.parse(req.url, true).query;
    console.log(queryData);
    client.businessMatch('best', queryData).then(response => {
         if(response.jsonBody.businesses.length!=0){
          console.log("for response \n");
          console.log(response);
//          var phoneG = queryData.phone.replace(/\D+/g, "");
          var goog = queryData.phone;
          var yelp = response.jsonBody.businesses[0].display_phone;
          var phone_flag = false;
          var name_flag = false;
          var yelp_name = response.jsonBody.businesses[0].name;
          console.log("yelp: "+yelp_name+" google:"+queryData.name);
          if(goog===yelp && queryData.name===yelp_name){
              phone_flag = true;
              name_flag = true;
          }
          if(phone_flag && name_flag){
                get_yelp_reviews(response,res);
          }
          else{
              res.send(JSON.stringify({status:"ZERO_RESULTS"}));
          }
        }
        else {
            res.send(JSON.stringify({status:"ZERO_RESULTS"}));
        }
        }).catch(e => {
        console.log(queryData);
        console.log(e);
    });
    
})
function get_yelp_reviews(response,res){
    client.reviews(response.jsonBody.businesses[0].id).then(response =>{
        res.send(response.body);
    }).catch(e => {
        console.log("for erroe2 \n");
        console.log(e);
    });
}
app.get('/getplaces/', function (req, res) {
    var loc_formatted='';
    var lat;
    var lng;
    
    
    var obj = url.parse(req.url, true).query;
    console.log("i made it ")
    var key ='AIzaSyAmxZBAH55Eg9E9VmEYOtx6_VeJfciyzLw';

//    console.log('body: ' + JSON.stringify(req.body));
    

   if(obj.pagetoken){
       var places_info='';
       Get_nextplaces = function(response) {
          response.on('data', function (chunk) {
            places_info += chunk;
          });
          response.on('end', function () {
            var placesjson=JSON.parse(places_info);
            res.send(places_info);        


            

          });

        }
       https.request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+obj.pagetoken+"&key="+key, Get_nextplaces).end();
   } 
 else{
    var location=obj.location;
    
    Get_location = function(response) {
      response.on('data', function (chunk) {
        loc_formatted += chunk;
      });
      response.on('end', function () {
        var locjson=JSON.parse(loc_formatted);

        lat= locjson.results[0].geometry.location.lat;
        lng= locjson.results[0].geometry.location.lng;
        
        
        places(lat,lng);
          
      });

    }
    https.request("https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key="+key, Get_location).end();

    places=function(latitude,longitude){
        var places_info='';
        Get_places = function(response) {
          response.on('data', function (chunk) {
            places_info += chunk;
          });
          response.on('end', function () {
            var placesjson=JSON.parse(places_info);
            res.send(places_info);        


            

          });

        }
        console.log("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+latitude+","+longitude+"&radius="+obj.radius*1600+"&type="+obj.type+"&keyword="+obj.keyword+"&key="+key);
        https.request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+latitude+","+longitude+"&radius="+obj.radius*1600+"&type="+obj.type+"&keyword="+obj.keyword+"&key="+key, Get_places).end();
        
    }
 }


})
app.get('/trying.html', function (req, res) {
   res.sendFile( __dirname + "/" + "trying.html" );
});

var port = process.env.PORT || 8081;

var server = app.listen(port, function () {
   var host = server.address().address
   var port_id = server.address().port
   var headers = {};
    
    // set header to handle the CORS
    
    
   console.log("Example app listening at http://%s:%s", host, port_id);
})
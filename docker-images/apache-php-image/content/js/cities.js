$(function(){
 console.log("Loading cities");

 function loadCities(){
        $.getJSON( "/api/students/", function( cities ) {
                console.log(cities);
                var message = "Nobody is here";
                if(cities.length > 0){
                        message = cities[0].name;
                }
                $(".container").text(message);
        });
 };                                                                                                                     
 loadCities();
 setInterval( loadCities, 2000);

});
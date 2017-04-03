// If this module gets required, export the following:
module.exports = {

    // If this function is called, render the 'home' view and pass title = "Home" as object
    relationship: function(request, response){
        return response.status(200).render('relationship', {
            title: "Relationship"
        });
    },
    home: function(request, response){
        return response.status(200).render('home', {
            title: "Home"
        });
    }
}



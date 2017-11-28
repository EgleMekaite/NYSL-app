/*eslint-env browser*/
/*eslint "no-console": "off"*/
/*global $ firebase*/
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global Mustache: true*/
var myorientation;
var gamesData;

$(function () {

    $.getJSON("https://api.myjson.com/bins/mjhej", function (data) {
        gamesData = data.months;
        
        $(".loader").hide();

        createHtml(gamesData);

        defaultView();

        document.getElementById("gSignIn").addEventListener("click", logIn);

        document.getElementById("logout").addEventListener("click", signOut);


        document.getElementById("quickstart-sign-up").addEventListener("click", handleSignUp);

        document.getElementById("quickstart-sign-in").addEventListener("click", toggleSignIn);


        $(".backButton").on("click", function () {
            defaultView();
//            $(".linkToGameChat").show();
            $(".location").show();
            //        $(".hamburger").hide();
            window.removeEventListener("orientationchange", checkOrientationOnClicked);
        });

        $(".backToGamesButton").on("click", function () {
            defaultView();
            $("#mainPage").show();
            $(".menu > button").hide();
            $(".cross").hide();
            $(".hamburger").show();
            $(".location").show();
            window.removeEventListener("orientationchange", checkOrientationOnClicked);
        });

        $("#logo, header > h1").on("click", function () {
            location.reload();
        });

        $("#filterByTeam").on("change", updateFilteredTeams);

        gameOnclick();

        $(".cross").hide();
        $(".menu > button").hide();
        $("#selectors").hide();
        $("#logout").hide();
        $(".hamburger").click(function () {
            $(".menu").show();

            $(".menu > button").slideToggle("fast", function () {
                $(".hamburger").hide();
                $(".cross").show();

            });
        });

        $(".cross").click(function () {
            $(".cross").hide();
            $(".hamburger").show();
            $("#selectors").hide();
            $("#logout").hide();
            $(".filtByTeam").hide();
            $(".menu > button").hide();

        });

        $(".filtByTeam").click(function () {
            $(".filtByTeam").hide();
            $("#logout").hide();
            $(".menu > button").hide();
            $("#selectors").show();
        });

        $(".logInButton").on("click", function () {
            $("#logInPage").show();
            $("#mainPage").hide();
            $(".backToGamesButton").show();

        });

        $("#signedInUser").on("click", function () {
            $("#logout").toggle();
            //        $(".filtByTeam").toggle();
            //        $(".cross").show();
        });

    });

});

function getOrientation() {
    myorientation = window.innerWidth > window.innerHeight ? "Landscape" : "Portrait";
    return myorientation;
}


function gameOnclick() {
    //We need to get the buttons for a unique class
    $(".gbut").click(function () {
        //Get the first class, in this case 'game1' etc... and store it.
        var att = $(this).attr("class").split(" ")[0];

        getOrientation();

        if (myorientation == "Landscape") {
            $(".games_info > div").hide();
            //Use this class to get the element with this id
            $("#" + att).show();

        } else if (myorientation == "Portrait") {
            $(".games_info > div").hide();
            $("#" + att).show();
            $(".container").hide();
            $(".backButton").show();

        }
        window.addEventListener("orientationchange", checkOrientationOnClicked);

    });
}

function checkOrientationOnClicked() {
    setTimeout(function () {
        getOrientation();

        if (myorientation == "Portrait") {
            $(".container").hide();
            $(".backButton").show();
        } else if (myorientation == "Landscape") {
            $(".container").show();
            $(".backButton").hide();

        }
    }, 100);

}

function defaultView() {

    $(".header").show();
    $(".container").show();
    $(".backButton").hide();
    $(".games_info > div").hide();
    $("#logInPage").hide();
    $(".backToGamesButton").hide();
    $("#chatPage > div").hide();
    $(".buttons button").css("opacity", "0.8");
}


function updateFilteredTeams() {

    var teamFilter = $("#filterByTeam").val();

    $(".buttons button").each(function () {

        var theTeam = $(this).find(".teams").html();

        if (teamFilter == "" || theTeam.includes(teamFilter) == true) {
            $(this).slideDown("fast", function () {
                $(this).show();
                $(".games_info > div").hide();
                //                $("#landscapeMessage").show();
            });
        } else {
            $(this).hide();
            $(".games_info > div").hide();
            //            $("#landscapeMessage").show();
        }
    });

}

function logIn() {

    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function () {
        signedIn();

    });
}

function signedIn() {

    $("#mainPage").show();
    $(".logInButton").hide();
    $("#logInPage").hide();
    $(".menu > button").hide();
    $(".cross").hide();
    $(".hamburger").hide();
    $(".backToGamesButton").hide();
    $("#userIcon").html("account_circle");
    $("#signedInUser").show();
    $("#signedInAs").show().html(firebase.auth().currentUser.displayName);
    $(".linkToGameChat").show();
    showChats();
}

function showChats() {

    $(".linkToGameChat").on("click", function () {
        var gameId = $(this).attr("id").split("-")[0];
        
        $("#" + gameId + "-chat").show();
        $(".backToGamesButton").show();
        $("#" + gameId + "-chatLink").hide();
        $(".location").hide();
        console.log(document.getElementById("create-post-" + gameId));
        document.getElementById("create-post-" + gameId).addEventListener("click", function(){
            writeNewPost(gameId);
        });

        getPosts(gameId);
    });

}

function signOut() {
    firebase.auth().signOut().then(function () {
        location.reload();
        $("#signedInUser").hide();
        $("#logout").hide();
        $("#linkToGameChat").hide();
        alert("You have successfully signed out.");
    });
}


function writeNewPost(elementId) {
    
    var text = $("#body-" + elementId)[0].value;
    console.log(text);
    console.log(elementId);
    console.log($("#body-" + elementId));
    var userName = firebase.auth().currentUser.displayName;
    
    //A post entry:
    var postData = {
        name: userName,
        body: text
    };
    console.log(postData);
    //get a key for the new post:
//    var newChat = "match-game1";
//    console.log(newChat);
//    console.log("anything?");
    var newPostKey = firebase.database().ref().child("match-" + elementId).push().key;

    var updates = {};
    updates[newPostKey] = postData;

    return firebase.database().ref().child("match-" + elementId).update(updates);

}

function getPosts(elementId) {
     
    firebase.database().ref("match-" + elementId).on("value", function (data) {
        
        var logs = $("#posts-" + elementId);
        
        logs.empty();

        var posts = data.val();
        
        
        for (var key in posts) {
            var text = document.createElement("div");
            var element = posts[key];
            

            text.append(element.name + ": " + element.body);
            logs.prepend(text);
        }
        $("#body-" + elementId).val('');

    });
}

function handleSignUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
            getPosts();
            firebase.auth().onAuthStateChanged(function (user) {

                if (user) {

                    // Updates the user attributes:

                    var nameOfUser = $("#userName").val();

                    user.updateProfile({ // <-- Update Method here
                        displayName: nameOfUser
                    }).then(function () {

                        // Profile updated successfully!
                        //  "NEW USER NAME"

                        var displayName = user.displayName;
                        console.log(displayName);

                    }, function (error) {
                        // An error happened.
                        console.log(error);
                    });
                }
            });
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            //         [START_EXCLUDE]
            if (errorCode == 'auth/weak-password') {
                alert('The password is too weak.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
            // [END_EXCLUDE]
        }).then(function () {
            document.getElementById('email').value = "";
            document.getElementById('password').value = "";
            $("#emailSignIn").append("<p>You have successfully created your account. Now you can sign in.</p>");
        });

    // [END createwithemail]
}

function toggleSignIn() {
    //    if (firebase.auth().currentUser) {
    //        // [START signout]
    //        firebase.auth().signOut();
    //        // [END signout]
    //    } else {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).then(function () {

        signedIn();
    })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // [START_EXCLUDE]
                if (errorCode === 'auth/wrong-password') {
                    alert('Wrong password.');
                } else {
                    alert(errorMessage);
                }
                console.log(error);
                document.getElementById('quickstart-sign-in').disabled = false;
                // [END_EXCLUDE]
            });
//     [END authwithemail]
        
//    document.getElementById('quickstart-sign-in').disabled = true;
}

function fillTemplate(templateID, elementId, objArray) {
    var template = $(templateID).html();
    var output = '';

    for (var i = 0; i < objArray.length; i++) {
        // console.log(objArray[i].September);
        // console.log(objArray[i].October);
        for (var key in objArray[i]) {
            //console.log(objArray[i][key]);
            $(objArray[i][key]).each(function (index, value) {
                output += Mustache.render(template, value);

            })

        }

    }
    $(elementId).html(output);
}

function createHtml(gamesData) {

    fillTemplate("#buttons-template", "#buttons", gamesData);

    fillTemplate("#games-info-template", "#games_info", gamesData);

    fillTemplate("#chat-template", "#chatPage", gamesData);

}

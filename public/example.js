/*eslint-env browser*/
/*eslint "no-console": "off"*/
/*global $ firebase*/

document.getElementById("login").addEventListener("click", logIn);

document.getElementById("logout").addEventListener("click", logOut);
document.getElementById("create-post").addEventListener("click", writeNewPost);


getPosts();

function logIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(){
        $("#postsDiv").show();
    $("#login").html("Signed in as " + firebase.auth().currentUser.displayName);
    $("#emailSignIn").hide();
    $("#logout").show();
    });
    
}

//function loggedIn() {
//    $("#postsDiv").show();
//    $("#login").hide();
//    $("#emailSignIn").hide();
//    $("#signedInAs").show().html("Signed in as " + firebase.auth().currentUser.displayName);
//    $("#logout").show();
//}

function logOut() {
    firebase.auth().signOut().then(function () {
        $("#login").html("Sign in with Google");
        $("#emailSignIn").show();
        $("#postsDiv").hide();
        $("#logout").hide();
        
        alert("You have successfully signed out.");
    });
}


function writeNewPost() {
    var text = document.getElementById("body").value;
    var userName = firebase.auth().currentUser.displayName;

    //A post entry:
    var postData = {
        name: userName,
        body: text
    };
    //get a key for the new post:
    var newPostKey = firebase.database().ref().child("myMatch").push().key;

    var updates = {};
    updates[newPostKey] = postData;

    return firebase.database().ref().child("myMatch").update(updates);

}

function getPosts() {
    firebase.database().ref("myMatch").on("value", function (data) {
        var logs = document.getElementById("posts");
        logs.innerHTML = "";

        var posts = data.val();
        console.log(data.val());

        for (var key in posts) {
            var text = document.createElement("div");
            var element = posts[key];

            text.append(element.body);
            logs.prepend(text);
        }
        $("#body").val('');

    });
}

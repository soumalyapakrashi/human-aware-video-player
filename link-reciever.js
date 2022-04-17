const form = document.querySelector("form");
const input_field = document.querySelector("#video-link");

form.addEventListener("submit", event => {
    // Prevent the form from submitting
    event.preventDefault();

    // Get the link of the video from the input field
    let youtube_link = input_field.value;

    // Extract the video ID
    // Youtube video links are of the format
    // https://youtube.com/watch?v={video_id}
    // So we split based on the '=' and take the 2nd part which is {video_id}
    let video_id = youtube_link.split("=")[1];
    // Set the video_id to session storage
    sessionStorage.setItem("video_id", video_id);

    // Generate the URL of the next page
    let next_page_url = "";

    // If the current URL has the index.html in the last then remove it
    if(window.location.href.endsWith("index.html") || window.location.href.endsWith("index")) {
        next_page_url = window.location.href.split("index")[0];
    }

    // If the current URL does not have index.html in the last and has a '/', then all is set
    else if(window.location.href.endsWith("/")) {
        next_page_url = window.location.href;
    }

    // If the current URL does not even have a '/' in the last, then add it
    else {
        next_page_url = window.location.href + "/";
    }

    // Finally add the player.html in the end
    next_page_url += "player.html";

    // Navigate to the video player page
    window.location.href = next_page_url;
});
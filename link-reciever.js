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

    // Navigate to the video player page
    window.location.href = "/player.html";
});
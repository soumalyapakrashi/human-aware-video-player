// This determines whether the model should control play and pause features
let enable_model_control = true;
// This denotes if the model has paused the video or not
// Either the model can pause the video, or user can pause the video
// If the user pauses the video, then the model will not play the video by itself.
// User needs to manually play the video.
let model_paused_video = false;
// Counts how many frames computed by the model does not have a human in it.
let no_human_frame_counter = 0;

// Creates an <iframe> after the Youtube API is available.
// This also takes the video which is supposed to be played
let video_player;

/* 
    This function is called when the Youtube API has finished loading.
    The video player replaces the "player" div in the HTML with a iframe.
    The videoId is obtained from the session storage stored in the previous page.
    Two events are being looked for, one when the player is ready to play and the other
    when the state of the player changes.

    TODO: We have to deduct 5 from the height. This is because the innerHeight function
    for some reason returns a height which is more than the actual viewport height. Therefore,
    horizontal and vertical scrollbars appear. But deducting 5 from the height leaves a small
    strip of black space below the video which needs to be removed.
*/
function onYouTubeIframeAPIReady() {
    video_player = new YT.Player('player', {
        height: window.innerHeight - 5,
        width: window.innerWidth,
        videoId: sessionStorage.getItem("video_id"),
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Start playing the video when the player is ready and enable the webcam
function onPlayerReady(event) {
    event.target.playVideo();
    enableWebcam();
}

function onPlayerStateChange(event) {
    // If the video has finished, or stopped, then prevent the model from re-playing the video
    if(event.data == 0) {
        enable_model_control = false;
    }

    // If user paused the video, the user will only play the video. The model should not start
    // playing the video.
    if(event.data == 2 && model_paused_video == false) {
        enable_model_control = false;
    }

    // If the video is playing, whether played by user or model,
    // then reset all the flag variables
    if(event.data == 1) {
        enable_model_control = true;
        model_paused_video = false;
        no_human_frame_counter = 0;
    }
}


// Create a placeholder video element where the webcam stream would be projected
// and add it to the HTML
const webcam = document.createElement("video");
webcam.width = 640;
webcam.height = 480;
webcam.muted = true;
webcam.autoplay = true;
webcam.setAttribute("class", "webcam-feed");

document.querySelector("body").appendChild(webcam);

// Check whether webcam access is supported by the system and browser
// The double !! converts the result to a boolean value and prevents stuffs like undefined from being returned.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function enableWebcam() {
    // If webcam is supported, then assign the feed to the video element
    if (getUserMediaSupported()) {
        // getUsermedia parameters to force video but not audio.
        const constraints = {
            video: true
        };

        // Assign the webcam feed to the video element created above.
        // Once the assignation is successful, start downloading the model.
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            webcam.srcObject = stream;
            webcam.addEventListener("loadeddata", loadModel);
        })
    }
    else {
        console.warn('getUserMedia() is not supported by your browser');
    }
}


// Load the model. Once loaded, start monitoring it.
let model = undefined;

function loadModel() {
    cocoSsd.load().then(loaded_model => {
        model = loaded_model;
        monitorWebcam();
    })
}

// Monitor the webcam for the presence of humans
function monitorWebcam() {
    model.detect(webcam).then(predictions => {
        if(enable_model_control == true) {
            let prediction_classes = [];

            // First get all the objects detected by the model in the frame.
            // We only add the object if the model is more than 66% confident about its presence.
            for(let i = 0; i < predictions.length; i++) {
                if(predictions[i].score > 0.66)
                    prediction_classes.push(predictions[i].class);
            }

            // If a "person" object is not present in the current frame
            if(!prediction_classes.includes("person")) {
                // If the video is currently playing, then pause the video.
                // The no_human_frame_counter is used to add some time interval before
                // the video is paused. This prevents video pauses from model's detection
                // misses for some frames. It waits for 4 computed frames (2 seconds) before pausing.
                // It only pauses if for the entire duration of 2 seconds, no human is detected.
                if(YT.PlayerState.PLAYING && no_human_frame_counter > 4) {
                    video_player.pauseVideo();
                    model_paused_video = true;
                }
                else if(YT.PlayerState.PLAYING) {
                    no_human_frame_counter++;
                }
            }
            // If a person is present
            else {
                // If a person has just returned into the frame, start playing the video
                if(YT.PlayerState.PAUSED && model_paused_video == true) {
                    video_player.playVideo();
                }
            }
        }

        // Wait fro 500 milliseconds before processing the next available frame.
        // This is to increase the performance as we do not need to compute each and every
        // webcam frame. We can only compute 1 frame per half a second and save compute resources.
        setTimeout(() => window.requestAnimationFrame(monitorWebcam), 500);
    });
}
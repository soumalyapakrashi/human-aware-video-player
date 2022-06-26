# Human Aware Video Player

### Brief Overview

This website accepts a YouTube video link from user and plays that video. In the process of playing the video, it continuously detects whether a human is present in the front of the computer (webcam) or not. If a human is not present, it automatically pauses the video and when a human again comes into view, it automatically starts playing the video.

Please enter a link of a standalone video from Youtube. Please do not give links of entire playlists or individual videos from playlists. The program may behave unexpectedly if such incorrect links are provided. Also, sometimes some videos just does not work. Maybe for some licensing issue or some other issue that YouTube does not allow to play those videos in any website other than YouTube itself.

Webcam access in required for this program to run. The webcam stream is not sent to any server and all processing is done entirely on the client device.


### Detailed Description

The program takes a link of a standalone video from Youtube. Please ensure proper data input as sanity checks have not been implemented and the program may behave unexpectedly if proper link is not given. All Youtube videos follow a specific URL structure. This program extracts the video ID from the URL and redirects to the video player page.

Here, first we initialize the [YouTube API](https://developers.google.com/youtube/iframe_api_reference) with the video ID which we had extracted in the previous page. Then we set up a video player. Upon successfully setting up the player, we try to setup the webcam.

If webcam is supported, the browser asks the user if he/she is willing to give webcam access. On successful approval, the webcam starts. The webcam feed is projected onto a video element in the HTML but the opacity of this element is set to 0 so that it is not visible. Obviously we do not want to show the webcam feed to the user as all the video processing tasks would be running in the background, but for some reason, the ML model we use here, does not work if the video element hosting the webcam stream is not actually present in the HTML document.

On successful webcam initialization, we start downloading the model. We use the [COCO-SSD model](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) here. COCO-SSD is an Object Detection model. So along with detecting what objects are present in the scene, it also detects where in the scene the objects are located. Such a model is not needed here as in this case, we can get our work done by using a much more light weight image classification model. Such a model would only return what object is present in the scene and not give any other information like where that object is present. So it would require much less computing resources. A possible classification model is [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) but I could not make it work. This is why I used the COCO-SSD model.

Every 500 milliseconds, the model takes in a frame from the webcam video feed and detects the presence of humans in it. If a human is present, then it is all good. If a human is not present, then it waits for 4 iterations. As there is a gap of 500 milliseconds, therefore the model waits for approximately 2 seconds. If for that entire duration, no human is detected, then the model pauses the video. When a human again comes back into view, the model plays the video. But if the user manually pauses the video, then the model does not do anything whether the person is inside view of the webcam or not. In this case, the user has to manually start playing the video and then only the model will again start controlling the playback of the video.

Finally, as the video ID is stored in Session Storage of the browser, all the temporary data is automatically deleted when the tab and browser is closed.

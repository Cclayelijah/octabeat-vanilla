# octabeat-vanilla

HOW TO RUN LOCALLY

1. install git
2. open command line, navigate to directory you want to clone the repo in, and run
   `git clone <url>`.
3. run a local server
   -install visual studio code and the 'live server' extension.
   -open repository in vscode
   -click "Go Live" in bottom right
4. change trackName in settings.js to a song you want to play in the res/tracks/ directory.
5. start game by uploading a .osu file in the same directory as res/tracks/{trackName}/.

HOW TO UPDATE YOUR LOCAL CODE

1. open terminal in same directory as the repo (ctrl + ~)
2. run `git pull`

HOW TO CONTRIBUTE

1. run `git checkout -b <name-of-branch>` to create a new branch and switch to it.
2. make your code changes.
3. run `git add .` and `git commit -m <message>` to commit your changes
4. run `git push --set-upstream origin <name-of-branch>` to push your changes.
5. message me on discord: PolarEyes#1217 (I will merge your branch if I like your code)

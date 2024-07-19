# server 
go inside server folder cd server/
then build the docker image "docker-compose up --build -d"

if any issues with net/http: TLS handshake timeout
run unset http_proxy
unset https_proxy
this will fix the above
for windows run netsh winhttp reset proxy

if any issue with This version of npm is compatible with lockfileVersion@1, but package-lock.json was generated for lockfileVersion@3
rename the package.json file and run again compose up build command and revert the file name back again

npm install
npm run dev
to start the project run node app.js inside the project root folder
if any issues releated with port not available delete all images in docker and try re-building them using "docker-compose up --build -d"

id faced this error "Error response from daemon: error while creating mount source path '/host_mnt/Users/haresh/Documents/projects/ims/server': mkdir /host_mnt/Users/haresh: permission denied"

if facing listen EADDRINUSE: address already in use :::8080 change the port value in .env and try again
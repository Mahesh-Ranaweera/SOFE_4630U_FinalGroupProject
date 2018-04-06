# SOFE_4630U_FinalGroupProject

![Project Header](https://github.com/Mahesh-Ranaweera/SOFE_4630U_FinalGroupProject/blob/master/public/assets/header.svg?sanitize=true)

## WEB-APP Link
> http://ec2-35-183-40-144.ca-central-1.compute.amazonaws.com:3000

## WEB-APP Features
* User authentication and email validation with Firebase
* Real-time team messaging with firebase
* Backend database actions handled with Rethinkdb
* User can create groups and join groups by sharing the unique key 
* Users can join other chat rooms by sharing their chat room key 
* Users can upload files and documents
* Members can be added through the group member tab 

![Notebook Description](https://github.com/Mahesh-Ranaweera/SOFE_4630U_FinalGroupProject/blob/master/public/assets/description.svg?sanitize=true)

## Setting up the application for local testing
### Install Prerequisite
- NodeJS
- Rethinkdb

1. Setting up Rethinkdb(Open-source database for realtime web)
```
    sudo pip install "mitmproxy==0.18.2"
    mitmproxy

    sudo apt-get install build-essential protobuf-compiler python \
                     libprotobuf-dev libcurl4-openssl-dev \
                     libboost-all-dev libncurses5-dev \
                     libjemalloc-dev wget m4

    wget https://download.rethinkdb.com/dist/rethinkdb-2.3.6.tgz
    tar xf rethinkdb-2.3.6.tgz

    cd rethinkdb-2.3.6
    ./configure --allow-fetch
    sudo make
    sudo make install
```

2. Download the source files
```sh
    https://github.com/Mahesh-Ranaweera/SOFE_4630U_FinalGroupProject

    cd SOFE_4630U_FinalGroupProject

    npm install
    npm install nodemon -g
```

3. Start Rethinkdb and WebApp
```sh
    rethinkdb

    nodemon npm start

    >> Navigate to localhost:3000 : for the webapp
    >> Navigate to localhost:8080 : for the rethinkdb admin site
```


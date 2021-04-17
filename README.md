# SOEN Solutions

The system is implemented using an MVC architure with the 3 major components of MVC as follows:

- The model which is implemented using a PostgreSQL database.
- The controller (back-end) which is implemented as a Node.js application running with Express.js.
- The view (front-end) which is implemented as a React.js application.


The website is hosted on Heroku. The project is made to be compatible with docker-compose for local development.
Simply install docker-compose and run the following command:
```
docker-compose up
```

The project may also be run locally through npm. To do so, you will need to start two different instances, one for the back-end API and one for the front-end application.
```
# API instance
cd api
npm install
npm run start-local

# Front-end instance
cd app
npm install
npm start
```

The Testing for both the front and back-end is implemented using Jest. The folder structure for the project is as follows:

- The `app` folder contains all of the files pertaining to the front-end. The source code for the React application is found in `app/src`.
- The front-end is split into several subfolders, for ease-of-use. The main views of the project will be found in `app/src/views` and `app/src/components/managers`.  

- The `api` folder contains all of the files pertaining to the back-end API. The source code for the Node.js application is found in `api/src`.
- The main controller files are located in the `api/src/routes` folder. 
- Any reusable code accross controllers is situated in the `api/src/helpers` and is access mainly in the various controllers.

[Link to the latest deployed version](http://soen.solutions)

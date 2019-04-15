const db = require("../index.js");

function up() {
    const text = "CREATE TABLE TypesOfUsers (\
            ID serial PRIMARY KEY,\
            typeUser VARCHAR(10) NOT NULL\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE Users (\
            ID serial PRIMARY KEY,\
            login VARCHAR(15) NOT NULL UNIQUE,\
            nikname VARCHAR(20),\
            passwordHash VARCHAR(255) NOT NULL,\
            IDtypeUser integer NOT NULL DEFAULT 2 CONSTRAINT Users_fk0 REFERENCES TypesOfUsers(ID),\
            email VARCHAR(30) NOT NULL UNIQUE,\
            bestResult DECIMAL,\
            avatar VARCHAR(100),\
            background VARCHAR(100),\
            avto VARCHAR(100),\
            runaway VARCHAR(100),\
            menu VARCHAR(15)\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE Categories (\
            ID serial PRIMARY KEY,\
            category VARCHAR(30) NOT NULL UNIQUE\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE Themes (\
            ID serial PRIMARY KEY,\
            IDcategory integer NOT NULL CONSTRAINT Themes_fk0 REFERENCES Categories(ID),\
            theme VARCHAR(30) NOT NULL UNIQUE\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE Texts (\
            ID serial PRIMARY KEY,\
            IDtheme integer NOT NULL CONSTRAINT Texts_fk0 REFERENCES Themes(ID),\
            body TEXT NOT NULL UNIQUE\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE Rewards (\
            ID serial PRIMARY KEY,\
            IDuser integer NOT NULL CONSTRAINT Rewards_fk0 REFERENCES Users(ID),\
            nameReward VARCHAR(50) NOT NULL\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE Results (\
            ID serial PRIMARY KEY,\
            IDuser integer NOT NULL CONSTRAINT Results_fk0 REFERENCES Users(ID),\
            position integer NOT NULL,\
            time integer NOT NULL,\
            IDtext integer NOT NULL CONSTRAINT Results_fk1 REFERENCES Texts(ID)\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE AvailableDefaultTopics (\
            IDtypeUser integer NOT NULL CONSTRAINT AvailableDefaultTopics_fk0 REFERENCES TypesOfUsers(ID),\
            IDtheme integer NOT NULL CONSTRAINT AvailableDefaultTopics_fk1 REFERENCES Themes(ID),\
            CONSTRAINT AvailableDefaultTopics_pk PRIMARY KEY (IDtypeUser,IDtheme)\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE AvailableAdditionalTopics (\
            ID serial PRIMARY KEY,\
            IDuser integer NOT NULL CONSTRAINT AvailableAdditionalTopics_fk0 REFERENCES Users(ID),\
            IDtheme integer NOT NULL CONSTRAINT AvailableAdditionalTopics_fk1 REFERENCES Themes(ID)\
        ) WITH (\
          OIDS=FALSE\
        );\
        \
        CREATE TABLE AccessRightsOfModerators (\
            ID serial PRIMARY KEY,\
            IDuser integer NOT NULL CONSTRAINT AccessRightsOfModerators_fk0 REFERENCES Users(ID),\
            IDtheme integer NOT NULL CONSTRAINT AccessRightsOfModerators_fk1 REFERENCES Themes(ID)\
        ) WITH (\
          OIDS=FALSE\
        );";

    db.query(text)
        .then(() => {})
        .catch((err) => console.error('Error executing query', err));
};

function down() {
    const text = "ALTER TABLE Users DROP CONSTRAINT IF EXISTS Users_fk0;\
        \
        ALTER TABLE Themes DROP CONSTRAINT IF EXISTS Themes_fk0;\
        \
        ALTER TABLE Texts DROP CONSTRAINT IF EXISTS Texts_fk0;\
        \
        ALTER TABLE Rewards DROP CONSTRAINT IF EXISTS Rewards_fk0;\
        \
        ALTER TABLE Results DROP CONSTRAINT IF EXISTS Results_fk0;\
        \
        ALTER TABLE Results DROP CONSTRAINT IF EXISTS Results_fk1;\
        \
        ALTER TABLE AvailableDefaultTopics DROP CONSTRAINT IF EXISTS AvailableDefaultTopics_fk0;\
        \
        ALTER TABLE AvailableDefaultTopics DROP CONSTRAINT IF EXISTS AvailableDefaultTopics_fk1;\
        \
        ALTER TABLE AvailableAdditionalTopics DROP CONSTRAINT IF EXISTS AvailableAdditionalTopics_fk0;\
        \
        ALTER TABLE AvailableAdditionalTopics DROP CONSTRAINT IF EXISTS AvailableAdditionalTopics_fk1;\
        \
        ALTER TABLE AccessRightsOfModerators DROP CONSTRAINT IF EXISTS AccessRightsOfModerators_fk0;\
        \
        ALTER TABLE AccessRightsOfModerators DROP CONSTRAINT IF EXISTS AccessRightsOfModerators_fk1;\
        \
        DROP TABLE IF EXISTS TypesOfUsers;\
        \
        DROP TABLE IF EXISTS Users;\
        \
        DROP TABLE IF EXISTS Categories;\
        \
        DROP TABLE IF EXISTS Themes;\
        \
        DROP TABLE IF EXISTS Texts;\
        \
        DROP TABLE IF EXISTS Rewards;\
        \
        DROP TABLE IF EXISTS Results;\
        \
        DROP TABLE IF EXISTS AvailableDefaultTopics;\
        \
        DROP TABLE IF EXISTS AvailableAdditionalTopics;\
        \
        DROP TABLE IF EXISTS AccessRightsOfModerators;";

    db.query(text)
        .then(() => {})
        .catch((err) => console.error('Error executing query', err));
};

module.exports = { up, down };

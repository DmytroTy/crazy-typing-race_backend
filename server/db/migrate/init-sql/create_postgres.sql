CREATE TABLE TypesOfUsers (
	ID serial PRIMARY KEY,
	typeUser VARCHAR(10) NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE Users (
	ID serial PRIMARY KEY,
	login VARCHAR(15) NOT NULL UNIQUE,
	nikname VARCHAR(20),
	passwordHash VARCHAR(255) NOT NULL,
	IDtypeUser integer NOT NULL DEFAULT 2 CONSTRAINT Users_fk0 REFERENCES TypesOfUsers(ID),
	email VARCHAR(30) NOT NULL UNIQUE,
	bestResult DECIMAL,
	avatar VARCHAR(100),
	background VARCHAR(100),
	avto VARCHAR(100),
	runaway VARCHAR(100),
	menu VARCHAR(15)
) WITH (
  OIDS=FALSE
);



CREATE TABLE Categories (
	ID serial PRIMARY KEY,
	category VARCHAR(30) NOT NULL UNIQUE
) WITH (
  OIDS=FALSE
);



CREATE TABLE Themes (
	ID serial PRIMARY KEY,
	IDcategory integer NOT NULL CONSTRAINT Themes_fk0 REFERENCES Categories(ID),
	theme VARCHAR(30) NOT NULL,
	CONSTRAINT themes_theme_unk UNIQUE(IDcategory, theme)
) WITH (
  OIDS=FALSE
);



CREATE TABLE Texts (
	ID serial PRIMARY KEY,
	IDtheme integer NOT NULL CONSTRAINT Texts_fk0 REFERENCES Themes(ID),
	body TEXT NOT NULL UNIQUE
) WITH (
  OIDS=FALSE
);



CREATE TABLE Rewards (
	ID serial PRIMARY KEY,
	IDuser integer NOT NULL CONSTRAINT Rewards_fk0 REFERENCES Users(ID),
	nameReward VARCHAR(50) NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE Results (
	ID serial PRIMARY KEY,
	IDuser integer NOT NULL CONSTRAINT Results_fk0 REFERENCES Users(ID),
	position integer NOT NULL,
	time integer NOT NULL,
	IDtext integer NOT NULL CONSTRAINT Results_fk1 REFERENCES Texts(ID)
) WITH (
  OIDS=FALSE
);



CREATE TABLE AvailableDefaultTopics (
	IDtypeUser integer NOT NULL CONSTRAINT AvailableDefaultTopics_fk0 REFERENCES TypesOfUsers(ID),
	IDtheme integer NOT NULL CONSTRAINT AvailableDefaultTopics_fk1 REFERENCES Themes(ID),
	CONSTRAINT AvailableDefaultTopics_pk PRIMARY KEY (IDtypeUser,IDtheme)
) WITH (
  OIDS=FALSE
);



CREATE TABLE AvailableAdditionalTopics (
	ID serial PRIMARY KEY,
	IDuser integer NOT NULL CONSTRAINT AvailableAdditionalTopics_fk0 REFERENCES Users(ID),
	IDtheme integer NOT NULL CONSTRAINT AvailableAdditionalTopics_fk1 REFERENCES Themes(ID)
) WITH (
  OIDS=FALSE
);



CREATE TABLE AccessRightsOfModerators (
	ID serial PRIMARY KEY,
	IDuser integer NOT NULL CONSTRAINT AccessRightsOfModerators_fk0 REFERENCES Users(ID),
	IDtheme integer NOT NULL CONSTRAINT AccessRightsOfModerators_fk1 REFERENCES Themes(ID)
) WITH (
  OIDS=FALSE
);





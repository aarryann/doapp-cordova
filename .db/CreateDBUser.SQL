CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'appuserpw';

CREATE DATABASE hectre;

GRANT ALL ON hectre.* TO appuser@localhost;

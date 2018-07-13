CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'appuserpw';

ALTER USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'appuserpw';

CREATE DATABASE hectre;

GRANT ALL ON hectre.* TO appuser@localhost;

#-- use mysql
#-- select * from user
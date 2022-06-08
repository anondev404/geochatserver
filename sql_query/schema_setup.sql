#WARNING HERE
drop database GEOCHATSERVER;

create database if not exists GEOCHATSERVER;

use GEOCHATSERVER;

create table if not exists GEOUSER(
user_id int auto_increment,
username varchar(50) not null,
password varchar(256) not null,
constraint user_id_pk primary key(user_id),
constraint username_un unique key(username)
);

create table if not exists GEOPOINT(
plus_code varchar(20),
lattitude numeric(17,14) not null,
longitude numeric(17,14) not null,
constraint plus_code_pk primary key(plus_code)
);

create table if not exists TOPIC(
plus_code varchar(20),
topic_id int auto_increment,
topic_title varchar(250) not null,
constraint topic_id_pk primary key(topic_id),
constraint plus_code_fk foreign key(plus_code) references GEOPOINT(plus_code)
);

create table if not exists SUBTOPIC(
topic_id int,
sub_topic_id int auto_increment,
sub_topic_title varchar(250) not null,
sub_topic_description varchar(4000) not null,
constraint sub_topic_id_pk primary key(sub_topic_id),
constraint topic_id_fk foreign key(topic_id) references TOPIC(topic_id)
);

create table if not exists SUBTOPICMETADISCUSS(
meta_discuss_id int auto_increment,
sub_topic_id int,
sender_id int,
receiver_id int,
message varchar(250) not null,
message_timestamp timestamp default current_timestamp(),
constraint meta_discuss_id_pk primary key(meta_discuss_id),
constraint sub_topic_id_fk foreign key(sub_topic_id) references SUBTOPIC(sub_topic_id),
constraint sender_id_fk foreign key(sender_id) references GEOUSER(user_id),
constraint receiver_id_fk foreign key(receiver_id) references GEOUSER(user_id)
);










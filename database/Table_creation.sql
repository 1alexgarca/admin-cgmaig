actividadesCREATE TABLE usuarios (
	id_user INT AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(50) Not null,
    materno VARCHAR(50) NOT NULL,
    paterno VARCHAR(50) NOT NULL,
    email varchar(50) unique not NULL,
    telefono VARCHAR(20) NOT NULL,
    rol enum('supervisor', 'trabajador') NOT NULL,
    password_hash varchar(100) not null,
    activo TINYINT default true
);

CREATE TABLE actividades (
	id_activities int auto_increment primary key,
    proyecto varchar(100) not null,
    actividad VARCHAR(100) NOT NULL,
    descripcion text,
    horas_trabajadas INT,
    avance INT,
    usuario_asignado int not null,
    usuario_creador int not null,
    fecha_creacion date DEFAULT,
    fecha_limite date,
    prioridad enum('alta', 'media', 'baja') default 'media',
    foreign key (usuario_asignado) references usuarios(id_user),
    foreign key (usuario_creador) references usuarios(id_user)
);

CREATE TABLE comentarios (
	id_comentarios int auto_increment primary key,
    actividad_id int not null,
    usuario_id int not null,
    contenido text not null,
    fecha datetime default current_timestamp,
    foreign key (actividad_id) references actividades(id_activities),
    foreign key (usuario_id) references usuarios(id_user)
);

CREATE TABLE proyectos (
	id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
	name_proyect TEXT NOT NULL,
	descripcion TEXT NOT null
);

CREATE TABLE notificaciones(
	id_push int auto_increment primary key,
    usuario_id int not null,
    mensaje text not null,
    tipo enum('asignacion', 'vencimiento', 'ajuste') not null,
    leido boolean default false,
    fecha datetime default current_timestamp,
    foreign key (usuario_id) references usuarios(id_user)
);



















const express = require("express");
const app = express();
const exceljs = require("exceljs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;

const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGODB_CONNECTION, {
    dbName: "assitencia"
})
.then(() => {
    console.log("Conexion exitosa");
});

const alumno = new Schema({
    _id: {
        type: Schema.Types.ObjectId
    },
    nombre: {
        type: String
    },
    edad: {
        type: Number
    },
    genero: {
        type: String
    }
});

const asistencia = new Schema({
    idAlumno: {
        type: Schema.Types.ObjectId
    },
    Asistencia: {
        type: Boolean
    },
    Permiso: {
        type: Boolean
    },
    fecha: {
        type: String
    }
},
{
    versionKey: false
});

const Alumnos = mongoose.model("alumnos", alumno);
const Asistencia = mongoose.model("asistencias", asistencia);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const estudiantes = [
    {
        nombre: "Alex",
        edad: 4,
        genero: "M"
    },
    {
        nombre: "Carlos",
        edad: 4,
        genero: "M"
    },
    {
        nombre: "Jose",
        edad: 4,
        genero: "M"
    },
    {
        nombre: "Pedro",
        edad: 6,
        genero: "M"
    },
    {
        nombre: "Josue",
        edad: 5,
        genero: "M"
    },
    {
        nombre: "Daniela",
        edad: 4,
        genero: "F"
    }
];
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/estudiantes", async (req, res) => {
    // res.send(estudiantes);
    let fecha = req.body.fecha;
    console.log(fecha);
    const alumnos = await Alumnos.find();

    let asistencia = await Asistencia.aggregate([
        {
            $lookup:
            {
                from: "alumnos",
                localField: "idAlumno",
                foreignField: "_id",
                as: "alumno"
            }
        },
        {
            $match: {fecha: fecha}
        }
    ]);

    if (asistencia.length > 0) {
        asistencia.sort((a, b) => {
                var textA = a.alumno[0].nombre.toUpperCase();
                var textB = b.alumno[0].nombre.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        res.send(asistencia);
    } else {
        let alumnos = await Alumnos.find();
        alumnos.forEach(async alumno => {
            await Asistencia.create({
                idAlumno: alumno._id,
                Asistencia: false,
                Permiso: false,
                fecha: fecha
            });
        });
        let asistencia = await Asistencia.aggregate([
            {
                $lookup:
                {
                    from: "alumnos",
                    localField: "idAlumno",
                    foreignField: "_id",
                    as: "alumno"
                }
            },
            {
                $match: {fecha: fecha}
            }
        ]);
        res.send(asistencia);
    }

    // req.send(data);
});

app.post("/exportarEstudiantes", async (req, res) => {
    let estudiantes = req.body;
    console.log(estudiantes);

    let asistencia = await Asistencia.aggregate([
        {
            $lookup: {
                from: "alumnos",
                localField: "idAlumno",
                foreignField: "_id",
                as: "alumno"
            }
        }
    ]);
    let asistenciaFecha = [];
    asistenciaFecha = asistencia.map(alumnos => {
        let fecha = new Date(alumnos.fecha);

        if (fecha.getMonth() + 1 == 3) {
            alumnos.nombre = alumnos.alumno[0].nombre;
            alumnos.edad = alumnos.alumno[0].edad;
            return alumnos;
        }
    });

    asistenciaFecha = asistenciaFecha.filter(asistencia => {
        if (asistencia !== undefined) {
            return asistencia;
        }
    });

    console.log(asistenciaFecha);

    let fechas = asistenciaFecha.sort((a, b) => {
        let fecha1 = a.fecha;
        let fecha2 = b.fecha;
        if (fecha1 > fecha2) {
            return 1;
        } else if (fecha2 > fecha1) {
            return -1;
        } else {
            return 0;
        }
    });

    console.log(fechas);

    fechas = fechas.map(fecha => {
        let date = new Date(fecha.fecha);
        let semana = date.getDay() + 1;
        switch(semana) {
            case 1:
                fecha.semana = "L";
                break;
            case 2:
                fecha.semana = "M";
                breack;
            case 3:
                fecha.semana = "M";
                break;
            case 4:
                fecha.semana = "J";
                break;
            case 5:
                fecha.semana = "V";
                break;
        }
        return fecha;
    });

    console.log(fechas);

    // console.log(asistenciaFecha);
    let semanas = [];

    fechas.forEach(fecha => {
        let dia = fecha.fecha;
        if (semanas.includes(dia) == false) {
            semanas.push(dia);
        }
    });

    let dias = [];

    semanas = semanas.map(semana => {
        let dia = new Date(semana).getDay() + 1;
        let date = new Date(semana).getDate() + 1;
        dias.push(date);
        switch(dia) {
            case 1:
                return "L";
            case 2:
                return "M";
            case 3:
                return "M";
            case 4:
                return "J";
            case 5:
                return "V";
        }
    });

    let alumnos4anios = [];
    let alumnos5anios = [];
    let alumnos6anios = [];

    alumnos4anios = fechas.filter(semana => {
        if (semana.edad == 4) {
            return semana;
        }
    });

    alumnos5anios = fechas.filter(semana => {
        if (semana.edad == 5) {
            return semana;
        }
    });

    alumnos6anios = fechas.filter(semana => {
        if (semana.edad == 6) {
            return semana;
        }
    });
    
    const alumnos4anios1 = [];

    alumnos4anios.forEach((fecha) => {
    if (!alumnos4anios1[fecha.nombre]) {
        alumnos4anios1[fecha.nombre] = [fecha.nombre];
    }

    let asistencia = "";
    if (fecha.Asistencia) {
        asistencia = ".";
    } else if (fecha.Permiso) {
        asistencia = "P";
    } else {
        asistencia = "SP";
    }
    alumnos4anios1[fecha.nombre].push(asistencia);
        });

    const arregloAlumnos4anios = Object.values(alumnos4anios1);
    console.log(arregloAlumnos4anios);

    const alumnos5anios1 = [];

    alumnos5anios.forEach((fecha) => {
    if (!alumnos5anios1[fecha.nombre]) {
        alumnos5anios1[fecha.nombre] = [fecha.nombre];
    }

    let asistencia = "";
    if (fecha.Asistencia) {
        asistencia = ".";
    } else if (fecha.Permiso) {
        asistencia = "P";
    } else {
        asistencia = "SP";
    }
    alumnos5anios1[fecha.nombre].push(asistencia);
        });
        
    const arregloAlumnos5anios = Object.values(alumnos5anios1);
    console.log(arregloAlumnos5anios);

    const alumnos6anios1 = [];

    alumnos6anios.forEach((fecha) => {
    if (!alumnos6anios1[fecha.nombre]) {
        alumnos6anios1[fecha.nombre] = [fecha.nombre];
    }

    let asistencia = "";
    if (fecha.Asistencia) {
        asistencia = ".";
    } else if (fecha.Permiso) {
        asistencia = "P";
    } else {
        asistencia = "SP";
    }
    alumnos6anios1[fecha.nombre].push(asistencia);
        });
        
    const arregloAlumnos6anios = Object.values(alumnos6anios1);
    console.log(arregloAlumnos6anios);
    // console.log(semanas);
    // console.log(dias);
        let crearExcel = async(alumnos, edad) => {
            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet("Estudiantes");
            const path = "./files";
        
            worksheet.columns = [
                {header: "Nombres", key: "nombre", width: 30}
            ];
            let contador = 1;
            dias.forEach(dia => {
                contador++;
                worksheet.spliceColumns(contador, 0, [dia]);
            });
        
            worksheet.getColumn(2).width = 4;
            worksheet.getColumn(2).alignment = {horizontal: "center"};
            worksheet.getColumn(3).width = 4;
            worksheet.getColumn(3).alignment = {horizontal: "center"};
        
            alumnos.forEach(alumno => {
                worksheet.addRow(alumno);
            });
            const data = await workbook.xlsx.writeFile(path + "/estudiantes "+edad+".xlsx");
        }

        await crearExcel(arregloAlumnos4anios, "4 años");
        await crearExcel(arregloAlumnos5anios, "5 años");
        await crearExcel(arregloAlumnos6anios, "6 años");

    res.send({
        ok: true
    });
});

app.post("/actualizarAsistencia", async (req, res) => {
    console.log(req.body.permiso);
    let alumno = req.body.alumno;
    let estudiante = await Alumnos.find({nombre: alumno});
    let idEstudiante = estudiante[0]._id;
    console.log(idEstudiante);
    let update = await Asistencia.updateOne({idAlumno: idEstudiante}, {Permiso: req.body.permiso, Asistencia: req.body.asistencia});
    console.log(update.matchedCount);
    console.log(update.modifiedCount);
    res.send();
});

app.listen(port, () => {
    console.log("Servidor ejecutandose");
});

